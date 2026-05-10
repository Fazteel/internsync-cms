import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SelectInput, TableDataState, TablePagination, TableTopControls } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { useIndustryVisitStore } from "../../store/Pembimbing/useIndustryVisitStore";

type AlertVariant = "success" | "warning" | "info" | "error";
type FilterStatusType = "All" | "Approved" | "Pending" | "Rejected";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function IndustryVisit() {
  const { visits, fetchVisits, isLoading, viewVisitLetter } = useIndustryVisitStore();

  const [filterStatus, setFilterStatus] = useState<FilterStatusType>("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleViewLetter = async (id: number) => {
    setAlertInfo({ show: true, variant: "info", title: "Memproses", message: "Membuka dokumen SPPD..." });
    try {
      await viewVisitLetter(id);
      setAlertInfo({ show: false, variant: "success", title: "", message: "" });
    } catch (error) {
      console.error("Error opening letter:", error);
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "File belum siap atau Anda tidak memiliki akses." });
    }
  };

  useEffect(() => {
    if (alertInfo.show && alertInfo.variant !== "info") {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show, alertInfo.variant]);

  const filteredVisit = visits.filter((v) => {
    const matchStatus = filterStatus === "All" ? true : v.status === filterStatus;
    return matchStatus;
  });

  const totalPages = Math.ceil(filteredVisit.length / rowsPerPage);
  const paginatedData = filteredVisit.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <PageMeta title="Jadwal Monitoring | Sistem Manajemen PKL" description="Pantau jadwal kunjungan monitoring ke industri tempat siswa PKL." />

      <div className="space-y-6">
        {alertInfo.show && <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />}

        <PageHeader title="Jadwal Kunjungan Industri" description="Lihat jadwal penugasan monitoring yang telah ditetapkan oleh Koordinator PKL.">
          <SelectInput
            value={filterStatus}
            onChange={(val) => {
              setFilterStatus(val as FilterStatusType);
              setCurrentPage(1);
            }}
          >
            <option value="All">Semua Status</option>
            <option value="Approved">Disetujui (SPPD Terbit)</option>
            <option value="Pending">Menunggu ACC</option>
            <option value="Rejected">Ditolak</option>
          </SelectInput>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <TableTopControls
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalData={filteredVisit.length}
            setCurrentPage={setCurrentPage}
          />

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Industri</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Tanggal</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Tujuan Kunjungan</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap min-w-[150px]">Status</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap min-w-[150px]">Aksi</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState isLoading={isLoading} isEmpty={visits.length === 0} colSpan={5} emptyText="Belum ada jadwal kunjungan.">
                  {paginatedData.map((visit) => (
                    <TableRow key={visit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 font-bold text-start text-gray-800 dark:text-white/90">{visit.industry}</TableCell>
                      <TableCell className="py-4 text-start text-sm text-gray-600 dark:text-gray-300">{visit.plannedDate}</TableCell>
                      <TableCell className="py-4 text-theme-sm text-start text-gray-600 dark:text-gray-300">
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold">{visit.purpose}</p>
                          {/* NAMPILIN FEEDBACK LANGSUNG DI BAWAHNYA KALO DITOLAK */}
                          {visit.status === "Rejected" && visit.feedback && (
                            <span className="text-xs text-error-600 italic border-l-2 border-error-300 pl-2 mt-1">"{visit.feedback}"</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Badge color={visit.status === "Approved" ? "success" : visit.status === "Pending" ? "warning" : "error"}>
                          {visit.status === "Approved" ? "Disetujui" : visit.status === "Pending" ? "Menunggu" : "Ditolak"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center whitespace-nowrap align-top">
                        <div className="flex items-center justify-center">
                          {visit.status === "Approved" ? (
                            <button
                              onClick={() => handleViewLetter(visit.id)}
                              className="inline-flex items-center gap-2 rounded bg-brand-50 border border-brand-200 px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 hover:text-brand-800 transition-colors shadow-sm w-30 justify-center"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                              Lihat Surat
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-gray-400 italic">Belum tersedia</span>
                          )}
                        </div>
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