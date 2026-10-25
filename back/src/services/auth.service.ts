import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import type { Request } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { cloudinaryUploadImage } from "../utils/cloudinary.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import { resolveLocation } from "../utils/locationData";
import { loginSchema, registerSchema } from "../validation/auth.validation";
import { findEligibleAdminIdsForNotificationType } from "./notification.service.js";

/**
 * Authentication service. It owns credential verification and token issuance;
 * controllers only adapt HTTP input/output and never expose stored secrets.
 */

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type AuthTokenPayload = {
  id: string;
  email: string;
  role: "user" | "company";
};
type CompanyRegistrationResult = {
  registrationStatus: "PENDING";
  resubmitted: boolean;
  company: {
    id: string;
    companyName: string;
    slug: string;
    description: string | null;
    email: string;
    phone: string;
    country: string | null;
    countryCode: string | null;
    state: string | null;
    stateCode: string | null;
    city: string | null;
    cityGeonameId: number | null;
    logoUrl: string | null;
    website: string | null;
    location: string | null;
    rejectionReason: null;
    reviewedAt: null;
    submittedAt: Date;
  };
};
type CompanyRegistrationRecord = {
  id: string;
  companyName: string;
  slug: string;
  description: string | null;
  email: string;
  phone: string;
  country: string | null;
  countryCode: string | null;
  state: string | null;
  stateCode: string | null;
  city: string | null;
  cityGeonameId: number | null;
  logoUrl: string | null;
  website: string | null;
  location: string | null;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  updatedAt: Date;
};
type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

const companyRegistrationSelect = {
  id: true,
  companyName: true,
  slug: true,
  description: true,
  email: true,
  phone: true,
  country: true,
  countryCode: true,
  state: true,
  stateCode: true,
  city: true,
  cityGeonameId: true,
  logoUrl: true,
  website: true,
  location: true,
  rejectionReason: true,
  reviewedAt: true,
  updatedAt: true,
} as const;

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, hashedPassword: string) => {
  const [salt, storedHash] = hashedPassword.split(":");
  if (!salt || !storedHash) return false;

  const hash = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(storedHash, "hex");
  return (
    expected.length === hash.length && crypto.timingSafeEqual(hash, expected)
  );
};

const issueTokens = (payload: AuthTokenPayload) => ({
  token: signAccessToken(payload),
  refreshToken: signRefreshToken(payload),
});

const throwCompanyRegistrationConflict = (
  approvalStatus: string | undefined
): never => {
  if (approvalStatus === "PENDING") {
    throw new AppError(
      "Your company registration is already under review. Please log in.",
      409,
      "COMPANY_REGISTRATION_PENDING"
    );
  }
  if (approvalStatus === "APPROVED") {
    throw new AppError(
      "This email is already associated with an approved company account. Please log in.",
      409,
      "COMPANY_ALREADY_REGISTERED"
    );
  }
  throw new AppError("Company registration could not be completed", 409);
};

