import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import { useDashboardStore } from "../../../store/useDashboardStore";

export default function RecentLogbooks() {
  const { siswaRecentLogbooks, isLoading } = useDashboardStore();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Aktivitas Terakhir</h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50/50 dark:bg-gray-800/20">
            <TableRow>
              <TableCell isHeader className="py-3 font-bold text-gray-500 text-start text-theme-xs uppercase tracking-wider w-[25%] whitespace-nowrap">Tanggal</TableCell>
              <TableCell isHeader className="py-3 font-bold text-gray-500 text-start text-theme-xs uppercase tracking-wider w-[75%]">Deskripsi Aktivitas</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <TableRow><TableCell colSpan={2} className="py-6 text-center text-sm text-gray-500">Memuat riwayat logbook...</TableCell></TableRow>
            ) : (!siswaRecentLogbooks || siswaRecentLogbooks.length === 0) ? (
              <TableRow><TableCell colSpan={2} className="py-6 text-center text-sm text-gray-500 italic">Belum ada aktivitas logbook tercatat.</TableCell></TableRow>
            ) : (
              siswaRecentLogbooks.map((log) => (
                <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <TableCell className="py-4 text-gray-800 font-bold text-theme-sm whitespace-nowrap align-top">
                    {log.date}
                  </TableCell>
                  <TableCell className="py-4 text-gray-600 dark:text-gray-300 font-medium text-theme-sm align-top">
                    <p className="line-clamp-2 max-w-lg leading-relaxed" title={log.activity}>
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
  );
}