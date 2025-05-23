import React, { useState, useEffect } from "react";
import MetricCard from "./components/MetricCard";
import LineChart from "./components/LineChart";
import BarChart from "./components/BarChart";
import DatabaseTree from "./components/DatabaseTree";
import ChartContainer from "./components/ChartContainer";
import "./styles.css";

// Utility function to format uptime
const formatUptime = (seconds) => {
  if (!seconds) return "Loading...";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const App = () => {
  const [metrics, setMetrics] = useState({});
  const [responseTimes, setResponseTimes] = useState([]);
  const [ioReads, setIoReads] = useState([]);
  const [ioWrites, setIoWrites] = useState([]);
  const [networkReceived, setNetworkReceived] = useState([]);
  const [networkSent, setNetworkSent] = useState([]);
  const [staticData, setStaticData] = useState({}); // State for all static data

  // Fetch real-time metrics
  useEffect(() => {
    const fetchMetrics = () => {
      fetch("http://localhost:5008/metrics/realtime")
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched metrics:", data); // Log the data
          setMetrics(data);

          // Update chart data
          setResponseTimes((prev) => [...prev.slice(-5), data.avg_response_time || 0]); // Keep last 5 data points
          setIoReads((prev) => [...prev.slice(-5), data.io_usage?.total_reads || 0]);
          setIoWrites((prev) => [...prev.slice(-5), data.io_usage?.total_writes || 0]);
          setNetworkReceived((prev) => [...prev.slice(-5), data.network_traffic?.MBytes_received || 0]);
          setNetworkSent((prev) => [...prev.slice(-5), data.network_traffic?.MBytes_sent || 0]);
        })
        .catch((error) => console.error("Error fetching metrics:", error));
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 1000); // Refresh every 1 second
    return () => clearInterval(interval);
  }, []);

  // Fetch static metrics every 30 seconds
  useEffect(() => {
    const fetchStaticMetrics = async () => {
      try {
        const response = await fetch("http://localhost:5008/metrics/static");
        const data = await response.json();
        console.log("Fetched static metrics:", data);

        // Store all static data in state
        setStaticData(data);
      } catch (error) {
        console.error("Error fetching static metrics:", error);
      }
    };

    fetchStaticMetrics(); // Fetch immediately
    const interval = setInterval(fetchStaticMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate total network traffic
  const totalTraffic =
    metrics.network_traffic &&
    metrics.network_traffic.MBytes_received &&
    metrics.network_traffic.MBytes_sent
      ? (
          parseFloat(metrics.network_traffic.MBytes_received) +
          parseFloat(metrics.network_traffic.MBytes_sent)
        ).toFixed(2)
      : "Loading...";

  // Prepare data for the bar chart
  const dbLabels = staticData.database_size?.map((db) => db.database_name) || []; // Database names
  const dbSizes = staticData.database_size?.map((db) => db.size_mb) || []; // Database sizes in MB

  return (
    <div className="dashboard">
      <h1>Realtime Metrics Dashboard</h1>
      <div className="card-grid">
        <div className="grid grid-cols-3 gap-6">
          <MetricCard
            title="Server Uptime"
            rows={[
              {
                label: "Uptime",
                value: formatUptime(metrics.server_uptime),
                color: "text-secondary",
              },
            ]}
          />
          <MetricCard
            title="Network Traffic"
            rows={[
              {
                label: "Received",
                value: `${metrics.network_traffic?.MBytes_received || "Loading..."} MB`,
                color: "text-blue",
              },
              {
                label: "Sent",
                value: `${metrics.network_traffic?.MBytes_sent || "Loading..."} MB`,
                color: "text-green",
              },
              {
                label: "Total",
                value: `${totalTraffic} MB`,
                color: "text-yellow",
              },
            ]}
          />
          <MetricCard
            title="Active Connections"
            rows={[
              {
                label: "Connections",
                value: metrics.active_connections || "Loading...",
                color: "text-primary",
              },
            ]}
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        {/* I/O Charts */}
        <ChartContainer title="I/O Reads">
          <LineChart
            data={ioReads}
            label="Reads"
            borderColor="#10b981"
            backgroundColor="rgba(16, 185, 129, 0.2)"
            yAxisLabel="Count"
          />
        </ChartContainer>
        <ChartContainer title="I/O Writes">
          <LineChart
            data={ioWrites}
            label="Writes"
            borderColor="#f59e0b"
            backgroundColor="rgba(245, 158, 11, 0.2)"
            yAxisLabel="Count"
          />
        </ChartContainer>

        {/* Network Traffic Charts */}
        <ChartContainer title="Network Received">
          <LineChart
            data={networkReceived}
            label="Received (MB)"
            borderColor="#3b82f6"
            backgroundColor="rgba(59, 130, 246, 0.2)"
            yAxisLabel="MB"
          />
        </ChartContainer>
        <ChartContainer title="Network Sent">
          <LineChart
            data={networkSent}
            label="Sent (MB)"
            borderColor="#ef4444"
            backgroundColor="rgba(239, 68, 68, 0.2)"
            yAxisLabel="MB"
          />
        </ChartContainer>

        {/* Response Time Chart */}
        <ChartContainer title="Average Response Time">
          <LineChart
            data={responseTimes}
            label="Response Time (s)"
            borderColor="#4f46e5"
            backgroundColor="rgba(79, 70, 229, 0.2)"
            yAxisLabel="Seconds"
          />
        </ChartContainer>

        {/* Database Sizes Bar Chart */}
        <div>
        <ChartContainer title="Database Sizes">
          <BarChart
            labels={dbLabels}
            data={dbSizes}
            backgroundColor="rgba(0, 202, 209, 0.6)"
            borderColor="rgb(0, 184, 190)" 
          />
        </ChartContainer>
        </div>
      </div>
      {/* Collapsible Tree for Database Structure */}
      <div className="mt-8">
        <DatabaseTree databases={staticData.databases || []} />
      </div>
    </div>
  );
};

export default App;