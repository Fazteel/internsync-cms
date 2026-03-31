import { useEffect } from "react";
import { GroupIcon, PageIcon } from "../../../icons"; 
import { useDashboardStore } from "../../../store/useDashboardStore";
import Badge from "../../ui/badge/Badge";

export default function HubinMetrics() {
  const { hubinMetrics: metrics, fetchHubinDashboard } = useDashboardStore();

  useEffect(() => {
    fetchHubinDashboard();
  }, [fetchHubinDashboard]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900/30 dark:bg-brand-900/10 md:p-6 shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl dark:bg-brand-800/50 shadow-theme-xs">
          <GroupIcon className="text-brand-600 size-6 dark:text-brand-300" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-brand-700 dark:text-brand-400/80">Total Industri Mitra</span>
            <h4 className="mt-1 font-bold text-gray-900 text-title-sm dark:text-white">
              {metrics.total_industri} Perusahaan
            </h4>
          </div>
          <Badge color="success">MoU Aktif</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-100 bg-accent-50/50 p-5 dark:border-accent-900/30 dark:bg-accent-900/10 md:p-6 shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl dark:bg-accent-800/50 shadow-theme-xs">
          <PageIcon className="text-accent-600 size-6 dark:text-accent-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-accent-800 dark:text-accent-400/80">Menunggu Persetujuan</span>
            <h4 className="mt-1 font-bold text-gray-900 text-title-sm dark:text-white">
              {metrics.total_requests} Pengajuan
            </h4>
          </div>
          <Badge color="warning">Cek Dokumen</Badge>
        </div>
      </div>
    </div>
  );
}