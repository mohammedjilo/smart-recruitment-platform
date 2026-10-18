import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";
import { AppError } from "../utils/appError.js";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
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
