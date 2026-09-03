import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import sequelize from "./config/database.js";
import redisClient from "./config/redis.js";

import authRouter from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cors from "cors"

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);

app.use(errorHandler);

const startServer = async () => {
try {
await sequelize.authenticate();
console.log("MySQL connected");


await redisClient.connect();
console.log("Redis connected");

app.listen(process.env.PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT}`
  );
});


} catch (error) {
console.error("Failed to start server:", error);
process.exit(1);
}
};

startServer();
