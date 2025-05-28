import React, { useState } from "react";
import axios from "axios";
import "./fileUpload.css";

const API_URL = import.meta.env.VITE_API_URL;

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(null);
  };
  
  const handleFileUpload = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API_URL}/api/predict`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      setSuccess("File uploaded and analyzed successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="file-upload-container">
        <p>Upload File :</p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          required
        />

        <button onClick={handleFileUpload}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </>
  );
};

export default FileUpload;
