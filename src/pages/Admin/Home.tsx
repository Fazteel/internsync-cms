import PageMeta from "../../components/common/PageMeta";
import {
  AdminBanner,
  AdminStats,
  AdminShortcuts,
  AdminRecentActivities
} from "../../components/dashboard";
import { useDashboardStore } from "../../store/useDashboardStore";

export default function AdminHome() {
  const { lastUpdated } = useDashboardStore();
  
  return (
    <>
      <PageMeta
        title="Dashboard Admin | Sistem Manajemen PKL"
        description="Pusat kendali dan ringkasan statistik sistem untuk Administrator."
      />

      
      <div className="col-span-12 flex justify-end mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800">
          <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></div>
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            Data diperbarui pada: {lastUpdated || "--:--"}
          </span>
        </div>
      </div>


      <div className="space-y-6">
        <AdminBanner />
        <AdminStats />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AdminShortcuts />
          <AdminRecentActivities />
        </div>
      </div>
    </>
  );
}