import { setTimeout as sleep } from "node:timers/promises";
import mongoose from "mongoose";
import { createClient } from "redis";
import { createReadiness } from "./readiness.js";

export function startDatastores(mongoUri: string, redisUrl: string) {
  const mongo = mongoose.createConnection();
  const redis = createClient({
    url: redisUrl,
    disableOfflineQueue: true,
    commandsQueueMaxLength: 4,
    pingInterval: 5000,
    socket: {
      connectTimeout: 1000,
      socketTimeout: 15000,
      // The default strategy stops reconnecting after a socket timeout.
      reconnectStrategy: (retries) => Math.min(100 * 2 ** retries, 2000),
    },
  });

  // Drivers can emit connection errors whose messages contain connection details.
  // The health contract exposes only whether both checks succeeded.
  mongo.on("error", () => {});
  redis.on("error", () => {});

  async function connectMongo() {
    for (;;) {
      try {
        await mongo.openUri(mongoUri, {
          serverSelectionTimeoutMS: 1000,
          connectTimeoutMS: 1000,
        });
        return;
      } catch {
        await sleep(2000, undefined, { ref: false });
      }
    }
  }

  void connectMongo();
  void redis.connect().catch(() => {});

  return createReadiness(
    async () => {
      if (mongo.readyState !== 1 || !mongo.db) return false;
      const result = await mongo.db.admin().ping({ timeoutMS: 750 });
      return result.ok === 1;
    },
    async () => redis.isReady && (await redis.ping()) === "PONG",
  );
}
