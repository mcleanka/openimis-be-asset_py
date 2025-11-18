import React, { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalUsers: 0,
    totalRegions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [assetsRes, usersRes, regionsRes] = await Promise.all([
        axios.get("/api/assets/"),
        axios.get("/api/users/"),
        axios.get("/api/regions/"),
      ]);

      setStats({
        totalAssets: assetsRes.data.length,
        totalUsers: usersRes.data.length,
        totalRegions: regionsRes.data.length,
      });
      setError(null);
    } catch (err) {
      setError("Failed to load statistics");
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h3>System Statistics</h3>
          <ul>
            <li>Total Assets: {stats.totalAssets}</li>
            <li>Total Users: {stats.totalUsers}</li>
            <li>Total Regions: {stats.totalRegions}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
