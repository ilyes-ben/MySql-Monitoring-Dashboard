import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ labels, data, backgroundColor, borderColor }) => {
  const chartData = {
    labels, // Database names
    datasets: [
      {
        label: "Database Size (MB)",
        data, // Database sizes in MB
        backgroundColor, // Bar fill color
        borderColor, // Bar border color
        borderWidth: 1, // Bar border width
        borderRadius: 20,
        barThickness: 30, // Fixed bar thickness
      },
    ],
  };

  const options = {
    indexAxis: "y", // Make the bars horizontal
    responsive: true, // Make the chart responsive
    maintainAspectRatio: true, // Allow the chart to resize
    plugins: {
      legend: { display: false }, // Hide the legend
      tooltip: {
        enabled: true, // Disable tooltips
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Size (MB)", // X-axis label
        },
        grid: {
          color: "#e5e7eb", // Light gray grid lines
        },
      },
      y: {
        title: {
          display: true,
          text: "Databases", // Y-axis label
        },
        grid: {
          display: false, // Hide Y-axis grid lines
        },
        ticks: {
          display: false, // Hide Y-axis ticks (database names are inside bars)
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChart;