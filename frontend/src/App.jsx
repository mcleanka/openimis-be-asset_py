import React, { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import AssetList from "./components/AssetList";
import AssetForm from "./components/AssetForm";
import UserList from "./components/UserList";
import RegionList from "./components/RegionList";

function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [editingAsset, setEditingAsset] = useState(null);

  const handleCreateNew = () => {
    setEditingAsset(null);
    setCurrentView("assetForm");
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setCurrentView("assetForm");
  };

  const handleFormClose = () => {
    setEditingAsset(null);
    setCurrentView("assets");
  };

  return (
    <div>
      <h1>Asset Management System</h1>

      <nav>
        <button onClick={() => setCurrentView("dashboard")}>Dashboard</button>
        <button onClick={() => setCurrentView("assets")}>Assets</button>
        <button onClick={() => setCurrentView("users")}>Users</button>
        <button onClick={() => setCurrentView("regions")}>Regions</button>
      </nav>

      <hr />

      {currentView === "dashboard" && <Dashboard />}

      {currentView === "assets" && (
        <AssetList onCreateNew={handleCreateNew} onEdit={handleEdit} />
      )}

      {currentView === "assetForm" && (
        <AssetForm asset={editingAsset} onClose={handleFormClose} />
      )}

      {currentView === "users" && <UserList />}

      {currentView === "regions" && <RegionList />}
    </div>
  );
}

export default App;
