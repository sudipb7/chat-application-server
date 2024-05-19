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
