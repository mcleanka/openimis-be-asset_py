import { useState } from "react";
import Dashboard from "./components/Dashboard";
import AssetList from "./components/AssetList";
import AssetForm from "./components/AssetForm";
import UserList from "./components/UserList";
import RegionList from "./components/RegionList";
import NavTab from "./components/common/NavTab";

const VIEWS = {
  DASHBOARD: "dashboard",
  ASSETS: "assets",
  ASSET_FORM: "assetForm",
  USERS: "users",
  REGIONS: "regions",
};

const NAV_ITEMS = [
  { id: VIEWS.DASHBOARD, label: "Dashboard" },
  { id: VIEWS.ASSETS, label: "Assets" },
  { id: VIEWS.USERS, label: "Users" },
  { id: VIEWS.REGIONS, label: "Regions" },
];

function App() {
  const [editingAsset, setEditingAsset] = useState(null);
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);

  const handleCreateNew = () => {
    setEditingAsset(null);
    setCurrentView(VIEWS.ASSET_FORM);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setCurrentView(VIEWS.ASSET_FORM);
  };

  const handleFormClose = () => {
    setEditingAsset(null);
    setCurrentView(VIEWS.ASSETS);
  };

  const renderView = () => {
    switch (currentView) {
      case VIEWS.DASHBOARD:
        return <Dashboard />;
      case VIEWS.ASSETS:
        return <AssetList onCreateNew={handleCreateNew} onEdit={handleEdit} />;
      case VIEWS.ASSET_FORM:
        return <AssetForm asset={editingAsset} onClose={handleFormClose} />;
      case VIEWS.USERS:
        return <UserList />;
      case VIEWS.REGIONS:
        return <RegionList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <header className="border-b border-slate-200">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-slate-900 uppercase">
            Asset Management System
          </h1>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex space-x-1">
          {NAV_ITEMS.map((item) => (
            <NavTab
              key={item.id}
              label={item.label}
              isActive={currentView === item.id}
              onClick={() => setCurrentView(item.id)}
            />
          ))}
        </div>
      </nav>

      <main className="py-5">{renderView()}</main>
    </div>
  );
}

export default App;
