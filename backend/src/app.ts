import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { authRoutes } from "./modules/auth/auth.routes";
import { commentsRoutes } from "./modules/comments/comments.routes";
import { postsRoutes } from "./modules/posts/posts.routes";
import { reactionsRoutes } from "./modules/reactions/reactions.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { errorHandler } from "./shared/middleware/error";
import { notFoundHandler } from "./shared/middleware/not-found";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((v) => v.trim()),
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/v1/auth", authRoutes);
app.use("/v1/posts", postsRoutes);
app.use("/v1/posts", reactionsRoutes);
app.use("/v1/posts", commentsRoutes);
app.use("/v1/users", usersRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
