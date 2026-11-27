import { createServer } from "node:http";
import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { startDatastores } from "./infrastructure/datastores.js";

const { PORT: port, MONGODB_URI, REDIS_URL } = loadEnv(process.env);
const isReady = startDatastores(MONGODB_URI, REDIS_URL);
const app = createApp({
  isReady,
  writeRequestLog: (record) => console.log(JSON.stringify(record)),
});
const server = createServer(app);

server.listen(port, () => {
  console.log(JSON.stringify({ event: "api_listening", port }));
});