export const registerAccount = async (
  input: RegisterInput,
  uploadedFile?: Request["file"]
): Promise<number | CompanyRegistrationResult> => {
  const safeRole = input.role === "company" ? "company" : "user";
  const normalizedInput = { ...input, role: safeRole } as RegisterInput;
  const resolveRegistrationLocation = () =>
    resolveLocation({
      country: normalizedInput.country,
      countryCode: normalizedInput.countryCode,
      state: normalizedInput.state,
      stateCode: normalizedInput.stateCode,
      city: normalizedInput.city,
      cityGeonameId: normalizedInput.cityGeonameId,
    });

  let uploadedImage: { publicId?: string; publicUrl?: string } | undefined;

  if (normalizedInput.role === "user") {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedInput.email },
    });

    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    const location = await resolveRegistrationLocation();

    if (uploadedFile?.buffer) {
      const uploadResult = await cloudinaryUploadImage(
        uploadedFile.buffer,
        uploadedFile.mimetype
      );

      uploadedImage = {
        publicId: uploadResult.public_id,
        publicUrl: uploadResult.secure_url,
      };
    }

    await prisma.$transaction(async (transaction: TransactionClient) => {
      const user = await transaction.user.create({
        data: {
          firstName: normalizedInput.firstName,
          lastName: normalizedInput.lastName,
          email: normalizedInput.email,
          password: hashPassword(normalizedInput.password),
          phone: normalizedInput.phone,
          country: location.country,
          countryCode: location.countryCode,
          state: location.state || null,
          stateCode: location.stateCode || null,
          city: location.city,
          cityGeonameId: location.cityGeonameId,
          birthdate: new Date(normalizedInput.birthdate),
          ...(uploadedImage?.publicId && {
            profilePicId: uploadedImage.publicId,
          }),
          ...(uploadedImage?.publicUrl && {
            profilePicUrl: uploadedImage.publicUrl,
          }),
        },
        select: { id: true },
      });
      await transaction.professionalProfile.create({
        data: { userId: user.id },
      });
    });
    return 0;
  }

  const existingCompany = await prisma.company.findUnique({
    where: { email: normalizedInput.email },
    select: { id: true, password: true, approvalStatus: true },
  });

  if (
    existingCompany?.approvalStatus === "PENDING" ||
    existingCompany?.approvalStatus === "APPROVED"
  ) {
    throwCompanyRegistrationConflict(existingCompany.approvalStatus);
  }

  if (
    existingCompany &&
    !verifyPassword(normalizedInput.password, existingCompany.password)
  ) {
    throw new AppError("Invalid email or password", 401, "UNAUTHORIZED");
  }

  const location = await resolveRegistrationLocation();

  if (uploadedFile?.buffer) {
    const uploadResult = await cloudinaryUploadImage(
      uploadedFile.buffer,
      uploadedFile.mimetype
    );

    uploadedImage = {
      publicId: uploadResult.public_id,
      publicUrl: uploadResult.secure_url,
    };
  }

  let company: CompanyRegistrationRecord | undefined;
  const resubmitted = Boolean(existingCompany);

  if (existingCompany) {
    const updateResult = await prisma.company.updateMany({
      where: {
        id: existingCompany.id,
        approvalStatus: "REJECTED",
      },
      data: {
        companyName: normalizedInput.companyName,
        slug: normalizedInput.slug,
        description: normalizedInput.description || null,
        phone: normalizedInput.phone,
        website: normalizedInput.website || null,
        location: [
          location.city,
          ...(location.state.toLocaleLowerCase() ===
          location.city.toLocaleLowerCase()
            ? []
            : [location.state]),
          location.country,
        ]
          .filter(Boolean)
          .join(", "),
        country: location.country,
        countryCode: location.countryCode,
        state: location.state || null,
        stateCode: location.stateCode || null,
        city: location.city,
        cityGeonameId: location.cityGeonameId,
        ...(uploadedImage?.publicId && { logoId: uploadedImage.publicId }),
        ...(uploadedImage?.publicUrl && { logoUrl: uploadedImage.publicUrl }),
        approvalStatus: "PENDING",
        rejectionReason: null,
        reviewedAt: null,
      },
    });

    if (updateResult.count !== 1) {
      const latestCompany = await prisma.company.findUnique({
        where: { id: existingCompany.id },
        select: { approvalStatus: true },
      });
      throwCompanyRegistrationConflict(latestCompany?.approvalStatus);
    }

    const updatedCompany = await prisma.company.findUnique({
      where: { id: existingCompany.id },
      select: companyRegistrationSelect,
    });
    if (!updatedCompany) {
      throw new AppError("Company not found", 404, "COMPANY_NOT_FOUND");
    }
    company = updatedCompany;
  } else {
    try {
      company = await prisma.company.create({
        data: {
          companyName: normalizedInput.companyName,
          slug: normalizedInput.slug,
          email: normalizedInput.email,
          password: hashPassword(normalizedInput.password),
          phone: normalizedInput.phone,
          description: normalizedInput.description,
          website: normalizedInput.website,
          location: [
            location.city,
            ...(location.state.toLocaleLowerCase() ===
            location.city.toLocaleLowerCase()
              ? []
              : [location.state]),
            location.country,
          ]
            .filter(Boolean)
            .join(", "),
          country: location.country,
          countryCode: location.countryCode,
          state: location.state || null,
          stateCode: location.stateCode || null,
          city: location.city,
          cityGeonameId: location.cityGeonameId,
          ...(uploadedImage?.publicId && {
            logoId: uploadedImage.publicId,
          }),
          ...(uploadedImage?.publicUrl && {
            logoUrl: uploadedImage.publicUrl,
          }),
        },
        select: companyRegistrationSelect,
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2002"
      ) {
        throw error;
      }
      const conflictingCompany = await prisma.company.findUnique({
        where: { email: normalizedInput.email },
        select: { approvalStatus: true },
      });
      if (!conflictingCompany) throw error;
      throwCompanyRegistrationConflict(conflictingCompany.approvalStatus);
    }
  }

  if (!company) {
    throw new AppError("Company registration could not be completed", 500);
  }

  const adminIds: string[] =
    await findEligibleAdminIdsForNotificationType("COMPANY_REQUEST");
  await Promise.all(
    adminIds.map((adminId) =>
      prisma.notification.create({
        data: {
          userId: adminId,
          message: `New company registration request: ${normalizedInput.companyName}. Please review and approve this company.`,
          type: "COMPANY_REQUEST",
          companyRequestId: company.id,
        },
      })
    )
  );

  return {
    registrationStatus: "PENDING",
    resubmitted,
    company: {
      id: company.id,
      companyName: company.companyName,
      slug: company.slug,
      description: company.description,
      email: company.email,
      phone: company.phone,
      country: company.country,
      countryCode: company.countryCode,
      state: company.state,
      stateCode: company.stateCode,
      city: company.city,
      cityGeonameId: company.cityGeonameId,
      logoUrl: company.logoUrl,
      website: company.website,
      location: company.location,
      rejectionReason: null,
      reviewedAt: null,
      submittedAt: company.updatedAt,
    },
  };
};

