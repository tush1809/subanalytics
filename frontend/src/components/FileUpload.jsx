import React, { useState } from "react";
import axios from "axios";
import ChurnRateChart from "./ChurnRateChart";
import "./fileUpload.css";

const FileUpload = ({ sendPredictedDataToParent }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/predict/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // console.log(response);
      sendPredictedDataToParent(response);

      // setChurnRate(response.data.churn_rate); // assuming the response contains the churn rate
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(error.message);
    }
  };

  return (
    <>
      <div className="file-upload-container">
        <p>Upload Excel File:</p>
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          required
        />

        <button onClick={handleFileUpload}>Analyze</button>
      </div>
      {error && <div className="error">{error}</div>}
    </>
  );
};

export default FileUpload;
