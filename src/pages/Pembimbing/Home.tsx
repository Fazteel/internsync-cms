import PageMeta from "../../components/common/PageMeta";
import {
  SupervisorMetrics,
  SupervisionActivityChart
} from "../../components/dashboard";
import { useDashboardStore } from "../../store/useDashboardStore";

export default function DashboardPembimbing() {
  const { lastUpdated } = useDashboardStore();
  return (
    <>
      <PageMeta
        title="Dashboard Pembimbing | Sistem Manajemen PKL"
        description="Dashboard utama untuk memantau dan memverifikasi kegiatan PKL siswa bimbingan."
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
          <SupervisorMetrics />
        </div>

        <div className="col-span-12">
          <SupervisionActivityChart />
        </div>

        <div className="col-span-12">
          {/* <PendingLogbooks /> */}
        </div>

      </div>
    </>
  );
}