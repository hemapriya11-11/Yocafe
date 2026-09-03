import { Router } from "express";

import {
signupSchema,
loginSchema,
forgotPasswordSchema,
resetPasswordSchema,
} from "../validations/authJoi.js";

import {
signup,
login,
forgotPassword,
resetPassword,
refreshToken,
logout,
} from "../controllers/auth.controller.js";

import { verifyResetToken } from "../middleware/verifyresettoken.js";
import { validate } from "../middleware/validate.js";
import { verifytoken } from "../middleware/validatetoken.js";
import { rateLimiter } from "../middleware/ratelimiter.js";

const router = Router();

router.post(
"/signup",
rateLimiter,
validate(signupSchema, "body"),
signup
);

router.post(
"/login",
rateLimiter,
validate(loginSchema, "body"),
login
);

router.post(
"/forgotpassword",
rateLimiter,
validate(forgotPasswordSchema, "body"),
forgotPassword
);

router.post(
"/resetpassword/:token",
rateLimiter,
verifyResetToken,
validate(resetPasswordSchema, "body"),
resetPassword
);

router.post("/refresh-token", refreshToken);

router.post(
"/logout",
verifytoken,
logout
);

export default router;