export const loginAccount = async (input: LoginInput) => {
  if (input.role === "user") {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        profilePicUrl: true,
        firstName: true,
        lastName: true,
        password: true,
        role: true,
        accountStatus: true,
      },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }
    const { password, ...userInfo } = user;

    if (!verifyPassword(input.password, password)) {
      throw new AppError("Invalid email or password", 401, "UNAUTHORIZED");
    }

    if (user.accountStatus === "DEACTIVATED") {
      throw new AppError(
        "Your user account has been deactivated.",
        403,
        "ACCOUNT_DEACTIVATED"
      );
    }

    const tokens = issueTokens({
      id: user.id,
      email: user.email,
      role: "user",
    });

    return {
      user: userInfo,
      token: tokens.token,
      refreshToken: tokens.refreshToken,
    };
  }

  const company = await prisma.company.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      companyName: true,
      slug: true,
      description: true,
      phone: true,
      website: true,
      location: true,
      country: true,
      countryCode: true,
      state: true,
      stateCode: true,
      city: true,
      cityGeonameId: true,
      password: true,
      logoUrl: true,
      status: true,
      approvalStatus: true,
      rejectionReason: true,
      reviewedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!company) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!verifyPassword(input.password, company.password)) {
    throw new AppError("Invalid email or password", 401, "UNAUTHORIZED");
  }

  if (company.status === "DEACTIVATED") {
    throw new AppError(
      "Your company account has been deactivated.",
      403,
      "ACCOUNT_DEACTIVATED"
    );
  }

  if (
    company.approvalStatus === "PENDING" ||
    company.approvalStatus === "REJECTED"
  ) {
    const { password: _password, ...companyInfo } = company;
    return {
      registrationStatus: company.approvalStatus,
      company: {
        ...companyInfo,
        submittedAt:
          company.approvalStatus === "PENDING"
            ? company.updatedAt
            : company.createdAt,
      },
    };
  }

  if (company.approvalStatus !== "APPROVED") {
    throw new AppError("Company account is not approved", 403);
  }
  const { password, ...companyInfo } = company;
  const tokens = issueTokens({
    id: company.id,
    email: company.email,
    role: "company",
  });

  return {
    company: companyInfo,
    token: tokens.token,
    refreshToken: tokens.refreshToken,
  };
};

export const verifySupportAccessCredentials = async (input: LoginInput) => {
  if (input.role === "user") {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, password: true, accountStatus: true, role: true },
    });
    if (!user || !verifyPassword(input.password, user.password)) {
      throw new AppError("Invalid email or password", 401, "UNAUTHORIZED");
    }
    if (user.accountStatus === "DEACTIVATED" && user.role === "ADMIN") {
      throw new AppError(
        "Support-only access is not available for admin accounts",
        403,
        "FORBIDDEN"
      );
    }
    return user.accountStatus === "DEACTIVATED"
      ? {
          mode: "support_only" as const,
          accountId: user.id,
          accountType: "user" as const,
        }
      : { mode: "active" as const };
  }

  const company = await prisma.company.findUnique({
    where: { email: input.email },
    select: { id: true, password: true, status: true },
  });
  if (!company || !verifyPassword(input.password, company.password)) {
    throw new AppError("Invalid email or password", 401, "UNAUTHORIZED");
  }
  return company.status === "DEACTIVATED"
    ? {
        mode: "support_only" as const,
        accountId: company.id,
        accountType: "company" as const,
      }
    : { mode: "active" as const };
};

export const refreshAccessToken = async (refreshToken: string) => {
  let payload: AuthTokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken) as AuthTokenPayload;
  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      throw new AppError("Invalid or expired refresh token", 401);
    }
    throw error;
  }

  if (!payload.id || !payload.email || !payload.role) {
    throw new AppError("Invalid refresh token payload", 401);
  }

  if (payload.role === "user") {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { accountStatus: true },
    });
    if (!user) {
      throw new AppError("User account not found", 403, "FORBIDDEN");
    }
    if (user.accountStatus === "DEACTIVATED") {
      throw new AppError(
        "Your user account has been deactivated.",
        403,
        "ACCOUNT_DEACTIVATED"
      );
    }
  } else {
    const company = await prisma.company.findUnique({
      where: { id: payload.id },
      select: { status: true, approvalStatus: true },
    });
    if (!company) {
      throw new AppError("Company account not found", 403, "FORBIDDEN");
    }
    if (company.status === "DEACTIVATED") {
      throw new AppError(
        "Your company account has been deactivated.",
        403,
        "ACCOUNT_DEACTIVATED"
      );
    }
    if (company.approvalStatus !== "APPROVED") {
      throw new AppError("Company account is not approved", 403);
    }
  }

  const accessTokenPayload: AuthTokenPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };

  return signAccessToken(accessTokenPayload);
};
