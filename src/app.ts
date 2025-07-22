import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import config from "config";

import routerv1 from "@router/router";
import { logger } from "@lib/pino-log";
import packageJson from "../package.json";

const app = express();

// Middleware สำหรับ parse JSON
app.use(express.json());
app.use(cors());

app.get("/", (req : Request, res: Response, next: NextFunction) => {
  res.json({
    success: true,
    version: packageJson.version,
    message: "Server is Running",
  });
});

app.use("/api/v1", routerv1);

// เริ่มเซิร์ฟเวอร์
app.listen(config.get("app.port"), () => {
  logger.info(`~ Service version ${packageJson.version} running on port : ${config.get("app.port")}`);
});

export { app };