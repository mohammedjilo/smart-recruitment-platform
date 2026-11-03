import { z } from "zod";
import { prisma } from "../../config/db.js";
import { ADMIN_ROLE_NAMES } from "../../authorization/permissions.js";
import { AppError } from "../../utils/appError.js";
import { cloudinaryUploadImage } from "../../utils/cloudinary.js";
import { updateAdminProfileSchema } from "@smart-recruitment/validation";
import { resolveLocation } from "../../utils/locationData.js";

type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;

const profileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  country: true,
  countryCode: true,
  state: true,
  stateCode: true,
  city: true,
  cityGeonameId: true,
  profilePicId: true,
  profilePicUrl: true,
  role: true,
  adminRoleAssignments: {
    where: { adminRole: { active: true } },
    select: { adminRole: { select: { name: true } } },
  },
} as const;

const assertProfileEditable = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      adminRoleAssignments: {
        where: { adminRole: { active: true } },
        select: { adminRole: { select: { name: true } } },
      },
    },
  });

  if (!user || user.role !== "ADMIN") {
    throw new AppError("Admin account not found", 404, "RESOURCE_NOT_FOUND");
  }

  if (
    user.adminRoleAssignments.some(
      ({ adminRole }) => adminRole.name === ADMIN_ROLE_NAMES.DEMO_ADMIN,
    )
  ) {
    throw new AppError(
      "Demo admin profiles cannot be changed",
      403,
      "FORBIDDEN",
    );
  }
};

export const getAdminProfile = async (userId: string) => {
  await assertProfileEditable(userId);

  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });

  if (!profile) {
    throw new AppError("Admin account not found", 404, "RESOURCE_NOT_FOUND");
  }

  return {
    ...profile,
    adminRoleNames: profile.adminRoleAssignments.map(
      ({ adminRole }) => adminRole.name,
    ),
    adminRoleAssignments: undefined,
  };
};

export const updateAdminProfile = async (
  userId: string,
  input: UpdateAdminProfileInput,
) => {
  await assertProfileEditable(userId);

  const {
    country,
    countryCode,
    state,
    stateCode,
    city,
    cityGeonameId,
    ...profileFields
  } = input;
  const locationProvided =
    country !== undefined ||
    countryCode !== undefined ||
    state !== undefined ||
    stateCode !== undefined ||
    city !== undefined ||
    cityGeonameId !== undefined;
  let location = {};
  if (locationProvided) {
    if (!country || !countryCode || !city || !cityGeonameId) {
      throw new AppError(
        "Select a country and city.",
        400,
        "VALIDATION_ERROR",
        {
          countryCode: "Select a valid country.",
          cityGeonameId: "Select a city from the list.",
        },
      );
    }
    location = await resolveLocation({
      country,
      countryCode,
      state,
      stateCode,
      city,
      cityGeonameId,
    });
  }

  return prisma.$transaction(async (transaction) => {
    const profile = await transaction.user.update({
      where: { id: userId },
      data: { ...profileFields, ...location },
      select: profileSelect,
    });

    return {
      ...profile,
      adminRoleNames: profile.adminRoleAssignments.map(
        ({ adminRole }) => adminRole.name,
      ),
      adminRoleAssignments: undefined,
    };
  });
};

export const updateAdminProfilePicture = async (
  userId: string,
  file: Express.Multer.File,
) => {
  await assertProfileEditable(userId);
  const uploadedImage = await cloudinaryUploadImage(file.buffer, file.mimetype);

  return prisma.$transaction(async (transaction) => {
    const profile = await transaction.user.update({
      where: { id: userId },
      data: {
        profilePicId: uploadedImage.public_id,
        profilePicUrl: uploadedImage.secure_url,
      },
      select: profileSelect,
    });

    return {
      ...profile,
      adminRoleNames: profile.adminRoleAssignments.map(
        ({ adminRole }) => adminRole.name,
      ),
      adminRoleAssignments: undefined,
    };
  });
};
