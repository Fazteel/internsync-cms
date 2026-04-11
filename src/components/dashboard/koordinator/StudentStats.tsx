import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useDashboardStore } from "../../../store/useDashboardStore";

export default function StatusSiswa() {
  const { koordinatorTable: table, isLoading } = useDashboardStore();

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif': return <Badge color="success">Aktif</Badge>;
      case 'selesai': return <Badge color="primary">Selesai</Badge>;
      case 'batal': return <Badge color="error">Dibatalkan</Badge>;
      default: return <Badge color="gray">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Daftar Status Siswa Terkini</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Pantau penempatan dan status terkini seluruh siswa.</p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Nama & NIS</TableCell>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Jurusan</TableCell>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Penempatan Industri</TableCell>
              <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap">Status PKL</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="py-4 text-center text-gray-500">Memuat data...</TableCell></TableRow>
            ) : (table?.length || 0) === 0 ? (
              <TableRow><TableCell colSpan={4} className="py-4 text-center text-gray-500">Belum ada data siswa.</TableCell></TableRow>
            ) : (
              table.map((student) => (
                <TableRow key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <TableCell className="py-3 whitespace-nowrap">
                    <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{student.name}</p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">{student.nis}</span>
                  </TableCell>

                  <TableCell className="py-3 text-gray-600 dark:text-gray-300 text-theme-sm whitespace-nowrap">
                    {student.major}
                  </TableCell>

                  <TableCell className="py-3 text-gray-800 font-medium text-theme-sm dark:text-white/90 whitespace-nowrap">
                    {student.industry !== "Belum Ada" ? student.industry : (
                      <span className="text-error-500 italic bg-error-50 px-2 py-1 rounded-md dark:bg-error-500/10 dark:text-error-400">Menunggu Plotting</span>
                    )}
                  </TableCell>

                  <TableCell className="py-3 whitespace-nowrap">
                    {renderStatusBadge(student.status)}
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