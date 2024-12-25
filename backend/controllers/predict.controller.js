import axios from "axios";
import FormData from "form-data";
import fs from "fs";

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
    const flaskResponse = await axios.post(
      "http://127.0.0.1:5001/api/predict/upload",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    // Send Flask response back to the frontend
    res.status(200).json(flaskResponse.data);
  } catch (error) {
    console.error("Error communicating with Flask API:", error.message);
    res.status(500).json({ message: "Error processing file" });
  }
};
