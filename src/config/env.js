import "dotenv/config";

const required = [
  "DB_HOST",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "RESET_TOKEN_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "CLIENT_URL",
];

const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const port = Number(process.env.PORT || 5000);
const dbPort = Number(process.env.DB_PORT || 3306);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port");
}

if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
  throw new Error("DB_PORT must be a valid TCP port");
}

export { port, dbPort };
