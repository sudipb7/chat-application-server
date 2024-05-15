import { Router } from "express";

import { signUp } from "../controllers/auth";

const router: Router = Router();

router.route("/sign-up").post(signUp);

export default router;
