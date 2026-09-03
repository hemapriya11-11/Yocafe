import Jwt from "jsonwebtoken";

import { MESSAGES } from "../constants/messages.js";

import { STATUS_CODES } from "../constants/statusCodes.js";

export const verifytoken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(STATUS_CODES.UNAUTHORIZED).send(MESSAGES.TOKEN_REQUIRED);
  }

  const [scheme, token] = authHeader.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .send(MESSAGES.INVALID_TOKEN_FORMAT);
  }

  try {
    const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .send(MESSAGES.INVALID_OR_EXPIRED_TOKEN);
  }
};
