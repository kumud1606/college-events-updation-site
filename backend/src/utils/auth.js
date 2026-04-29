import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { unauthorized } from "./errors.js";

const DEFAULT_JWT_EXPIRES_IN = "7d";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function signToken(user) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role
    },
    jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN
    }
  );
}

export function verifyToken(token) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  try {
    return jwt.verify(token, jwtSecret);
  } catch (_error) {
    throw unauthorized("Invalid or expired token.");
  }
}
