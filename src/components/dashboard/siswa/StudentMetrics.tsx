import { useEffect } from "react";
import { GroupIcon } from "../../../icons";
import { useDashboardStore } from "../../../store/useDashboardStore";

export default function SiswaMetrics() {
  const { siswaMetrics, fetchSiswaDashboard } = useDashboardStore();

  useEffect(() => {
    fetchSiswaDashboard();
  }, [fetchSiswaDashboard]);

  return (
    <div className="grid grid-cols-1">
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900/30 dark:bg-brand-900/10 md:p-6 shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl dark:bg-brand-800/50 shadow-theme-xs">
          <GroupIcon className="text-brand-600 size-6 dark:text-brand-300" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-brand-700 dark:text-brand-400/80">Total Logbook Diisi</span>
            <h4 className="mt-1 font-bold text-gray-900 text-title-sm dark:text-white">
              {siswaMetrics.total_logbook_diisi || 0} Catatan
            </h4>
          </div>
          <span className="px-3 py-1 text-xs font-bold bg-white text-brand-700 rounded-full border border-brand-200 shadow-sm">
            Semangat PKL!
          </span>
        </div>
      </div>
    </div>
  );
}