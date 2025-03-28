import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import FileUpload from "../components/FileUpload";
import axios from "axios";
import "./DataHub.css";

const API_URL = import.meta.env.VITE_API_URL;

const DataHub = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getHistory = async () => {
      setHistory(null);
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/predict/get-history`, {
          withCredentials: true,
        });

        // update state
        setHistory(response.data?.history);
      } catch (error) {
        if (error.status === 404) {
          setHistory(null);
        }
      } finally {
        setLoading(false);
      }
    };

    getHistory();
  }, [location.pathname]);

  console.log(history);

  return (
    <>
      <Header />

      <div className="table-container">
        <FileUpload />
        <div className="table-heading">Analytics History</div>
        {history && history.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
                  <td>{item.inputFileName}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>{loading ? "Loading history..." : "No history available."}</p>
        )}
      </div>
    </>
  );
};

export default DataHub;
