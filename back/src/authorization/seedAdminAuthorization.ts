import { prisma } from "../config/db.js";
import {
  ADMIN_ROLE_DEFINITIONS,
  PERMISSION_DEFINITIONS,
} from "./permissions.js";

export async function seedAdminAuthorization() {
  const permissionEntries = Object.entries(PERMISSION_DEFINITIONS).map(
    ([code, definition]) => ({
      code,
      resource: definition.resource,
      action: definition.action,
      description: definition.description,
      active: true,
    })
  );

  const roleEntries = Object.values(ADMIN_ROLE_DEFINITIONS).map((role) => ({
    name: role.name,
    description: role.description,
    active: true,
    permissions: role.permissions,
  }));

  await prisma.$transaction(
    async (transaction) => {
      for (const permission of permissionEntries) {
        await transaction.permission.upsert({
          where: { code: permission.code },
          update: {
            resource: permission.resource,
            action: permission.action,
            description: permission.description,
            active: true,
          },
          create: permission,
        });
      }

      for (const role of roleEntries) {
        const adminRole = await transaction.adminRole.upsert({
          where: { name: role.name },
          update: {
            description: role.description,
            active: true,
          },
          create: {
            name: role.name,
            description: role.description,
            active: true,
          },
        });

        const permissionIds: Array<{ id: string }> = [];

        for (const permissionCode of role.permissions) {
          const permission = await transaction.permission.findUnique({
            where: { code: permissionCode },
            select: { id: true },
          });

          if (permission) {
            permissionIds.push(permission);
          }
        }

        await transaction.adminRolePermission.deleteMany({
          where: { roleId: adminRole.id },
        });

        const validPermissionIds = permissionIds
          .filter(
            (permission): permission is { id: string } => permission !== null
          )
          .map((permission) => permission.id);

        if (validPermissionIds.length > 0) {
          await transaction.adminRolePermission.createMany({
            data: validPermissionIds.map((permissionId) => ({
              roleId: adminRole.id,
              permissionId,
            })),
            skipDuplicates: true,
          });
        }
      }
    },
    { timeout: 60_000, maxWait: 60_000 }
  );

  return {
    permissions: permissionEntries.length,
    roles: roleEntries.length,
  };
}

if (require.main === module) {
  seedAdminAuthorization()
    .then((result) => {
      console.log(
        `Seeded ${result.permissions} admin permissions and ${result.roles} admin roles.`
      );
      return prisma.$disconnect();
    })
    .catch((error) => {
      console.error("Failed to seed admin authorization metadata.", error);
      return prisma.$disconnect().finally(() => (process.exitCode = 1));
    });
}
