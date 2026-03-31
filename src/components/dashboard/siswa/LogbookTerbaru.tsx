import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Badge from "../../ui/badge/Badge";

interface Logbook {
  id: number;
  date: string;
  activity: string;
  status: "Approved" | "Pending" | "Revision";
}

const tableData: Logbook[] = [
  { id: 1, date: "20 Okt 2026", activity: "Mempelajari instalasi server lokal", status: "Approved" },
  { id: 2, date: "21 Okt 2026", activity: "Membuat dokumentasi API", status: "Pending" },
  { id: 3, date: "22 Okt 2026", activity: "Meeting mingguan divisi IT", status: "Revision" },
];

export default function LogbookTerbaru() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Aktivitas Terakhir</h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs">Tanggal</TableCell>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs min-w-[200px]">Aktivitas</TableCell>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs">Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((log) => (
              <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                <TableCell className="py-4 text-gray-500 text-theme-sm font-medium whitespace-nowrap">{log.date}</TableCell>
                <TableCell className="py-4 text-gray-800 dark:text-white/90 font-medium text-theme-sm">
                  <p className="truncate max-w-[300px]">{log.activity}</p>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    color={
                      log.status === "Approved" ? "success"
                        : log.status === "Pending" ? "warning"
                        : "error"
                    }
                  >
                    {log.status === "Revision" ? "Revisi" : log.status === "Approved" ? "Disetujui" : "Menunggu"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}