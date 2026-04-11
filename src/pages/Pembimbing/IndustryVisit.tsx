import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SelectInput, TableDataState, TablePagination, TableTopControls } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useIndustryVisitStore, IndustryVisitRecord } from "../../store/Pembimbing/useIndustryVisitStore";

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

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<IndustryVisitRecord | null>(null);

  const [filterStatus, setFilterStatus] = useState<FilterStatusType>("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleOpenDetailModal = (visit: IndustryVisitRecord) => {
    setSelectedVisit(visit);
    setIsDetailModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsDetailModalOpen(false);
    setSelectedVisit(null);
  };

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

        <PageHeader title="Jadwal Kunjungan Industri" description="Lihat jadwal monitoring industri yang telah ditetapkan oleh Koordinator PKL.">
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
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Tanggal Rencana</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Tujuan Kunjungan</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Status</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap min-w-[150px]">Aksi</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState isLoading={isLoading} isEmpty={visits.length === 0} colSpan={5} emptyText="Belum ada jadwal kunjungan.">
                  {paginatedData.map((visit) => (
                    <TableRow key={visit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 font-bold text-start text-gray-800 dark:text-white/90">{visit.industry}</TableCell>
                      <TableCell className="py-4 text-start text-sm text-gray-600 dark:text-gray-300">{visit.plannedDate}</TableCell>
                      <TableCell className="py-4 text-theme-sm text-start whitespace-nowrap text-gray-600 dark:text-gray-300">
                        <p className="truncate max-w-[300px]" title={visit.purpose}>
                          {visit.purpose}
                        </p>
                      </TableCell>
                      <TableCell className="py-4 text-start">
                        <Badge color={visit.status === "Approved" ? "success" : visit.status === "Pending" ? "warning" : "error"}>
                          {visit.status === "Approved" ? "Disetujui" : visit.status === "Pending" ? "Menunggu" : "Ditolak"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center whitespace-nowrap align-top">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenDetailModal(visit)}
                            className="inline-flex items-center gap-1 rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                          >
                            Detail
                          </button>

                          {visit.status === "Approved" && (
                            <button
                              onClick={() => handleViewLetter(visit.id)}
                              className="inline-flex items-center gap-1 rounded bg-brand-50 border border-brand-200 px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-100 transition-colors shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Cetak SPPD
                            </button>
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

      <Modal isOpen={isDetailModalOpen} onClose={handleCloseModals} className="max-w-lg p-0 overflow-hidden" showCloseButton={false}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${selectedVisit?.status === "Rejected" ? "bg-error-50 border-error-100 dark:bg-error-900/20 dark:border-error-800/30" : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"}`}>
          <h3 className={`text-lg font-bold ${selectedVisit?.status === "Rejected" ? "text-error-700 dark:text-error-500" : "text-gray-800 dark:text-white"}`}>
            Detail Jadwal Kunjungan
          </h3>
          <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Industri Tujuan</span>
              <p className="font-bold text-gray-800 dark:text-white mt-1">{selectedVisit?.industry}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-700">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tanggal Pelaksanaan</span>
              <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-1">{selectedVisit?.plannedDate}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-700">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Pengajuan</span>
              <div className="mt-1">
                <Badge color={selectedVisit?.status === "Approved" ? "success" : selectedVisit?.status === "Pending" ? "warning" : "error"}>
                  {selectedVisit?.status === "Approved" ? "Disetujui" : selectedVisit?.status === "Pending" ? "Menunggu" : "Ditolak"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              Agenda / Tujuan
            </span>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{selectedVisit?.purpose}</p>
          </div>

          {selectedVisit?.status === "Rejected" && selectedVisit?.feedback && (
            <div className="bg-error-50 p-4 rounded-xl border border-error-100 dark:bg-error-900/10 dark:border-error-800/30">
              <span className="text-xs font-bold text-error-700 dark:text-error-500 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
                Alasan Penolakan Hubin
              </span>
              <p className="text-sm text-error-600 dark:text-error-400 italic mt-2 leading-relaxed">"{selectedVisit.feedback}"</p>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 pt-0 border-t border-gray-100 dark:border-gray-800 mt-4">
          <button onClick={handleCloseModals} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 px-6 py-2 mt-4 rounded-lg font-bold transition-colors">Tutup</button>
        </div>
      </Modal>
    </>
  );
}