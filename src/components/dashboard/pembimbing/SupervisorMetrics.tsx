import { GroupIcon, BoxIconLine, CalenderIcon } from "../../../icons"; 
import Badge from "../../ui/badge/Badge";
import { useDashboardStore } from "../../../store/useDashboardStore";
import { useEffect } from "react";

export default function PembimbingMetrics() {
  const { pembimbingMetrics: metrics, fetchPembimbingDashboard } = useDashboardStore();

  useEffect(() => {
    fetchPembimbingDashboard();
  }, [fetchPembimbingDashboard]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900/30 dark:bg-brand-900/10 md:p-6 shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl dark:bg-brand-800/50 shadow-theme-xs">
          <GroupIcon className="text-brand-600 size-6 dark:text-brand-300" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-brand-700 dark:text-brand-400/80">Total Bimbingan</span>
            <h4 className="mt-1 font-bold text-gray-900 text-title-sm dark:text-white">
              {metrics.total_bimbingan} Siswa
            </h4>
          </div>
          <Badge color="success">Aktif</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-100 bg-accent-50/50 p-5 dark:border-accent-900/30 dark:bg-accent-900/10 md:p-6 shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl dark:bg-accent-800/50 shadow-theme-xs">
          <BoxIconLine className="text-accent-600 size-6 dark:text-accent-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-accent-800 dark:text-accent-400/80">Menunggu Verifikasi</span>
            <h4 className="mt-1 font-bold text-gray-900 text-title-sm dark:text-white">
              {metrics.menunggu_verifikasi} Logbook
            </h4>
          </div>
          <Badge color="warning">Butuh Aksi</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-xl dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
          <CalenderIcon className="text-gray-600 size-6 dark:text-gray-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Kunjungan Bulan Ini</span>
            <h4 className="mt-1 font-bold text-gray-900 text-title-sm dark:text-white">
              {metrics.kunjungan_bulan_ini} Industri
            </h4>
          </div>
          <Badge color="primary">Terjadwal</Badge>
        </div>
      </div>
    </div>
  );
}