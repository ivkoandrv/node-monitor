import { socketService } from "./socketService";
import morgan from "morgan";
import express, { NextFunction, Response, Request } from "express";
import bodyParser from "body-parser";
import { createServer } from "node:http";
import getImportPath from "@/modules/systemDetect";
import path from "path";
import { fileURLToPath } from "node:url";
import paths from "@/modules/paths.util";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROUTES_DIR = paths.routesDir;

function createExpressApp(): {
  app: express.Express;
  httpServer: ReturnType<typeof createServer>;
} {
  const app = express();
  app.set('trust proxy', true);

  const httpServer = createServer(app);
  socketService.initialize(httpServer);

  app.use(
    morgan((tokens, req, res) => {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens["response-time"](req, res),
        "ms",
      ].join(" ");
    })
  );

  return { app, httpServer };
}

function configureApiRouter(): express.Router {
  const apiRouter = express.Router();

  apiRouter.use(express.urlencoded({ extended: true }));
  apiRouter.use(express.json());

  apiRouter.use((req: Request, res: Response, next: NextFunction) => {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, GET, PATCH, POST, PUT",
      "Content-Type": "application/json; charset=utf-8",
    });
    next();
  });

  return apiRouter;
}

async function loadRoutes(apiRouter: express.Router): Promise<void> {
  const loadedControllers = new Set<string>();
  const files = fs.readdirSync(ROUTES_DIR);

  for (const routeFile of files) {
    if (!routeFile.endsWith(".route.ts")) continue;

    const routePath = routeFile.replace(".route.ts", "");
    if (loadedControllers.has(routePath)) continue;

    const modulePath = path.resolve(ROUTES_DIR, routeFile);
    const importPath = getImportPath(modulePath);

    const controller = await import(importPath);

    console.log(routePath);

    if (typeof controller.default === "function") {
      controller.default(`/${routePath}`, apiRouter);
      console.log(`Route /api/${routePath} loaded successfully.`);
    } else {
      console.error(`Failed to load route: ${routeFile} - No default export.`);
    }

    loadedControllers.add(routePath);
  }
}

function startServer(
  httpServer: ReturnType<typeof createServer>,
  app: express.Express
): void {
  const port = process.env.ADMIN_API_PORT || 3500;

  // Global error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Internal Server Error");
  });

  httpServer.listen(port, () => console.log(`Listening on port ${port}`));
}

/**
 * Execution script
 */
export default async function initializeApp(): Promise<void> {
  const { app, httpServer } = createExpressApp();
  // launchClient(app);

  const apiRouter = configureApiRouter();
  await loadRoutes(apiRouter);

  app.use("/api", apiRouter);
  apiRouter.use((_, res: Response) => {
    res.status(404).send("API route not found");
  });

  startServer(httpServer, app);
}
