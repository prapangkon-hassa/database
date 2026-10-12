import { createApp } from "./app.js";
import { disconnectDatabase } from "./lib/db.js";

const port = Number(process.env.PORT || 4000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("Invalid PORT");
const server = createApp().listen(port, "127.0.0.1", () => {
  console.log(`API: http://localhost:${port}/api/health`);
});

function shutdown() {
  server.close(() => {
    void disconnectDatabase().finally(() => process.exit(0));
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
