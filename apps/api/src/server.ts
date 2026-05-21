import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import cookieParser from "cookie-parser";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { accessControlRouter } from "./routes/access-control";
import { formsRouter } from "./routes/forms";
import { publicFormsRouter } from "./routes/public-forms";
import { authOpenApiPaths } from "./openapi-auth-paths";

export const app = express();
app.set("trust proxy", 1);
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "ChaiForms API",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

openApiDocument.paths = {
  ...authOpenApiPaths,
  ...openApiDocument.paths,
};

const allowedOrigins = [env.APP_URL, "http://localhost:3000", "http://127.0.0.1:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV !== "prod") {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  return res.json({ message: "ChaiForms API is up and running..." });
});

app.get("/health", (_req, res) => {
  return res.json({ message: "ChaiForms server is healthy", healthy: true });
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (_req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

// REST auth routes (must be before tRPC OpenAPI catch-all)
app.use("/api", publicFormsRouter);
app.use("/api", authRouter);
app.use("/api", usersRouter);
app.use("/api", accessControlRouter);
app.use("/api", formsRouter);

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
