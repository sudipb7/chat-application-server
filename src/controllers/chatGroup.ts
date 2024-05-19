import { v4 as uuid } from "uuid";
import { RequestHandler } from "express";
import { MemberRole } from "@prisma/client";

import { db } from "../utils/db";
import { deleteFile, uploadFile } from "../utils/cloudinary";
import {
  changeMemberRoleSchema,
  createChatGroupSchema,
  updateChatGroupSchema,
  zodError,
} from "../utils/schemas";

const getChatGroups: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const name = req.query.name || "";
    const includeAdmin = req.query.includeAdmin === "true";
    const skip = (page - 1) * limit;

    let where = {};
    if (name) {
      where = { name: { contains: name } };
    }

    let include = {};
    if (includeAdmin) {
      include = {
        members: { where: { role: MemberRole.ADMIN }, select: { user: true, id: true } },
      };
    }

    const documentCount = await db.chatGroup.count({ where });
    const isNext = documentCount > page * limit;
    const isPrevious = page > 1;

    const chatGroups = await db.chatGroup.findMany({
      skip,
      take: limit,
      where: { ...where, isPublic: true },
      include,
    });

    return res.status(200).json({
      message: "Chat Groups fetched successfully",
      data: { page, limit, documentCount, isNext, isPrevious, chatGroups },
    });
  } catch (error) {
    console.log("GET_CHAT_GROUPS", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getChatGroupById: RequestHandler = async (req, res) => {
  try {
    const includeUsers = req.query.includeUsers === "true";

    if (!req.params.id) {
      return res.status(400).json({ message: "Chat Group ID is required" });
    }

    let include = {};
    if (includeUsers) {
      include = { members: { select: { user: true, id: true } } };
    } else {
      include = { members: true };
    }

    const chatGroup = await db.chatGroup.findUnique({ where: { id: req.params.id }, include });

    return res
      .status(200)
      .json({ message: "Chat Group fetched successfully", data: { chatGroup } });
  } catch (error) {
    console.log("GET_CHAT_GROUP_BY_ID", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createChatGroup: RequestHandler = async (req, res) => {
  try {
    const validatedData = createChatGroupSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({ message: zodError(validatedData.error) });
    }

    const { name, description, adminId, isPublic } = validatedData.data;

    const localFilePath = req.file?.path;
    if (!localFilePath) {
      return res.status(400).json({ message: "Image is required" });
    }

    const image = await uploadFile(localFilePath, "chat-avatar");
    if (!image) {
      return res.status(500).json({ message: "Failed to upload image" });
    }

    const chatGroup = await db.chatGroup.create({
      data: {
        name,
        description,
        image,
        isPublic,
        inviteCode: uuid(),
        members: { create: { userId: adminId, role: MemberRole.ADMIN } },
      },
      include: { members: { select: { user: true, id: true } } },
    });

    return res
      .status(201)
      .json({ message: "Chat Group created successfully", data: { chatGroup } });
  } catch (error) {
    console.log("CREATE_CHAT_GROUP", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateChatGroup: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const moderatorId = req.query.moderatorId;
    const validatedData = updateChatGroupSchema.safeParse(req.body);

    if (!validatedData.success) {
      return res.status(400).json({ message: zodError(validatedData.error) });
    }

    if (!id) {
      return res.status(400).json({ message: "Chat Group ID is required" });
    }

    if (!moderatorId || typeof moderatorId !== "string") {
      return res.status(400).json({ message: "Moderator ID is required" });
    }

    const existingChatGroup = await db.chatGroup.findFirst({
      where: {
        id,
        members: {
          some: {
            id: moderatorId,
            OR: [{ role: MemberRole.ADMIN }, { role: MemberRole.MODERATOR }],
          },
        },
      },
    });
    if (!existingChatGroup) {
      return res.status(403).json({ message: "You are not authorized to update this chat group" });
    }

    const { name, description } = validatedData.data;
    const localFilePath = req.file?.path;
    let image = existingChatGroup.image;

    if (localFilePath) {
      const deleteExistingImage = await deleteFile(existingChatGroup.image, "chat-avatar");
      if (!deleteExistingImage) {
        return res.status(500).json({ message: "Failed to delete existing image" });
      }

      const uploadNewImage = await uploadFile(localFilePath, "chat-avatar");
      if (!uploadNewImage) {
        return res.status(500).json({ message: "Failed to upload image" });
      }

      image = uploadNewImage;
    }

    const chatGroup = await db.chatGroup.update({
      where: { id },
      data: { name, description, image },
      include: { members: { select: { user: true, id: true } } },
    });

    return res
      .status(200)
      .json({ message: "Chat Group updated successfully", data: { chatGroup } });
  } catch (error) {
    console.log("UPDATE_CHAT_GROUP", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteChatGroup: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const adminId = req.query.adminId;

    if (!id) {
      return res.status(400).json({ message: "Chat Group ID is required" });
    }

    if (!adminId || typeof adminId !== "string") {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const existingChatGroup = await db.chatGroup.findFirst({
      where: {
        id,
        members: { some: { id: adminId, role: MemberRole.ADMIN } },
      },
    });

    if (!existingChatGroup) {
      return res.status(403).json({ message: "You are not authorized to delete this chat group" });
    }

    const deleteChatGroupImage = await deleteFile(existingChatGroup.image, "chat-avatar");
    if (!deleteChatGroupImage) {
      return res.status(500).json({ message: "Failed to delete chat group image" });
    }

    await db.chatGroup.delete({ where: { id } });

    return res.status(200).json({ message: "Chat Group deleted successfully" });
  } catch (error) {
    console.log("DELETE_CHAT_GROUP", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addUserToChatGroup: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const moderatorId = req.query.moderatorId;
    const userId = req.query.userId;

    if (!id) {
      return res.status(400).json({ message: "Chat Group ID is required" });
    }

    if (!moderatorId || typeof moderatorId !== "string") {
      return res.status(400).json({ message: "Moderator ID is required" });
    }

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (userId === moderatorId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const existingChatGroup = await db.chatGroup.findFirst({
      where: {
        id,
        members: {
          some: {
            id: moderatorId,
            OR: [{ role: MemberRole.ADMIN }, { role: MemberRole.MODERATOR }],
          },
        },
      },
    });
    if (!existingChatGroup) {
      return res
        .status(403)
        .json({ message: "You are not authorized to add new users to this group" });
    }

    const chatGroup = await db.chatGroup.update({
      where: { id },
      data: { members: { create: { userId } } },
      include: { members: { select: { user: true, id: true } } },
    });

    return res.status(200).json({ message: "User added to chat group", data: { chatGroup } });
  } catch (error) {
    console.log("ADD_USER_TO_CHAT_GROUP", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const removeUserFromChatGroup: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const moderatorId = req.query.moderatorId;
    const memberId = req.query.memberId;

    if (!id) {
      return res.status(400).json({ message: "Chat Group ID is required" });
    }

    if (!memberId || typeof memberId !== "string") {
      return res.status(400).json({ message: "Member ID is required" });
    }

    if (!moderatorId || typeof moderatorId !== "string") {
      return res.status(400).json({ message: "Moderator ID is required" });
    }

    if (memberId === moderatorId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to remove users from this chat group" });
    }

    const existingChatGroup = await db.chatGroup.findFirst({
      where: {
        id,
        members: {
          some: {
            id: moderatorId,
            OR: [{ role: MemberRole.ADMIN }, { role: MemberRole.MODERATOR }],
          },
        },
      },
      include: { members: { select: { user: true, id: true } } },
    });

    if (!existingChatGroup) {
      return res
        .status(403)
        .json({ message: "You are not authorized to remove users from this chat group" });
    }

    await db.member.delete({ where: { id: memberId, chatGroupId: id } });

    const deletedMember = existingChatGroup.members.filter((member) => member.id === memberId)[0];

    const updatedmembers = [
      ...existingChatGroup.members.splice(existingChatGroup.members.indexOf(deletedMember!), 1),
    ];

    const chatGroup = { ...existingChatGroup, members: [...updatedmembers] };

    return res
      .status(200)
      .json({ message: "User removed from chat group successfully", data: { chatGroup } });
  } catch (error) {
    console.log("REMOVE_USER_FROM_CHAT_GROUP", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const changeMemberRole: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const moderatorId = req.query.moderatorId;

    if (!id) {
      return res.status(400).json({ message: "Chat Group ID is required" });
    }

    if (!moderatorId || typeof moderatorId !== "string") {
      return res.status(400).json({ message: "Moderator ID is required" });
    }

    const validatedData = changeMemberRoleSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({ message: zodError(validatedData.error) });
    }

    const { memberId, role } = validatedData.data;

    if (memberId === moderatorId) {
      return res.status(403).json({ message: "You are not authorized to change your role" });
    }

    const existingChatGroup = await db.chatGroup.findFirst({
      where: {
        id,
        members: {
          some: {
            id: moderatorId,
            OR: [{ role: MemberRole.ADMIN }, { role: MemberRole.MODERATOR }],
          },
        },
      },
      include: { members: { select: { user: true, id: true } } },
    });

    if (!existingChatGroup) {
      return res
        .status(403)
        .json({ message: "You are not authorized to remove users from this chat group" });
    }

    const updatedMember = await db.member.update({
      where: { id: memberId },
      data: { role },
      select: { id: true, user: true },
    });

    const updatedMembers = existingChatGroup.members.map((member) =>
      member.id === memberId ? updatedMember : member
    );

    const chatGroup = { ...existingChatGroup, members: updatedMembers };

    return res
      .status(200)
      .json({ message: "Member role changed successfully", data: { chatGroup } });
  } catch (error) {
    console.log("CHANGE_MEMBER_ROLE", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const changeChatGroupPrivacy: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const moderatorId = req.query.moderatorId;
    const isPublic = req.body.isPublic === "true" ? true : false;

    if (!id) {
      return res.status(400).json({ message: "Chat Group ID is required" });
    }

    if (!moderatorId || typeof moderatorId !== "string") {
      return res.status(400).json({ message: "Moderator ID is required" });
    }

    const existingChatGroup = await db.chatGroup.findFirst({
      where: {
        id,
        members: {
          some: {
            id: moderatorId,
            OR: [{ role: MemberRole.ADMIN }, { role: MemberRole.MODERATOR }],
          },
        },
      },
    });

    if (!existingChatGroup) {
      return res
        .status(403)
        .json({ message: "You are not authorized to change privacy of this chat group" });
    }

    const chatGroup = await db.chatGroup.update({
      where: { id },
      data: { isPublic },
      include: { members: { select: { user: true, id: true } } },
    });

    return res
      .status(200)
      .json({ message: "Chat Group privacy changed successfully", data: { chatGroup } });
  } catch (error) {
    console.log("CHANGE_CHAT_GROUP_PRIVACY", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const joinChatGroupByInviteCode: RequestHandler = async (req, res) => {
  try {
    const inviteCode = req.params.inviteCode;
    const userId = req.body.userId;

    if (!inviteCode) {
      return res.status(400).json({ message: "Invite code is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const chatGroup = await db.chatGroup.findFirst({
      where: { inviteCode },
      include: { members: { select: { user: true } } },
    });

    if (!chatGroup) {
      return res.status(404).json({ message: "Chat group not found" });
    }

    const userExists = chatGroup.members.some((member) => member.user.id === userId);
    if (userExists) {
      return res.status(400).json({ message: "You are already a member of this chat group" });
    }

    await db.member.create({
      data: { userId, chatGroupId: chatGroup.id, role: MemberRole.MEMBER },
    });

    return res.status(200).json({ message: "Joined chat group successfully" });
  } catch (error) {
    console.log("JOIN_CHAT_GROUP_BY_INVITE_CODE", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateInviteCode: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const moderatorId = req.query.moderatorId;

    if (!id) {
      return res.status(400).json({ message: "Chat Group ID is required" });
    }

    if (!moderatorId || typeof moderatorId !== "string") {
      return res.status(400).json({ message: "Moderator ID is required" });
    }

    const existingChatGroup = await db.chatGroup.findFirst({
      where: {
        id,
        members: {
          some: {
            id: moderatorId,
            OR: [{ role: MemberRole.ADMIN }, { role: MemberRole.MODERATOR }],
          },
        },
      },
    });

    if (!existingChatGroup) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update invite code of this chat group" });
    }

    const inviteCode = uuid();

    const chatGroup = await db.chatGroup.update({
      where: { id },
      data: { inviteCode },
      include: { members: { select: { user: true, id: true } } },
    });

    return res
      .status(200)
      .json({ message: "Invite code updated successfully", data: { chatGroup } });
  } catch (error) {
    console.log("UPDATE_INVITE_CODE", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getChatGroups,
  getChatGroupById,
  createChatGroup,
  updateChatGroup,
  deleteChatGroup,
  addUserToChatGroup,
  removeUserFromChatGroup,
  changeMemberRole,
  changeChatGroupPrivacy,
  updateInviteCode,
  joinChatGroupByInviteCode,
};
