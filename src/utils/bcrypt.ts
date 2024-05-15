import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(15);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const isValidPassword = await bcrypt.compare(password, hashedPassword);
  return isValidPassword;
};
