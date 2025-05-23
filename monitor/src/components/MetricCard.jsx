import React from "react";

const MetricCard = ({ title, rows }) => {
  return (
    <div className="metric-card">
      <h3>{title}</h3>
      {rows.map((row, index) => (
        <div key={index} className="metric-row">
          <span className="metric-label">{row.label}</span>
          <span className={`metric-value ${row.color}`}>{row.value}</span>
        </div>
      ))}
    </div>
  );
};

export default MetricCard;