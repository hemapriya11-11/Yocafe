import { Sequelize } from "sequelize";
import { dbPort } from "./env.js";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: dbPort,
    dialect: "mysql",
    logging: false,
  }
);

export default sequelize;