// src/components/SubscriptionPlanChart.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import "./planDistribution.css";

// Register necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SubscriptionPlanChart = ({ planDistribution }) => {
  // Prepare chart data
  const chartData = {
    labels: planDistribution ? Object.keys(planDistribution) : [], // Subscription plan names
    datasets: [
      {
        label: "Subscription plans",
        data: planDistribution ? Object.values(planDistribution) : [], // Counts for each subscription plan
        backgroundColor: "#4CAF50", // Color for bars
        borderColor: "#8884d8", // Border color
        borderWidth: 1,
      },
    ],
  };

  // Chart options (you can customize these)
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="subscription-chart">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SubscriptionPlanChart;
