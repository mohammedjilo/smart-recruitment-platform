import { z } from "zod";

export const certificateSchema = z.object({
  certificateName: z
    .string()
    .trim()
    .min(2, "Certificate name is required")
    .max(100),
  organization: z.string().trim().min(2, "Organization is required").max(100),
});

export const updateCertificateSchema = certificateSchema.partial();
export type CertificateInput = z.infer<typeof certificateSchema>;
export type UpdateCertificateInput = z.infer<typeof updateCertificateSchema>;
