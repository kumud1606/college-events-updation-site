import Club from "../models/Club.js";
import User from "../models/User.js";
import { comparePassword, hashPassword, signToken } from "../utils/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { badRequest, unauthorized } from "../utils/errors.js";
import { serializeUser } from "../utils/serializers.js";

async function resolveClubs(clubIds = []) {
  if (!Array.isArray(clubIds) || clubIds.length === 0) {
    return [];
  }

  return Club.find({ _id: { $in: clubIds } });
}

export const register = asyncHandler(async (request, response) => {
  const { enrollment, name, email, password, clubIds = [] } = request.body;

  if (!enrollment || !name || !email || !password) {
    throw badRequest("Enrollment, name, email, and password are required.");
  }

  const existingUser = await User.findOne({
    $or: [{ enrollment }, { email: email.toLowerCase() }]
  });

  if (existingUser) {
    throw badRequest("A user with this enrollment number or email already exists.");
  }

  const clubs = await resolveClubs(clubIds);
  const passwordHash = await hashPassword(password);

  const user = await User.create({
    enrollment,
    name,
    email: email.toLowerCase(),
    passwordHash,
    onboardingComplete: false,
    clubs: clubs.map((club) => club._id)
  });

  const populatedUser = await User.findById(user._id).populate("clubs");

  response.status(201).json({
    token: signToken(populatedUser),
    user: serializeUser(populatedUser)
  });
});

export const login = asyncHandler(async (request, response) => {
  const { enrollment, email, password, name } = request.body;
  const identity = enrollment || email;

  if (!identity || !password) {
    throw badRequest("Enrollment or email, plus password, is required.");
  }

  const user = await User.findOne(
    enrollment ? { enrollment } : { email: String(email).toLowerCase() }
  ).populate("clubs");

  if (!user) {
    throw unauthorized("Invalid credentials.");
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw unauthorized("Invalid credentials.");
  }

  if (typeof name === "string" && name.trim() && user.name !== name.trim()) {
    user.name = name.trim();
    await user.save();
  }

  response.json({
    token: signToken(user),
    user: serializeUser(user)
  });
});

export const getCurrentUser = asyncHandler(async (request, response) => {
  response.json({
    user: serializeUser(request.user)
  });
});

export const updateMyClubs = asyncHandler(async (request, response) => {
  const { clubIds = [] } = request.body;

  if (!Array.isArray(clubIds)) {
    throw badRequest("clubIds must be an array.");
  }

  const clubs = await resolveClubs(clubIds);
  request.user.clubs = clubs.map((club) => club._id);
  request.user.onboardingComplete = true;
  await request.user.save();
  await request.user.populate("clubs");

  response.json({
    user: serializeUser(request.user)
  });
});
