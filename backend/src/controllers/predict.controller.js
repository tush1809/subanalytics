import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { Prediction } from "../models/prediction.model.js";

export const uploadFileAndPredict = async (req, res) => {
  try {
    // Ensure file exists in the request
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Prepare form data for Flask API
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path), {
      contentType: "text/csv",
      filename: req.file.originalname,
    });

    // Make request to Flask API
    const flaskResult = await axios.post(
      "http://127.0.0.1:5001/api/predict",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    // SAVE PREDICTION TO DB
    // Extract the current logged in user
    const user = req.user;

    const predictionResult = flaskResult.data.prediction_results
    const insightResult = flaskResult.data.insight_results

    // Create a prediction object
    const predictionObj = {
      user,
      inputFileName: req.file.originalname,
      predictionResult,
      insightResult
    };


    // Save the prediction object to the database
    const newPrediction = new Prediction(predictionObj);
    await newPrediction.save();

    // Delete the uploaded file after processing
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err.message);
      } else {
        console.log("file deleted");
        
      }
    });

    // Send Flask response back to the frontend
    res
      .status(201)
      .json({
        message: "New prediction results added",
        results: predictionObj,
      });
  } catch (error) {
    console.error("Error communicating with Flask API:", error.message);
    res.status(500).json({ message: "Error processing file" });
  }
};
