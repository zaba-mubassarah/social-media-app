import bcrypt from "bcryptjs";
import crypto from "crypto";
import { env } from "../../config/env";

export const hashPassword = async (plain: string): Promise<string> =>
  bcrypt.hash(plain, env.BCRYPT_ROUNDS);

export const comparePassword = async (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);

export const sha256 = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");
