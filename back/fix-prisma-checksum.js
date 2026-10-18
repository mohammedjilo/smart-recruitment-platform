require("dotenv").config();
const fs = require("fs");
const crypto = require("crypto");
const { Client } = require("pg");

(async () => {
  const migrationFile =
    "prisma/migrations/20260916120000_add_admin_workspace_permissions/migration.sql";
  const migrationName = "20260916120000_add_admin_workspace_permissions";
  const checksum = crypto
    .createHash("sha256")
    .update(fs.readFileSync(migrationFile))
    .digest("hex");

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const res = await client.query(
    "UPDATE _prisma_migrations SET checksum = $1 WHERE migration_name = $2 RETURNING migration_name, checksum",
    [checksum, migrationName]
  );

  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
})();
