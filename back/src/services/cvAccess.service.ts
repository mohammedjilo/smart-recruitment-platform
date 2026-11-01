import { prisma } from "../config/db.js";
import { cloudinaryPrivateCvDownloadUrl, cloudinaryUploadCV } from "../utils/cloudinary.js";
import { AppError } from "../utils/appError.js";

const CV_DOWNLOAD_TTL_SECONDS = 5 * 60;
export const CV_DOWNLOAD_TTL_MILLISECONDS = CV_DOWNLOAD_TTL_SECONDS * 1000;

type StoredCv = {
  cvPublicId: string | null;
  cvResourceType: string;
  cvDeliveryType: string;
};

export const createDownloadAuthorization = (
  asset: StoredCv | null,
  now = Date.now(),
  createSignedUrl = cloudinaryPrivateCvDownloadUrl
) => {
  if (!asset?.cvPublicId) {
    throw new AppError("CV is unavailable", 404, "CV_NOT_FOUND");
  }
  if (
    asset.cvResourceType !== "raw" ||
    asset.cvDeliveryType !== "authenticated"
  ) {
    throw new AppError(
      "CV requires secure storage migration",
      409,
      "CV_MIGRATION_REQUIRED"
    );
  }

  const expiresAt = Math.floor(now / 1000) + CV_DOWNLOAD_TTL_SECONDS;
  try {
    const url = createSignedUrl(asset.cvPublicId, expiresAt);
    return { url, expiresAt: new Date(expiresAt * 1000).toISOString() };
  } catch {
    throw new AppError(
      "CV delivery is temporarily unavailable",
      503,
      "CV_DELIVERY_UNAVAILABLE",
      undefined,
      { source: "cloudinary", classification: "unexpected" }
    );
  }
};

const applicationAssetSelect = {
  cvPublicId: true,
  cvResourceType: true,
  cvDeliveryType: true,
} as const;

export const getCandidateApplicationCv = async (
  applicationId: string,
  userId: string
) => {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    select: applicationAssetSelect,
  });
  if (!application) throw new AppError("Application not found", 404);
  return createDownloadAuthorization(application);
};

export const getCompanyApplicationCv = async (
  applicationId: string,
  companyId: string
) => {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, job: { companyId } },
    select: applicationAssetSelect,
  });
  if (!application) throw new AppError("Application not found", 404);
  return createDownloadAuthorization(application);
};

export const getAdminApplicationCv = async (applicationId: string) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: applicationAssetSelect,
  });
  if (!application) throw new AppError("Application not found", 404);
  return createDownloadAuthorization(application);
};

export const getCandidateProfileCv = async (userId: string) => {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
    select: {
      cvPublicId: true,
      cvResourceType: true,
      cvDeliveryType: true,
    },
  });
  if (!profile) throw new AppError("Professional profile not found", 404);
  return createDownloadAuthorization(profile);
};

export const getAdminCandidateProfileCv = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "USER" },
    select: {
      profile: {
        select: {
          cvPublicId: true,
          cvResourceType: true,
          cvDeliveryType: true,
        },
      },
    },
  });
  if (!user?.profile) throw new AppError("Candidate profile not found", 404);
  return createDownloadAuthorization(user.profile);
};

export const replaceCandidateProfileCv = async (
  userId: string,
  file: Express.Multer.File
) => {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new AppError("Professional profile not found", 404);

  const uploaded = await cloudinaryUploadCV(file.buffer, file.mimetype);
  await prisma.professionalProfile.update({
    where: { userId },
    data: {
      cvPath: null,
      cvPublicId: uploaded.public_id,
      cvResourceType: "raw",
      cvDeliveryType: "authenticated",
    },
    select: { id: true },
  });

  return { hasCv: true };
};
