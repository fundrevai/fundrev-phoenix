import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { SEMRESATTRS_PROJECT_NAME } from "@arizeai/openinference-semantic-conventions";
import { HeadersOptions } from "openapi-fetch";
import { OpenInferenceSimpleSpanProcessor } from "@arizeai/openinference-vercel";

/**
 * Creates a provider that exports traces to Phoenix.
 */
export function createProvider({
  projectName,
  baseUrl,
  headers,
}: {
  projectName: string;
  headers: HeadersOptions;
  /**
   * The base URL of the Phoenix. Doesn't include the /v1/traces path.
   */
  baseUrl: string;
}) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [SEMRESATTRS_PROJECT_NAME]: projectName,
    }),
    spanProcessors: [
      // We opt to use the OpenInferenceSimpleSpanProcessor instead of the SimpleSpanProcessor
      // Since so many AI applications use the AI SDK
      new OpenInferenceSimpleSpanProcessor({
        exporter: new OTLPTraceExporter({
          url: `${baseUrl}/v1/traces`,
          headers: Array.isArray(headers)
            ? Object.fromEntries(headers)
            : headers,
        }),
      }),
    ],
  });

  return provider;
}

/**
 * For dry runs we create a provider that doesn't export traces.
 */
export function createNoOpProvider() {
  const provider = new NodeTracerProvider({});

  return provider;
}
