import { MemberRole } from "@prisma/client";
import { type ZodError, z } from "zod";

export const zodError = (error: ZodError) => {
  return error.errors.map((err) => err.message).join(", ");
};

export const userSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name must be at least 1 character long")
    .max(255, "Name must be at most 255 characters long"),
  email: z.string({ required_error: "Email is required" }).email("Invalid email"),
  image: z.string({ required_error: "Image is required" }),
});

export const createChatGroupSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name must be at least 1 character long")
    .max(50, "Name must be at most 255 characters long"),
  isPublic: z.boolean().default(false),
  description: z.optional(z.string().max(255, "Description must be at most 255 characters long")),
  adminId: z
    .string({ required_error: "Admin ID is required" })
    .min(1, "Admin ID must be at least 1 character long"),
});

export const updateChatGroupSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name must be at least 1 character long")
    .max(50, "Name must be at most 255 characters long"),
  description: z.optional(z.string().max(255, "Description must be at most 255 characters long")),
});

export const changeMemberRoleSchema = z.object({
  memberId: z
    .string({ required_error: "Member ID is required" })
    .min(1, "Member ID must be at least 1 character long"),
  role: z.enum([MemberRole.MODERATOR, MemberRole.MEMBER], { required_error: "Role is required" }),
});
