import { Router } from "express";

import { upload } from "../middlewares/multer";
import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/user";

const router: Router = Router();

router.route("/").get(getUsers).post(createUser);
router.route("/email/:email").get(getUserByEmail);
router.route("/:id").get(getUserById).patch(upload.single("image"), updateUser).delete(deleteUser);

export default router;
