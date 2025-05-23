import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ data, label, borderColor, backgroundColor, yAxisLabel }) => {
  const chartData = {
    labels: Array.from({ length: data.length }, (_, i) => `${data.length - i - 1}s`),
    datasets: [
      {
        label, // Label for the dataset
        data, // Y-axis data
        borderColor,
        backgroundColor,
        tension: 0.4, // Smoothness of the line
        pointRadius: 0, // Remove dots (data points)
      },
    ],
  };

  const options = {
    responsive: true, // Make the chart responsive
    maintainAspectRatio: true, 
    layout: {
      padding: 2, // Remove padding around the chart
    },
    plugins: {
      legend: { display: false }, // Hide the legend
    },
    scales: {
      x: {
        display: true, // Hide the X-axis labels
        grid: {
          display: false, // Hide X-axis grid lines
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel, // Y-axis label (e.g., "MB", "Seconds")
        },
        grid: {
          color: "#e5e7eb", // Light gray grid lines
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;