import { RequestHandler } from "express";

import { db } from "../utils/db";
import { userSchema, zodError } from "../utils/schemas";
import { deleteFile, uploadFile } from "../utils/cloudinary";

const getUsers: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const name = req.query.name || "";
    const email = req.query.email || "";
    const skip = (page - 1) * limit;

    let where = {};
    if (name) {
      where = { ...where, name: { contains: name } };
    }
    if (email) {
      where = { ...where, email: { contains: email } };
    }

    const documentCount = await db.user.count({ where });
    const isNext = documentCount > page * limit;
    const isPrevious = page > 1;

    const users = await db.user.findMany({
      skip,
      take: limit,
      where,
    });

    return res.status(200).json({
      message: "Users fetched successfully",
      data: { page, limit, documentCount, isNext, isPrevious, users },
    });
  } catch (error) {
    console.log("GET_USERS", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserById: RequestHandler = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await db.user.findUnique({ where: { id: req.params.id } });

    return res.status(200).json({ message: "User fetched successfully", data: { user } });
  } catch (error) {
    console.log("GET_USER_BY_ID", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserByEmail: RequestHandler = async (req, res) => {
  try {
    const includeMembers = req.query.includeMembers === "true";
    const include = includeMembers ? { members: true } : {};

    if (!req.params.email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await db.user.findUnique({ where: { email: req.params.email }, include });

    return res.status(200).json({ message: "User fetched successfully", data: { user } });
  } catch (error) {
    console.log("GET_USER_BY_EMAIL", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createUser: RequestHandler = async (req, res) => {
  try {
    const validatedData = userSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({ message: zodError(validatedData.error) });
    }

    const { name, email, image } = validatedData.data;

    const doesUserExist = await db.user.findUnique({ where: { email } });
    if (doesUserExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const imageUrl = await uploadFile(image, "avatar", true);
    if (!imageUrl) {
      return res.status(500).json({ message: "Failed to upload image" });
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        image: imageUrl,
      },
    });

    return res.status(201).json({ message: "User created", data: { user } });
  } catch (error) {
    console.log("CREATE_USER", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser: RequestHandler = async (req, res) => {
  try {
    const validatedData = userSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({ message: zodError(validatedData.error) });
    }

    if (!req.params.id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userExists = await db.user.findUnique({ where: { id: req.params.id } });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    let data = validatedData.data;
    const filePath = req.file?.path;
    if (filePath) {
      const deleteExistingImage = await deleteFile(data.image, "avatar");
      if (!deleteExistingImage) {
        return res.status(500).json({ message: "Failed to delete existing image" });
      }
      const newImageUrl = await uploadFile(filePath, "avatar");
      if (!newImageUrl) {
        return res.status(500).json({ message: "Failed to upload image" });
      }
      data = { ...data, image: newImageUrl };
    }

    const user = await db.user.update({ where: { id: req.params.id }, data });

    return res.status(200).json({ message: "User updated successfully", data: { user } });
  } catch (error) {
    console.log("UPDATE_USER", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser: RequestHandler = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await db.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const deleteImage = await deleteFile(user.image, "avatar");
    if (!deleteImage) {
      return res.status(500).json({ message: "Failed to delete image" });
    }

    await db.user.delete({ where: { id: user.id } });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("DELETE_USER", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { getUsers, getUserById, getUserByEmail, createUser, updateUser, deleteUser };
