import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import FileUpload from "../components/FileUpload";
import Dashboard from "../components/Dashboard";
import "./Home.css";
import { NavLink } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [insightData, setInsightData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isDataAvailable, setIsDataAvailable] = useState(false);

  useEffect(() => {
    const getLatestAnalytics = async () => {
      setAnalyticsData(null);
      setInsightData(null);
      setLoading(true);

      // get latest analytics
      try {
        const response = await axios.get(`${API_URL}/api/predict/get-latest`, {
          withCredentials: true,
        });

        // console.log(response);

        // update local state
        setAnalyticsData(response.data.prediction.predictionResult);
        setInsightData(response.data.prediction.insightResult);

        setIsDataAvailable(true);
      } catch (error) {
        console.log(error);
        if (error.status === 404) {
          setIsDataAvailable(false);
        }
      } finally {
        setLoading(false);
      }
    };
    getLatestAnalytics();
  }, [location.pathname]);

  return (
    <div>
      <Header />
      <div>
        {/* <FileUpload sendPredictedDataToParent={handlePredictedDataChange} /> */}

        {loading ? <p className="loading-text">Analyzing data...</p> : null}

        {isDataAvailable ? (
          <>
            <Dashboard
              analyticsData={analyticsData}
              insightData={insightData}
            />
          </>
        ) : (
          !loading && (
            <p className="message">
              No data to analyze. <NavLink to="/datahub">Upload</NavLink> your customer data to see analytics.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
