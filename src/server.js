import express from "express";
import cookieParser from "cookie-parser";
import { port } from "./config/env.js";

import sequelize from "./config/database.js";

import authRouter from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cors from "cors"

const app = express();
app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.CLIENT_URL ,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  return res.status(200).send("OK");
});

app.use("/auth", authRouter);

app.use(errorHandler);

const startServer = async () => {
try {
await sequelize.authenticate();
console.log("MySQL connected");


app.listen(port, () => {
  console.log(
    `Server running on port ${port}`
  );
});


} catch (error) {
console.error("Failed to start server:", error);
process.exit(1);
}
};

startServer();
