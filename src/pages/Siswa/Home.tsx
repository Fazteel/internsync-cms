import PageMeta from "../../components/common/PageMeta";
import {
  StudentMetrics,
  RecentLogbooks,
  InternshipProgress
} from "../../components/dashboard";
import { useDashboardStore } from "../../store/useDashboardStore";

export default function DashboardSiswa() {
  const { lastUpdated } = useDashboardStore();

  return (
    <>
      <PageMeta
        title="Dashboard Siswa | Sistem Manajemen PKL"
        description="Dashboard utama untuk memantau progres kegiatan PKL Siswa"
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
        
        <div className="col-span-12 xl:col-span-7 flex flex-col gap-4 md:gap-6">
          <StudentMetrics />
          <RecentLogbooks />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <InternshipProgress />
        </div>

      </div>
    </>
  );
}