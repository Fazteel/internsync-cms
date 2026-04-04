import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SearchInput, SelectInput, TableTopControls, TablePagination, TableDataState } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
// IMPORT STORE LU DI SINI
import { useSummaryStore } from "../../store/Koordinator/useSummaryStore";
import { useMasterStore } from "../../store/Admin/useMasterStore";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function SummaryReport() {
  const { data, isLoading, fetchSummary, downloadExcel, downloadStudentPdf } = useSummaryStore();
  const { majors, fetchMajors } = useMasterStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMajor, setFilterMajor] = useState("All");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchMajors();
  }, [fetchMajors]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSummary({
        search: searchTerm,
        status: filterStatus,
        major: filterMajor
      });
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterStatus, filterMajor, fetchSummary]);

  const handlePrintReport = async (studentId: number, studentName: string) => {
    setAlertInfo({ show: true, variant: "info", title: "Cetak Laporan", message: `Menyiapkan rapor untuk ${studentName}...` });
    try {
      await downloadStudentPdf(studentId);
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Gagal mengunduh rapor." });
    }
  };

  const handleExportExcel = async () => {
    setAlertInfo({ show: true, variant: "info", title: "Export Excel", message: "Sedang mengunduh data rekapitulasi..." });
    try {
      await downloadExcel({ search: searchTerm, status: filterStatus, major: filterMajor });
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Gagal export data." });
    }
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        setAlertInfo((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <PageMeta title="Rekapitulasi PKL | Sistem Manajemen PKL" description="Laporan akhir, status, dan rekapitulasi nilai siswa PKL." />

      <div className="space-y-6">

        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <PageHeader
          title="Rekapitulasi & Status Akhir"
          description="Pantau status terkini dan hasil akhir penilaian PKL seluruh siswa."
        >
          <SearchInput
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
            }} placeholder="Cari Siswa / NIS..." />
          <SelectInput
            value={filterMajor}
            onChange={(val) => setFilterMajor(val)}>
            <option value="All">Semua Jurusan</option>
            {majors.map((m) => (
              <option key={m.id} value={m.kode}>{m.kode}</option>
            ))}
          </SelectInput>
          <SelectInput
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}>
            <option value="All">Semua Status</option>
            <option value="Aktif">Aktif Magang</option>
            <option value="Selesai">Selesai</option>
            <option value="Bermasalah">Bermasalah</option>
          </SelectInput>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-center text-sm font-bold text-white shadow-theme-xs hover:bg-brand-600 transition-colors w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export (Excel)
          </button>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">

          <TableTopControls
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalData={data.length}
            setCurrentPage={setCurrentPage}
          />

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Siswa & Jurusan</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Industri & Pembimbing</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap">Status PKL</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap">Nilai Akhir</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState isLoading={isLoading} isEmpty={paginatedData.length === 0} colSpan={5}>
                  {paginatedData.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 whitespace-nowrap">
                        <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{student.name}</p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">{student.nis} • {student.major}</span>
                      </TableCell>

                      <TableCell className="py-4 text-theme-sm whitespace-nowrap">
                        <p className="font-medium text-gray-800 dark:text-white/90">{student.industry}</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5">Guru: {student.supervisor}</p>
                      </TableCell>

                      <TableCell className="py-4 whitespace-nowrap">
                        <div className="flex items-start mt-1">
                          <Badge color={student.status === "Selesai" ? "primary" : student.status === "Aktif" ? "success" : "error"}>
                            {student.status}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 text-center whitespace-nowrap">
                        {student.finalScore !== null ? (
                          <span className="inline-flex px-2 py-1 items-center justify-center rounded-full border-2 border-brand-100 bg-brand-50 text-sm font-bold text-brand-700 dark:border-brand-800/30 dark:bg-brand-900/20 dark:text-brand-300 shadow-sm">
                            {student.finalScore}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic block mt-1">-</span>
                        )}
                      </TableCell>

                      <TableCell className="py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handlePrintReport(student.id, student.name)}
                          disabled={student.status !== "Selesai"}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${student.status === "Selesai"
                              ? "bg-brand-500 text-white hover:bg-brand-600 shadow-[0_2px_8px_rgba(0,104,55,0.2)] cursor-pointer"
                              : "bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-600"
                            }`}
                          title={student.status !== "Selesai" ? "Hanya bisa dicetak jika status sudah Selesai" : "Cetak Sertifikat/Rapor"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                          Cetak Laporan
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableDataState>
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
}