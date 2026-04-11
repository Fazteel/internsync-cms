import { useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import { Link } from "react-router-dom";
import { useDashboardStore } from "../../../store/useDashboardStore";

interface LogbookEntry {
  id: string | number;
  studentName: string;
  industry: string;
  date: string;
  activity: string;
}

export default function LogbookRecent() {
  const {
    pembimbingRecentLogbooks,
    fetchPembimbingDashboard,
    isLoading
  } = useDashboardStore();

  useEffect(() => {
    fetchPembimbingDashboard();
  }, [fetchPembimbingDashboard]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
              Logbook Terbaru
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Daftar catatan aktivitas harian terbaru dari siswa bimbingan Anda.
            </p>
          </div>
          <Link to="/pembimbing/logbook-recent">
            <button className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-bold transition-colors">
              Lihat Semua Logbook
            </button>
          </Link>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50/50 dark:bg-gray-800/20">
              <TableRow>
                <TableCell isHeader className="py-3 font-bold text-gray-500 text-start text-theme-xs uppercase tracking-wider min-w-[150px] whitespace-nowrap w-[40%]">Nama Siswa</TableCell>
                <TableCell isHeader className="py-3 font-bold text-gray-500 text-start text-theme-xs uppercase tracking-wider min-w-[150px] whitespace-nowrap w-[30%]">Tanggal</TableCell>
                <TableCell isHeader className="py-3 font-bold text-gray-500 text-start text-theme-xs uppercase tracking-wider min-w-[150px] whitespace-nowrap w-[30%]">Aktivitas Singkat</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    Memuat data logbook terbaru...
                  </TableCell>
                </TableRow>
              ) : (!pembimbingRecentLogbooks || pembimbingRecentLogbooks.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500 italic">
                    Belum ada aktivitas logbook terbaru dari siswa.
                  </TableCell>
                </TableRow>
              ) : (
                pembimbingRecentLogbooks.map((log: LogbookEntry) => (
                  <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <TableCell className="py-4 whitespace-nowrap align-top">
                      <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{log.studentName}</p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">{log.industry}</span>
                    </TableCell>
                    <TableCell className="py-4 text-gray-800 font-bold text-theme-sm whitespace-nowrap align-top">
                      {log.date}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600 dark:text-gray-300 text-theme-sm align-top">
                      <p className="line-clamp-2 leading-relaxed max-w-lg" title={log.activity}>
                        {log.activity}
                      </p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}