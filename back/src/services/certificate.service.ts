import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { z } from "zod";
import { certificateSchema } from "../validation/certificate.validation.js";

type CertificateInput = z.infer<typeof certificateSchema>;

const getProfileOrThrow = async (userId: string) => {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("Professional profile not found", 404);
  }

  return profile;
};

export const createCertificate = async (
  userId: string,
  input: CertificateInput
) => {
  const profile = await getProfileOrThrow(userId);

  return prisma.certificate.create({
    data: {
      profileId: profile.id,
      certificateName: input.certificateName,
      organization: input.organization,
    },
  });
};

export const updateCertificate = async (
  userId: string,
  certificateId: string,
  input: Partial<CertificateInput>
) => {
  const profile = await getProfileOrThrow(userId);

  const certificate = await prisma.certificate.findFirst({
    where: { id: certificateId, profileId: profile.id },
  });

  if (!certificate) {
    throw new AppError("Certificate not found", 404);
  }

  return prisma.certificate.update({
    where: { id: certificateId },
    data: {
      ...(input.certificateName !== undefined && {
        certificateName: input.certificateName,
      }),
      ...(input.organization !== undefined && {
        organization: input.organization,
      }),
    },
  });
};

export const deleteCertificate = async (
  userId: string,
  certificateId: string
) => {
  const profile = await getProfileOrThrow(userId);

  const certificate = await prisma.certificate.findFirst({
    where: { id: certificateId, profileId: profile.id },
  });

  if (!certificate) {
    throw new AppError("Certificate not found", 404);
  }

  await prisma.certificate.delete({ where: { id: certificateId } });

  return { message: "Certificate deleted successfully" };
};
