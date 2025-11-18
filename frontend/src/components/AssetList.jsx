import React, { useState, useEffect } from "react";
import axios from "axios";

function AssetList({ onCreateNew, onEdit }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      if (!isInitialLoad) {
        setLoading(true);
      }
      const response = await axios.get("/api/assets/");
      setAssets(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load assets");
      console.error("Error fetching assets:", err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await axios.delete(`/api/assets/${id}/`);
        fetchAssets();
      } catch (err) {
        alert("Failed to delete asset");
        console.error("Error deleting asset:", err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>{assets.length === 0 ? "Asset Management System" : "Assets"}</h2>
      <button onClick={onCreateNew}>Create New Asset</button>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Name</th>
              <th>Serial Number</th>
              <th>Region</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 ? (
              <tr>
                <td colSpan="4">no assets found</td>{" "}
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.name}</td>
                  <td>{asset.serial_number}</td>
                  <td>{asset.region_name}</td>
                  <td>
                    <button onClick={() => onEdit(asset)}>Edit</button>
                    <button onClick={() => handleDelete(asset.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AssetList;
