export type LogLevel = "info" | "warn" | "error";

export type StructuredLogRecord = {
  timestamp: string;
  level: LogLevel;
  event: string;
  environment: string;
  [key: string]: unknown;
};

type LogSink = (record: StructuredLogRecord) => void;

const defaultSink: LogSink = (record) => {
  const serialized = JSON.stringify(record);
  if (record.level === "error") console.error(serialized);
  else if (record.level === "warn") console.warn(serialized);
  else console.log(serialized);
};

let sink: LogSink = defaultSink;

const toSafeString = (value: unknown) => {
  try {
    return String(value);
  } catch {
    return "[unprintable error value]";
  }
};

const redactSensitiveText = (text: string) =>
  text
    .replace(/\bBearer\s+[^\s,;"']+/gi, "Bearer [REDACTED]")
    .replace(
      /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
      "[REDACTED_TOKEN]"
    )
    .replace(
      /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s"'<>]+/gi,
      "[REDACTED_DATABASE_URL]"
    )
    .replace(
      /\bhttps?:\/\/[^\s"'<>]*(?:access[_-]?token|refresh[_-]?token|api[_-]?key|secret|password)=[^\s"'&<>]+[^\s"'<>]*/gi,
      "[REDACTED_URL]"
    )
    .replace(
      /(["']?)(password|passwd|access[_ -]?token|refresh[_ -]?token|api[_ -]?key|secret|authorization|cookie)\1["']?(\s*[:=]\s*)["']?([^,\s;"'}]+)/gi,
      '$1$2$1$3[REDACTED]'
    )
    .slice(0, 12000);

export const getErrorDiagnostics = (error: unknown) => {
  const diagnostics =
    error instanceof Error
      ? {
          errorName: error.name,
          errorMessage: redactSensitiveText(error.message),
          ...(error.stack ? { stack: redactSensitiveText(error.stack) } : {}),
        }
      : {
          errorName: typeof error,
          errorMessage: redactSensitiveText(toSafeString(error)),
        };
  const causes: Array<{ name: string; message: string; stack?: string }> = [];
  let current = error instanceof Error ? error.cause : undefined;
  let depth = 0;

  while (current !== undefined && depth < 5) {
    if (current instanceof Error) {
      causes.push({
        name: current.name,
        message: redactSensitiveText(current.message),
        ...(current.stack
          ? { stack: redactSensitiveText(current.stack) }
          : {}),
      });
      current = current.cause;
    } else {
      causes.push({
        name: typeof current,
        message: redactSensitiveText(toSafeString(current)),
      });
      break;
    }
    depth += 1;
  }

  return { ...diagnostics, cause: causes };
};

export const setStructuredLogSink = (nextSink: LogSink): (() => void) => {
  const previousSink = sink;
  sink = nextSink;
  return () => {
    sink = previousSink;
  };
};

export const writeStructuredLog = (
  level: LogLevel,
  event: string,
  fields: Record<string, unknown> = {}
) => {
  sink({
    timestamp: new Date().toISOString(),
    level,
    event,
    environment: process.env.NODE_ENV ?? "development",
    ...fields,
  });
};
