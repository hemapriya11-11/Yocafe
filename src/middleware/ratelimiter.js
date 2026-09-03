import { STATUS_CODES } from "../constants/statusCodes.js";

const requestCounts = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

export const rateLimiter = (req, res, next) => {
  const now = Date.now();
  const existing = requestCounts.get(req.ip);
  const entry = existing && now - existing.startedAt < WINDOW_MS
    ? existing
    : { startedAt: now, count: 0 };

  entry.count += 1;
  requestCounts.set(req.ip, entry);

  if (entry.count > MAX_REQUESTS) {
    return res
      .status(STATUS_CODES.TOO_MANY_REQUESTS)
      .send("Too many requests. Please try again later.");
  }

  return next();
};