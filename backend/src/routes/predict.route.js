import express from "express";
import multer from "multer";
import { verifyUser } from "../middleware/auth.middleware.js";
import { uploadFileAndPredict } from "../controllers/predict.controller.js";

const router = express.Router();

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Protected Routes
router.post("/", verifyUser, upload.single("file"), uploadFileAndPredict);

export default router;
