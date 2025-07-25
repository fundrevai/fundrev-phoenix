from dataclasses import dataclass
from enum import Enum, auto
from typing import Any, Optional, Protocol

import strawberry
from sqlalchemy import and_, desc, func, nulls_last, select
from sqlalchemy.orm import InstrumentedAttribute
from sqlalchemy.sql.expression import Select
from strawberry import UNSET
from typing_extensions import assert_never

import phoenix.trace.v1 as pb
from phoenix.db import models
from phoenix.server.api.types.pagination import CursorSortColumnDataType
from phoenix.server.api.types.SortDir import SortDir
from phoenix.trace.schemas import SpanID


@strawberry.enum
class SpanColumn(Enum):
    startTime = auto()
    endTime = auto()
    latencyMs = auto()
    tokenCountTotal = auto()
    tokenCountPrompt = auto()
    tokenCountCompletion = auto()
    cumulativeTokenCountTotal = auto()
    cumulativeTokenCountPrompt = auto()
    cumulativeTokenCountCompletion = auto()
    cumulativeTokenCostTotal = auto()
    tokenCostTotal = auto()

    @property
    def column_name(self) -> str:
        return f"{self.name}_span_sort_column"

    def as_orm_expression(self, joined_table: Optional[Any] = None) -> Any:
        expr: Any
        if self is SpanColumn.startTime:
            expr = models.Span.start_time
        elif self is SpanColumn.endTime:
            expr = models.Span.end_time
        elif self is SpanColumn.latencyMs:
            expr = models.Span.latency_ms
        elif self is SpanColumn.tokenCountTotal:
            expr = models.Span.llm_token_count_total
        elif self is SpanColumn.tokenCountPrompt:
            expr = models.Span.llm_token_count_prompt
        elif self is SpanColumn.tokenCountCompletion:
            expr = models.Span.llm_token_count_completion
        elif self is SpanColumn.cumulativeTokenCountTotal:
            expr = (
                models.Span.cumulative_llm_token_count_prompt
                + models.Span.cumulative_llm_token_count_completion
            )
        elif self is SpanColumn.cumulativeTokenCountPrompt:
            expr = models.Span.cumulative_llm_token_count_prompt
        elif self is SpanColumn.cumulativeTokenCountCompletion:
            expr = models.Span.cumulative_llm_token_count_completion
        elif self is SpanColumn.tokenCostTotal:
            expr = models.SpanCost.total_cost
        elif self is SpanColumn.cumulativeTokenCostTotal:
            assert joined_table is not None
            expr = joined_table.c.cumulative_total_cost
        else:
            assert_never(self)
        return expr.label(self.column_name)

    @property
    def data_type(self) -> CursorSortColumnDataType:
        if (
            self is SpanColumn.cumulativeTokenCountTotal
            or self is SpanColumn.cumulativeTokenCountPrompt
            or self is SpanColumn.cumulativeTokenCountCompletion
        ):
            return CursorSortColumnDataType.INT
        if (
            self is SpanColumn.latencyMs
            or self is SpanColumn.tokenCountTotal
            or self is SpanColumn.tokenCountPrompt
            or self is SpanColumn.tokenCountCompletion
            or self is SpanColumn.tokenCostTotal
            or self is SpanColumn.cumulativeTokenCostTotal
        ):
            return CursorSortColumnDataType.FLOAT
        if self is SpanColumn.startTime or self is SpanColumn.endTime:
            return CursorSortColumnDataType.DATETIME
        assert_never(self)

    def join_tables(self, stmt: Select[Any]) -> tuple[Select[Any], Any]:
        """
        If needed, joins tables required for the sort column.
        """
        if self is SpanColumn.tokenCostTotal:
            return stmt.join_from(
                models.Span,
                models.SpanCost,
                onclause=models.SpanCost.span_rowid == models.Span.id,
            ), models.SpanCost
        if self is SpanColumn.cumulativeTokenCostTotal:
            trace_costs = (
                select(
                    func.sum(models.SpanCost.total_cost).label("cumulative_total_cost"),
                    models.SpanCost.trace_rowid,
                )
                .select_from(models.SpanCost)
                .group_by(models.SpanCost.trace_rowid)
                .subquery()
            )
            stmt = stmt.join(
                trace_costs,
                onclause=models.Span.trace_rowid == trace_costs.c.trace_rowid,
            )
            return stmt, trace_costs
        return stmt, None


@strawberry.enum
class EvalAttr(Enum):
    score = "score"
    label = "label"

    @property
    def column_name(self) -> str:
        return f"{self.value}_eval_sort_column"

    @property
    def orm_expression(self) -> Any:
        expr: InstrumentedAttribute[Any]
        if self is EvalAttr.score:
            expr = models.SpanAnnotation.score
        elif self is EvalAttr.label:
            expr = models.SpanAnnotation.label
        else:
            assert_never(self)
        return expr.label(self.column_name)

    @property
    def data_type(self) -> CursorSortColumnDataType:
        if self is EvalAttr.label:
            return CursorSortColumnDataType.STRING
        if self is EvalAttr.score:
            return CursorSortColumnDataType.FLOAT
        assert_never(self)


@strawberry.input
class EvalResultKey:
    name: str
    attr: EvalAttr


class SupportsGetSpanEvaluation(Protocol):
    def get_span_evaluation(self, span_id: SpanID, name: str) -> Optional[pb.Evaluation]: ...


@dataclass(frozen=True)
class SpanSortConfig:
    stmt: Select[Any]
    orm_expression: Any
    dir: SortDir
    column_name: str
    column_data_type: CursorSortColumnDataType


@strawberry.input(
    description="The sort key and direction for span connections. Must "
    "specify one and only one of either `col` or `evalResultKey`."
)
class SpanSort:
    col: Optional[SpanColumn] = UNSET
    eval_result_key: Optional[EvalResultKey] = UNSET
    dir: SortDir

    def update_orm_expr(self, stmt: Select[Any]) -> SpanSortConfig:
        if (col := self.col) and not self.eval_result_key:
            stmt, joined_table = col.join_tables(stmt)
            expr = col.as_orm_expression(joined_table)
            stmt = stmt.add_columns(expr)
            if self.dir == SortDir.desc:
                expr = desc(expr)
            return SpanSortConfig(
                stmt=stmt.order_by(nulls_last(expr)),
                orm_expression=col.as_orm_expression(joined_table),
                dir=self.dir,
                column_name=col.column_name,
                column_data_type=col.data_type,
            )
        if (eval_result_key := self.eval_result_key) and not col:
            eval_name = eval_result_key.name
            eval_attr = eval_result_key.attr
            expr = eval_result_key.attr.orm_expression
            stmt = stmt.add_columns(expr)
            if self.dir == SortDir.desc:
                expr = desc(expr)
            stmt = stmt.join(
                models.SpanAnnotation,
                onclause=and_(
                    models.SpanAnnotation.span_rowid == models.Span.id,
                    models.SpanAnnotation.name == eval_name,
                ),
            ).order_by(expr)
            return SpanSortConfig(
                stmt=stmt,
                orm_expression=eval_result_key.attr.orm_expression,
                dir=self.dir,
                column_name=eval_attr.column_name,
                column_data_type=eval_attr.data_type,
            )
        raise ValueError("Exactly one of `col` or `evalResultKey` must be specified on `SpanSort`.")
