import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { UserModel } from "../users/user.model";
import { ApiError } from "../../shared/utils/api-error";
import { comparePassword, hashPassword, sha256 } from "../../shared/utils/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../../shared/utils/jwt";
import { parseDurationToMs } from "../../shared/utils/time";
import { env } from "../../config/env";
import { RefreshTokenModel } from "./refresh-token.model";
import { deactivateDeviceTokens } from "../users/users.service";

const buildTokenResponse = async (
  user: { _id: Types.ObjectId; email: string },
  metadata: { userAgent?: string; ip?: string }
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    email: user.email
  });

  const rawRefreshToken = signRefreshToken({
    sub: user._id.toString(),
    tokenId: new Types.ObjectId().toString()
  });

  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: sha256(rawRefreshToken),
    expiresAt: new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)),
    userAgent: metadata.userAgent ?? null,
    ip: metadata.ip ?? null
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken
  };
};

export const register = async (payload: {
  email: string;
  password: string;
  name: string;
  userAgent?: string;
  ip?: string;
}) => {
  const exists = await UserModel.exists({ email: payload.email.toLowerCase() });
  if (exists) {
    throw new ApiError(StatusCodes.CONFLICT, "Email already in use");
  }

  const passwordHash = await hashPassword(payload.password);
  const user = await UserModel.create({
    email: payload.email.toLowerCase(),
    passwordHash,
    name: payload.name
  });

  const tokens = await buildTokenResponse(
    { _id: user._id, email: user.email },
    { userAgent: payload.userAgent, ip: payload.ip }
  );

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name
    },
    ...tokens
  };
};

export const login = async (payload: {
  email: string;
  password: string;
  userAgent?: string;
  ip?: string;
}) => {
  const user = await UserModel.findOne({ email: payload.email.toLowerCase() });
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const valid = await comparePassword(payload.password, user.passwordHash);
  if (!valid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const tokens = await buildTokenResponse(
    { _id: user._id, email: user.email },
    { userAgent: payload.userAgent, ip: payload.ip }
  );

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name
    },
    ...tokens
  };
};

export const refresh = async (refreshToken: string, metadata: { userAgent?: string; ip?: string }) => {
  verifyRefreshToken(refreshToken);

  const tokenHash = sha256(refreshToken);
  const stored = await RefreshTokenModel.findOne({ tokenHash });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
  }

  const user = await UserModel.findById(stored.userId);
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
  }

  stored.revokedAt = new Date();
  await stored.save();

  return buildTokenResponse(
    { _id: user._id, email: user.email },
    { userAgent: metadata.userAgent, ip: metadata.ip }
  );
};

export const logout = async (refreshToken: string, userId?: Types.ObjectId): Promise<void> => {
  await RefreshTokenModel.updateOne(
    { tokenHash: sha256(refreshToken), revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );

  if (userId) {
    await deactivateDeviceTokens(userId);
  }
};
