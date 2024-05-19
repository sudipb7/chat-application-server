import { Router } from "express";

import { upload } from "../middlewares/multer";
import {
  getChatGroups,
  getChatGroupById,
  createChatGroup,
  updateChatGroup,
  deleteChatGroup,
  addUserToChatGroup,
  removeUserFromChatGroup,
  changeMemberRole,
  changeChatGroupPrivacy,
  joinChatGroupByInviteCode,
  updateInviteCode,
} from "../controllers/chatGroup";

const router: Router = Router();

router.route("/").get(getChatGroups).post(upload.single("image"), createChatGroup);
router
  .route("/:id")
  .get(getChatGroupById)
  .patch(upload.single("image"), updateChatGroup)
  .delete(deleteChatGroup);
router.route("/:id/add-user").post(addUserToChatGroup);
router.route("/:id/remove-user").delete(removeUserFromChatGroup);
router.route("/:id/change-role").patch(changeMemberRole);
router.route("/:id/change-privacy").patch(changeChatGroupPrivacy);
router.route("/join/:inviteCode").post(joinChatGroupByInviteCode);
router.route("/:id/update-invite-code").patch(updateInviteCode);

export default router;
