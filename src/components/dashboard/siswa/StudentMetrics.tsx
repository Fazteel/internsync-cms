import { useEffect } from "react";
import { BoxIconLine, GroupIcon } from "../../../icons"; 
import Badge from "../../ui/badge/Badge";
import { useDashboardStore } from "../../../store/useDashboardStore";

export default function SiswaMetrics() {
  const { siswaMetrics, fetchSiswaDashboard } = useDashboardStore();

  useEffect(() => {
    fetchSiswaDashboard();
  }, [fetchSiswaDashboard]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900/30 dark:bg-brand-900/10 md:p-6 shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl dark:bg-brand-800/50 shadow-theme-xs">
          <GroupIcon className="text-brand-600 size-6 dark:text-brand-300" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-brand-700 dark:text-brand-400/80">Logbook Disetujui</span>
            <h4 className="mt-1 font-bold text-gray-900 text-title-sm dark:text-white">
              {siswaMetrics.approved_count} Hari
            </h4>
          </div>
          <Badge color="success">Aman</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-error-100 bg-error-50 p-5 dark:border-error-900/30 dark:bg-error-900/10 md:p-6 shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl dark:bg-error-800/50 shadow-theme-xs">
          <BoxIconLine className="text-error-600 size-6 dark:text-error-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-error-800 dark:text-error-400/80">Revisi Logbook</span>
            <h4 className="mt-1 font-bold text-gray-900 text-title-sm dark:text-white">
              {siswaMetrics.revision_count} Catatan
            </h4>
          </div>
          <Badge color="error">Cek Segera</Badge>
        </div>
      </div>
    </div>
  );
}