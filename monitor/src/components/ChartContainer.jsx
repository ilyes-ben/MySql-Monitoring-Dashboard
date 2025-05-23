import React from "react";

const ChartContainer = ({ title, children }) => {
  return (
    <div className="chart-container">
      <h2>{title}</h2> {/* Chart title */}
      <div style={{ height: "100%", width: "100%" }}>{children}</div> {/* Wrapper for the chart */}
    </div>
  );
};

export default ChartContainer;