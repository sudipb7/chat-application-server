import { Router } from "express";

import { upload } from "../middlewares/multer";
import { createUser, deleteUser, getUserById, updateUser } from "../controllers/user";

const router: Router = Router();

router.route("/").post(createUser);
router.route("/:id").get(getUserById).patch(upload.single("image"), updateUser).delete(deleteUser);

export default router;
