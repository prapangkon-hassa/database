import "dotenv/config";
import { Pool } from "pg";

let pool: Pool | undefined;

// ใช้ pool เดียวร่วมกันทั้ง backend เปิดการเชื่อมต่อเมื่อเริ่ม query
export function getPool() {
  if (process.env.ENABLE_DATABASE !== "true") {
    throw Object.assign(
      new Error("Database is not enabled. Follow docs/BACKEND_LESSONS.md."),
      { status: 503 },
    );
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("YOUR_")) {
    throw Object.assign(
      new Error("Configure DATABASE_URL in backend/.env first."),
      { status: 503 },
    );
  }
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 5000,
    });
    pool.on("error", (error) =>
      console.error("Idle database connection failed:", error.name),
    );
  }
  return pool;
}

export async function disconnectDatabase() {
  await pool?.end();
  pool = undefined;
}
