import { Router } from "express";

import { createUser } from "../controllers/user";

const router: Router = Router();

router.route("/").post(createUser);

export default router;
