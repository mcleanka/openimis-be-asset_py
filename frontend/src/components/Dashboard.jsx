import { useFetch } from "../hooks";
import StatCard from "./common/StatCard";
import { useEffect, useState } from "react";
import ErrorAlert from "./common/ErrorAlert";
import LoadingSpinner from "./common/LoadingSpinner";

function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    totalAssets: 0,
    totalUsers: 0,
    totalRegions: 0,
    availableAssets: 0,
    assignedAssets: 0,
    assetsInRepair: 0,
    retiredAssets: 0,
    assetsByRegion: {},
    assetsByType: {},
  });

  const {
    data: assetsData,
    loading: assetsLoading,
    error: assetsError,
    retry: retryAssets,
  } = useFetch("/api/assets");

  const { data: regionsData, loading: regionsLoading } =
    useFetch("/api/regions");

  const { data: usersData, loading: usersLoading } = useFetch("/api/users");

  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useFetch("/api/dashboard/stats/");

  const isLoading =
    assetsLoading || usersLoading || regionsLoading || dashboardLoading;
  const hasError = assetsError || dashboardError;

  const handleRetry = () => {
    retryAssets();
  };

  useEffect(() => {
    setDashboardStats((prevStats) => ({
      ...prevStats,
      totalAssets: Array.isArray(assetsData)
        ? assetsData.length
        : dashboardData?.total_assets || prevStats.totalAssets,
      totalUsers: Array.isArray(usersData)
        ? usersData.length
        : dashboardData?.total_users || prevStats.totalUsers,
      totalRegions: Array.isArray(regionsData)
        ? regionsData.length
        : dashboardData?.total_regions || prevStats.totalRegions,
      availableAssets:
        dashboardData?.available_assets || prevStats.availableAssets,
      assignedAssets:
        dashboardData?.assigned_assets || prevStats.assignedAssets,
      assetsInRepair:
        dashboardData?.assets_in_repair || prevStats.assetsInRepair,
      retiredAssets: dashboardData?.retired_assets || prevStats.retiredAssets,
      assetsByRegion:
        dashboardData?.assets_by_region || prevStats.assetsByRegion,
      assetsByType: dashboardData?.assets_by_type || prevStats.assetsByType,
    }));
  }, [assetsData, usersData, regionsData, dashboardData]);

  if (hasError) return <ErrorAlert message={hasError} onRetry={handleRetry} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Dashboard Overview
        </h2>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Assets"
              value={dashboardStats.totalAssets}
              description="Total Assets"
              icon={
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              }
            />

            <StatCard
              title="Users"
              value={dashboardStats.totalUsers}
              description="Total Users"
              icon={
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
            />

            <StatCard
              title="Regions"
              value={dashboardStats.totalRegions}
              description="Total Regions"
              icon={
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7.5m0 12.5l6-3m-6 3V7.5m6 12.5l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.553-.894L15 7.5m0 12.5V7.5"
                  />
                </svg>
              }
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">
                Asset Distribution By Status
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Available
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardStats.availableAssets}
                  </p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Assigned
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardStats.assignedAssets}
                  </p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Under Maintenance
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardStats.assetsInRepair}
                  </p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Retired
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardStats.retiredAssets}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {Object.keys(dashboardStats.assetsByRegion).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  Assets Distribution By Region
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(dashboardStats.assetsByRegion).map(
                    ([region, count]) => (
                      <div
                        key={region}
                        className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {region}
                        </span>
                        <span className="text-xl font-semibold text-gray-900">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {Object.keys(dashboardStats.assetsByType).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  Assets Distribution By Type
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(dashboardStats.assetsByType).map(
                    ([type, count]) => (
                      <div
                        key={type}
                        className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {type}
                        </span>
                        <span className="text-xl font-semibold text-gray-900">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
