import Markdown from "react-markdown";
import Plot from "react-plotly.js";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import parse from "html-react-parser";
import { Data, Layout } from "plotly.js";
import remarkGfm from "remark-gfm";
import { css } from "@emotion/react";

import { safelyParseJSON } from "@phoenix/utils/jsonUtils";

import { PrettyText } from "../utility";

import { useMarkdownMode } from "./MarkdownDisplayContext";
import { markdownCSS } from "./styles";
import { MarkdownDisplayMode } from "./types";

export function MarkdownBlock({
  children,
  mode,
}: {
  children: string;
  mode: MarkdownDisplayMode;
}) {
  if (mode === "table") {
    return DisplayTable({ children });
  }
  if (mode === "html") {
    return <div>{parse(children)}</div>;
  }
  if (mode === "plot") {
    const content = safelyParseJSON(children)?.json;
    return <GeneralPlot content={content} legendSize={10} />;
  }
  return mode === "markdown" ? (
    <div css={markdownCSS}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        css={css`
          margin: var(--ac-global-dimension-static-size-200);
        `}
      >
        {children}
      </Markdown>
    </div>
  ) : (
    <PrettyText
      preCSS={css`
        margin: var(--ac-global-dimension-static-size-200);
      `}
    >
      {children}
    </PrettyText>
  );
}

export function ConnectedMarkdownBlock({ children }: { children: string }) {
  const { mode } = useMarkdownMode();
  return <MarkdownBlock mode={mode}>{children}</MarkdownBlock>;
}

