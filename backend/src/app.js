import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";

import { corsOptions } from "./config/corsConfig.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";

import eventRoute from "./routes/eventRoute.js";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/api/v1/tlc", eventRoute);

app.use(notFound);
app.use(errorHandler);

export default app;
