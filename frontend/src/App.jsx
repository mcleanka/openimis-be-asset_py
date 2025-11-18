import { useState } from "react";
import Dashboard from "./components/Dashboard";
import AssetList from "./components/AssetList";
import AssetForm from "./components/AssetForm";
import UserList from "./components/UserList";
import UserForm from "./components/UserForm";
import RegionList from "./components/RegionList";
import RegionForm from "./components/RegionForm";
import NavTab from "./components/common/NavTab";

const VIEWS = {
  DASHBOARD: "dashboard",
};

const ENTITIES = [
  {
    id: "assets",
    label: "Assets",
    listView: "assets",
    formView: "assetForm",
    ListComponent: AssetList,
    FormComponent: AssetForm,
    propName: "asset",
  },
  {
    id: "users",
    label: "Users",
    listView: "users",
    formView: "userForm",
    ListComponent: UserList,
    FormComponent: UserForm,
    propName: "user",
  },
  {
    id: "regions",
    label: "Regions",
    listView: "regions",
    formView: "regionForm",
    ListComponent: RegionList,
    FormComponent: RegionForm,
    propName: "region",
  },
];

const NAV_ITEMS = [
  { id: VIEWS.DASHBOARD, label: "Dashboard" },
  ...ENTITIES.map((entity) => ({ id: entity.listView, label: entity.label })),
];

function App() {
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  const [editingItems, setEditingItems] = useState({});

  // Generic handlers that work for any entity
  const handleCreateNew = (entityConfig) => {
    setEditingItems((prev) => ({ ...prev, [entityConfig.id]: null }));
    setCurrentView(entityConfig.formView);
  };

  const handleEdit = (entityConfig, item) => {
    setEditingItems((prev) => ({ ...prev, [entityConfig.id]: item }));
    setCurrentView(entityConfig.formView);
  };

  const handleFormClose = (entityConfig) => {
    setEditingItems((prev) => ({ ...prev, [entityConfig.id]: null }));
    setCurrentView(entityConfig.listView);
  };

  const renderView = () => {
    if (currentView === VIEWS.DASHBOARD) {
      return <Dashboard />;
    }

    for (const entity of ENTITIES) {
      if (currentView === entity.listView) {
        const ListComponent = entity.ListComponent;
        return (
          <ListComponent
            onCreateNew={() => handleCreateNew(entity)}
            onEdit={(item) => handleEdit(entity, item)}
          />
        );
      }

      if (currentView === entity.formView) {
        const FormComponent = entity.FormComponent;
        const props = {
          [entity.propName]: editingItems[entity.id],
          onClose: () => handleFormClose(entity),
        };
        return <FormComponent {...props} />;
      }
    }

    return <Dashboard />;
  };

  const isActiveTab = (navItemId) => {
    if (currentView === navItemId) return true;

    const entity = ENTITIES.find((e) => e.listView === navItemId);
    return entity && currentView === entity.formView;
  };

  return (
    <div className="min-h-screen bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              isActive={isActiveTab(item.id)}
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
