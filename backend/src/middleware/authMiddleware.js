import User from "../models/User.js";
import { verifyToken } from "../utils/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { forbidden, unauthorized } from "../utils/errors.js";

function getTokenFromRequest(request) {
  const authorizationHeader = request.headers.authorization || "";

  if (!authorizationHeader.startsWith("Bearer ")) {
    throw unauthorized();
  }

  return authorizationHeader.slice("Bearer ".length);
}

export const requireAuth = asyncHandler(async (request, _response, next) => {
  const token = getTokenFromRequest(request);
  const payload = verifyToken(token);
  const user = await User.findById(payload.sub).populate("clubs");

  if (!user) {
    throw unauthorized("User account no longer exists.");
  }

  request.user = user;
  next();
});

export function requireManager(request, _response, next) {
  if (!request.user || !["manager", "admin"].includes(request.user.role)) {
    throw forbidden("Manager or admin access is required.");
  }

  next();
}

export function requireAdmin(request, _response, next) {
  if (!request.user || request.user.role !== "admin") {
    throw forbidden("Admin access is required.");
  }

  next();
}
