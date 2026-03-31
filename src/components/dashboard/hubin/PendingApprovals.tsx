import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import { useDashboardStore } from "../../../store/useDashboardStore";

export default function PendingApprovals() {
  const { hubinTable, isLoading } = useDashboardStore();

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
              Antrean Persetujuan (Approval)
            </h3>
            <p className="mt-1 text-sm text-gray-500">Silakan tinjau dan setujui keberangkatan siswa.</p>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Pengaju</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Jenis Pengajuan</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">Tanggal</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">Aksi</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="py-6 text-center text-sm text-gray-500">Memuat data antrean...</TableCell></TableRow>
              ) : hubinTable.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="py-6 text-center text-sm text-gray-500">Tidak ada antrean persetujuan saat ini.</TableCell></TableRow>
              ) : (
                hubinTable.map((req) => (
                  <TableRow key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <TableCell className="py-3 whitespace-nowrap">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{req.requester}</p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">{req.role}</span>
                    </TableCell>
                    <TableCell className="py-3 text-gray-600 font-medium text-theme-sm whitespace-nowrap dark:text-gray-300">
                      {req.type}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm whitespace-nowrap">{req.date}</TableCell>
                    <TableCell className="py-3 whitespace-nowrap">
                      <Link 
                        to="/hubin/approval-berangkat"
                        className="inline-flex items-center gap-1.5 rounded bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20 transition-colors"
                      >
                        Tinjau Pengajuan
                      </Link>
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