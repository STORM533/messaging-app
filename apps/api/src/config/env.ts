import mongoose from "mongoose";
import { z } from "zod";

function isMongoUri(value: string): boolean {
  try {
    new mongoose.mongo.MongoClient(value);
    return true;
  } catch {
    return false;
  }
}

function isRedisUrl(value: string): boolean {
  try {
    const url = new URL(value);
    decodeURIComponent(url.username);
    decodeURIComponent(url.password);
    return (
      (url.protocol === "redis:" || url.protocol === "rediss:") &&
      url.hostname.length > 0 &&
      /^\/?\d*$/.test(url.pathname) &&
      Number.isSafeInteger(Number(url.pathname.slice(1)))
    );
  } catch {
    return false;
  }
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535))
    .default(3000),
  MONGODB_URI: z.string().min(1).refine(isMongoUri),
  REDIS_URL: z.string().min(1).refine(isRedisUrl),
});

export function loadEnv(source: NodeJS.ProcessEnv) {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join("."))),
    ];
    throw new Error(`Invalid API environment: ${fields.join(", ")}`);
  }

  return result.data;
}
