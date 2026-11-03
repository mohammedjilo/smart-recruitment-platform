import assert from "node:assert/strict";
import test from "node:test";
import { cloudinaryUploadImage } from "./cloudinary.js";

test("cloudinaryUploadImage stops early when Cloudinary credentials are missing", async () => {
  const previousCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const previousApiKey = process.env.CLOUDINARY_API_KEY;
  const previousApiSecret = process.env.CLOUDINARY_API_SECRET;

  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;

  try {
    await assert.rejects(
      () => cloudinaryUploadImage(Buffer.from("fake-image"), "image/png"),
      (error: any) => {
        return (
          error?.code === "SERVICE_UNAVAILABLE" &&
          error?.message.includes("Cloudinary")
        );
      }
    );
  } finally {
    if (previousCloudName !== undefined)
      process.env.CLOUDINARY_CLOUD_NAME = previousCloudName;
    if (previousApiKey !== undefined)
      process.env.CLOUDINARY_API_KEY = previousApiKey;
    if (previousApiSecret !== undefined)
      process.env.CLOUDINARY_API_SECRET = previousApiSecret;
  }
});
