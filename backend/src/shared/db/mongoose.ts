import mongoose from "mongoose";
import { env } from "../../config/env";

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.MONGO_URI, {
    maxPoolSize: 20
  });
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
