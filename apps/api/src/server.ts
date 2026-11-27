import { createServer } from "node:http";
import { app } from "./app.js";
import { loadEnv } from "./config/env.js";

const { PORT: port } = loadEnv(process.env);
const server = createServer(app);

server.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
