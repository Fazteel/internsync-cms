import PageMeta from "../../components/common/PageMeta";
import {
  CoordinatorMetrics,
  PlacementTrendChart,
  StudentStats
} from "../../components/dashboard";
import { useDashboardStore } from "../../store/useDashboardStore";

export default function KoordinatorHome() {
  const { lastUpdated } = useDashboardStore();

  return (
    <>
      <PageMeta
        title="Dashboard Koordinator | Sistem Manajemen PKL"
        description="Dashboard untuk mengelola penempatan dan memantau status PKL siswa."
      />
      
      <div className="col-span-12 flex justify-end mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800">
          <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></div>
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            Data diperbarui pada: {lastUpdated || "--:--"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        
        <div className="col-span-12">
          <CoordinatorMetrics />
        </div>

        <div className="col-span-12">
          <PlacementTrendChart />
        </div>

        <div className="col-span-12">
          <StudentStats />
        </div>

      </div>
    </>
  );
}