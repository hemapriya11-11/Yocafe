import jwt from "jsonwebtoken";

import User from "../models/User.js";
import redisClient from "../config/redis.js";

import { AppError } from "../utils/appError.js";
import { MESSAGES } from "../constants/messages.js";
import { STATUS_CODES } from "../constants/statusCodes.js";

export const verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(
      token,
      process.env.RESET_TOKEN_SECRET
    );

    if (decoded.type !== "password-reset") {
      throw new AppError(
        MESSAGES.INVALID_TOKEN,
        STATUS_CODES.BAD_REQUEST
      );
    }

    const storedToken = await redisClient.get(
      `reset:${decoded.id}`
    );

    if (!storedToken || storedToken !== token) {
      throw new AppError(
        MESSAGES.INVALID_TOKEN,
        STATUS_CODES.BAD_REQUEST
      );
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new AppError(
        MESSAGES.USER_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};