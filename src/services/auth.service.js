import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

import { generatetoken } from "../utils/generatetoken.js";
import { STATUS_CODES } from "../constants/statusCodes.js";
import { MESSAGES } from "../constants/messages.js";
import { sendResetEmail } from "../utils/sendEmail.js";
import { AppError } from "../utils/appError.js";

import redisClient from "../config/redis.js";

export const signupService = async ({
  name,
  email,
  password,
}) => {
  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(
      MESSAGES.USER_ALREADY_EXISTS,
      STATUS_CODES.BAD_REQUEST
    );
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPass,
  });
};

export const loginService = async ({
  email,
  password,
}) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new AppError(
      MESSAGES.REGISTER_FIRST,
      STATUS_CODES.BAD_REQUEST
    );
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    throw new AppError(
      MESSAGES.INVALID_CREDENTIALS,
      STATUS_CODES.UNAUTHORIZED
    );
  }

  return generateAuthTokens(user);
};

export const forgotPasswordService = async ({
  email,
}) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new AppError(
      MESSAGES.USER_NOT_FOUND,
      STATUS_CODES.NOT_FOUND
    );
  }

  const token = generatetoken(
    {
      id: user.id,
      email: user.email,
      type: "password-reset",
    },
    "15m",
    process.env.RESET_TOKEN_SECRET
  );

  await redisClient.set(
    `reset:${user.id}`,
    token,
    {
      EX: 15 * 60,
    }
  );

  await sendResetEmail(user.email, token);
};

export const resetPasswordService = async ({
  password,
  userId,
}) => {
  const hashedPass = await bcrypt.hash(password, 10);

  await User.update(
    {
      password: hashedPass,
    },
    {
      where: { id: userId },
    }
  );

  await redisClient.del(`reset:${userId}`);
};

export const refreshTokenService = async (
  refreshToken
) => {
  if (!refreshToken) {
    throw new AppError(
      "Refresh token not found",
      STATUS_CODES.UNAUTHORIZED
    );
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (await redisClient.get(`blacklist:${decoded.jti}`)) {
      throw new AppError(
        "Invalid or expired refresh token",
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new AppError(
        MESSAGES.USER_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    const accessToken = generatetoken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      "15m",
      process.env.ACCESS_TOKEN_SECRET
    );

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Invalid or expired refresh token",
      STATUS_CODES.UNAUTHORIZED
    );
  }
};

export const logoutService = async (user, refreshToken) => {
  const { jti, exp } = user;

  const currentTime = Math.floor(Date.now() / 1000);

  const remainingTime = exp - currentTime;

  if (remainingTime > 0) {
    await redisClient.set(
      `blacklist:${jti}`,
      "true",
      {
        EX: remainingTime,
      }
    );
  }

  if (refreshToken) {
    try {
      const decodedRefreshToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const refreshRemainingTime =
        decodedRefreshToken.exp - currentTime;

      if (refreshRemainingTime > 0) {
        await redisClient.set(
          `blacklist:${decodedRefreshToken.jti}`,
          "true",
          { EX: refreshRemainingTime }
        );
      }
    } catch {
      
    }
  }
};

export const generateAuthTokens = (user) => {
  const accessToken = generatetoken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    "15m",
    process.env.ACCESS_TOKEN_SECRET
  );

  const refreshToken = generatetoken(
    {
      id: user.id,
    },
    "7d",
    process.env.REFRESH_TOKEN_SECRET
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};