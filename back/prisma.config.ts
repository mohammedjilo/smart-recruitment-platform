/// <reference types="node" />

import "dotenv/config";
import { env } from "node:process";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env["DIRECT_URL"] ?? env["DATABASE_URL"],
  },
});
