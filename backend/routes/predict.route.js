import express from "express";
import multer from "multer";
import { uploadFileAndPredict } from "../controllers/predict.controller.js";

const router = express.Router();

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), uploadFileAndPredict);

export default router;
