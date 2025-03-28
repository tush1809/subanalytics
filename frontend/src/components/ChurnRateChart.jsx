import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Title, ArcElement, Tooltip, Legend } from 'chart.js';

// Registering chart components
ChartJS.register(Title, ArcElement, Tooltip, Legend);

const ChurnRateChart = ({ churnRate }) => {
  const data = {
    labels: ['Churn', 'No-Churn'], // Labels for the chart
    datasets: [
      {
        data: [churnRate, 100 - churnRate], // Data for churned vs non-churned
        backgroundColor: ['#E74C3C', '#4CAF50'], // Colors for the sections
        hoverBackgroundColor: ['#FF3D00', '#28B44C'], // Hover colors
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${value.toFixed(2)}%`;
          },
        },
      },
    },
  };

  return (
    <div>
      <h4>{churnRate}% customers might churn</h4>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default ChurnRateChart;
