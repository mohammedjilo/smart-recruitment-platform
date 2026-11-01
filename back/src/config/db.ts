import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";
import { AppError } from "../utils/appError.js";

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL or DIRECT_URL environment variable.");
}

const pool = new pg.Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 30_000,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: [],
});
const connectDB = async () => {
  try {
    await prisma.$connect();
  } catch (error: unknown) {
    throw new AppError(
      "Database connection failed",
      503,
      "SERVICE_UNAVAILABLE",
      undefined,
      { cause: error, source: "database", classification: "unexpected" }
    );
  }
};
const disconnectDB = async () => {
  await prisma.$disconnect();
};
export { prisma, connectDB, disconnectDB };
