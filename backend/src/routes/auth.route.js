import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/auth.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
const router = Router();

router.post("/register", registerUser);
router.get("/login", loginUser);

// Protected Routes
router.get("/logout", verifyUser, logoutUser);

export default router;