function DisplayTable({ children }: { children: string }) {
  type ColumnType = "date" | "number" | "percentage";

  interface ColumnConfig {
    header: string;
    accessorKey: string;
    columnType?: ColumnType;
  }

  type RowData = Record<string, number | string | boolean | null>;
  const raw = safelyParseJSON(children)?.json;
  const tableData = {
    columns: Array.isArray(raw?.columns) ? (raw.columns as ColumnConfig[]) : [],
    data: Array.isArray(raw?.data) ? (raw.data as RowData[]) : [],
  };
  const columns: ColumnDef<RowData>[] = tableData.columns.map((col) => ({
    accessorKey: col.accessorKey,
    header: col.header,
    cell: ({ getValue }) => {
      const value = getValue();
      switch (col.columnType) {
        case "date":
          // expecting ISO string
          return <div>{format(parseISO(value as string), "MM/dd/yyyy")}</div>;
        case "number":
          return (
            <div>
              {new Intl.NumberFormat("en-US", {
                maximumFractionDigits: 1,
              }).format(value as number)}
            </div>
          );
        case "percentage":
          return <div>{`${Number(value as number)?.toFixed(1) || "-"} %`}</div>;
        default:
          return <div>{value as React.ReactNode}</div>;
      }
    },
  }));

  const table = useReactTable({
    data: tableData.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // if no columns, just render raw children
  if (!columns.length) {
    return <div>{children}</div>;
  }

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface GeneralPlotProps {
  content: {
    data?: Data[];
    layout?: Partial<Layout>;
  };
  legendSize?: number;
}
const GeneralPlot: React.FC<GeneralPlotProps> = ({ content, legendSize }) => {
  const data: Data[] = Array.isArray(content?.data) ? content?.data : [];
  const incomingLayout: Partial<Layout> = content?.layout || {};
  // 2) Detect trace type & area/stack usage
  const firstType = data[0]?.type;
  // @ts-expect-error: Plotly.js types are not perfect
  const isArea = !!data[0]?.stackgroup;
  const barmode = incomingLayout?.barmode;
  // 3) Gradient stops
  const gradients = [
    { stop: "#4172F170", start: "#4172F100" },
    { stop: "#5BE1AD70", start: "#5BE1AD00" },
  ];
  // 4) Mutate traces in-place
  data.forEach((trace, i) => {
    // remove any incoming marker config
    // @ts-expect-error: Plotly.js types are not perfect
    delete trace.marker;

    // common hovertemplate
    // @ts-expect-error: Plotly.js types are not perfect
    if (trace?.text && (trace?.text as string[] | number[])?.length) {
      if (firstType === "pie") {
        // @ts-expect-error: Plotly.js types are not perfect
        trace.hovertemplate = "<b>%{label}:</b> %{text}<extra></extra>";
      } else {
        // @ts-expect-error: Plotly.js types are not perfect
        trace.hovertemplate = `<b>${trace?.name}</b>: %{text}<extra></extra>`;
      }
    }

    if (firstType !== "pie" && isArea) {
      // area‐style (stackgroup) fills
      // @ts-expect-error: Plotly.js types are not perfect
      trace.line = {
        // @ts-expect-error: Plotly.js types are not perfect
        ...(trace?.line as object),
        color: gradients[i % gradients.length].stop,
        shape: "spline",
      };
      // @ts-expect-error: Plotly.js types are not perfect
      trace.fill = "tonexty";
      // @ts-expect-error: Plotly.js types are not perfect
      trace.fillgradient = {
        type: "vertical",
        colorscale: [
          [0, gradients[i % gradients?.length]?.start],
          [1, gradients[i % gradients?.length]?.stop],
        ],
      };
    }
  });

  // 5) Legend positioning
  const isPie = firstType === "pie";
  const legendOrientation: "h" | "v" = isPie ? "v" : "h";
  const legendX = isPie ? 0.5 : 0.5; // center for both
  // const legendXAnchor: string = "center";

  // 6) Build our layout, layering on any incoming props last
  const layout: Partial<Layout> = {
    ...incomingLayout,
    barmode,
    hovermode: isPie ? incomingLayout?.hovermode : "x unified",
    xaxis: { tickfont: { family: "Satoshi, sans-serif" } },
    yaxis: {
      tickfont: {
        family: "Satoshi, sans-serif",
        size: 14,
        // gridcolor: "#eeeeee",
      },
    },
    margin: { t: 20, b: 80, l: 30, r: 20, pad: 0 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    modebar: {
      activecolor: "#114fee",
      bgcolor: "transparent",
      color: "grey",
      orientation: "v",
    },
    legend: {
      orientation: legendOrientation,
      x: legendX,
      // xanchor: legendXAnchor,
      traceorder: "normal",
      font: {
        family: "Satoshi, sans-serif",
        size: legendSize,
        color: "#141414",
      },
    },
    hoverlabel: {
      bordercolor: "transparent",
      bgcolor: "#FFF",
      font: { family: "Satoshi, sans-serif" },
    },
    template: {
      data: {
        bar: [
          { marker: { color: "#1A437A" }, textfont: { color: "#FCFCFC" } },
          { marker: { color: "#004BAF" }, textfont: { color: "#FCFCFC" } },
          { marker: { color: "#22569B" }, textfont: { color: "#FCFCFC" } },
          { marker: { color: "#0C75FF" }, textfont: { color: "#FCFCFC" } },
          { marker: { color: "#316EC1" }, textfont: { color: "#FCFCFC" } },
          { marker: { color: "#317DE3" }, textfont: { color: "#FCFCFC" } },
          { marker: { color: "#5898ED" }, textfont: { color: "#FCFCFC" } },
          { marker: { color: "#445F82" }, textfont: { color: "#FCFCFC" } },
          { marker: { color: "#7DB1F6" }, textfont: { color: "#141414" } },
          { marker: { color: "#9DC8FF" }, textfont: { color: "#141414" } },
        ],
        pie: [
          {
            marker: {
              colors: [
                "#1A437A",
                "#004BAF",
                "#22569B",
                "#0C75FF",
                "#316EC1",
                "#317DE3",
                "#5898ED",
                "#445F82",
                "#7DB1F6",
                "#9DC8FF",
              ],
            },
          },
        ],
        scatter: gradients.map((g) => ({ line: { color: g?.stop } })),
      },
    },
  };
  return (
    // @ts-expect-error: Plotly.js types are not perfect
    <Plot
      data={data}
      layout={layout}
      config={{
        responsive: true,
        locale: "us",
        displaylogo: false,
        displayModeBar: true,
        modeBarButtonsToRemove: [
          "autoScale2d",
          "lasso2d",
          "select2d",
          "zoomIn2d",
          "zoomOut2d",
        ],
      }}
      style={{ width: "100%", height: "100%" }}
      useResizeHandler
    />
  );
};
