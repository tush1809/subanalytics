import * as dotenv from "dotenv";
dotenv.config({
  path: "./env",
});

import express, { json } from "express";
import { connect } from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import { DB_NAME } from "./constants.js";

const app = express();
app.use(json());
app.use(cors());
app.use(cookieParser())

// Import routes
import authRoutes from "./routes/auth.route.js";
import predictRoutes from './routes/predict.route.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictRoutes);

// MongoDB connection
connect(`${process.env.MONGO_URI}/${DB_NAME}`)
  .then(() => console.log(`Connected to MongoDB: ${DB_NAME}`))
  .catch(err => console.error(err));

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
