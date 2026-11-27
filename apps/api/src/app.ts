import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";

interface RequestLog {
  event: "http_request";
  requestId: string;
  method: string;
  route: string;
  status: number;
  durationMs: number;
}

interface AppOptions {
  isReady: () => Promise<boolean>;
  writeRequestLog: (record: RequestLog) => void;
}

const handleError: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(new Error("HTTP response failed"));
    return;
  }
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? error.status
      : undefined;
  if (status === 400 || status === 413 || status === 415) {
    response.status(status).json({ status: "invalid_request" });
    return;
  }
  response.status(500).json({ status: "error" });
};

export function createApp({ isReady, writeRequestLog }: AppOptions) {
  const app = express();
  app.disable("x-powered-by");

  app.use((request, response, next) => {
    const requestId = randomUUID();
    const started = performance.now();
    response.setHeader("X-Request-Id", requestId);
    response.once("finish", () => {
      const route: unknown = request.route?.path;
      writeRequestLog({
        event: "http_request",
        requestId,
        method: request.method,
        route: typeof route === "string" ? route : "unmatched",
        status: response.statusCode,
        durationMs: Math.round(performance.now() - started),
      });
    });
    next();
  });

  app.use(express.json({ inflate: false }));

  const live: RequestHandler = (_request, response) => {
    response.status(200).json({ status: "ok" });
  };
  app.get("/health", live);
  app.get("/healthz", live);

  app.get("/readyz", async (_request, response) => {
    if (await isReady()) {
      response.status(200).json({ status: "ready" });
      return;
    }
    response.status(503).json({ status: "not_ready" });
  });

  app.use(handleError);
  return app;
}
