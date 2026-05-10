import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SearchInput, TableDataState, TablePagination, TableTopControls } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useEvaluationStore, VisitRecord } from "../../store/Pembimbing/useEvaluationStore";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function StudentEvaluation() {
  const {
    visits,
    studentsForm,
    isLoading,
    isFormLoading,
    fetchVisits,
    fetchMonitoringForm,
    updateStudentNote,
    submitBulkMonitoring,
    exportMonitoring
  } = useEvaluationStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleOpenModal = async (visit: VisitRecord) => {
    setSelectedVisit(visit);
    setIsModalOpen(true);
    await fetchMonitoringForm(visit.id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVisit(null);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;

    setIsSubmitting(true);
    try {
      await submitBulkMonitoring(selectedVisit.id);
      setAlertInfo({
        show: true,
        variant: "success",
        title: "Laporan Tersimpan",
        message: `Hasil monitoring untuk kunjungan ke ${selectedVisit.industry} berhasil disimpan secara massal.`,
      });
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting bulk monitoring:", error);
      setAlertInfo({ show: true, variant: "error", title: "Gagal Menyimpan", message: "Pastikan semua data telah diisi dengan benar atau coba lagi nanti." });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (alertInfo.show && alertInfo.variant !== "info") {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show, alertInfo.variant]);

  const filteredVisits = visits.filter((v) =>
    v.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVisits.length / rowsPerPage);
  const paginatedData = filteredVisits.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <PageMeta title="Monitoring Siswa | Sistem Manajemen PKL" description="Isi lembar laporan monitoring siswa berdasarkan jadwal kunjungan industri." />

      <div className="space-y-6">
        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <PageHeader title="Lembar Monitoring PKL" description="Pilih jadwal kunjungan industri untuk mengisi laporan monitoring siswa secara massal.">
          <div className="w-full sm:w-64">
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Cari nama industri..." />
          </div>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <TableTopControls rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} totalData={filteredVisits.length} setCurrentPage={setCurrentPage} />

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50/50 dark:bg-gray-800/20">
                <TableRow>
                  <TableCell isHeader className="py-3 font-bold text-gray-500 text-start text-theme-xs uppercase tracking-wider whitespace-nowrap w-[25%]">Industri Tujuan</TableCell>
                  <TableCell isHeader className="py-3 font-bold text-gray-500 text-start text-theme-xs uppercase tracking-wider whitespace-nowrap w-[20%]">Tanggal Kunjungan</TableCell>
                  <TableCell isHeader className="py-3 font-bold text-gray-500 text-start text-theme-xs uppercase tracking-wider whitespace-nowrap w-[40%]">Tujuan / Agenda</TableCell>
                  <TableCell isHeader className="py-3 font-bold text-gray-500 text-center text-theme-xs uppercase tracking-wider whitespace-nowrap w-[15%]">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState isLoading={isLoading} isEmpty={filteredVisits.length === 0} colSpan={4} emptyText="Belum ada jadwal kunjungan yang tersedia untuk Anda.">
                  {paginatedData.map((visit) => (
                    <TableRow key={visit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 whitespace-nowrap">
                        <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{visit.industry}</p>
                      </TableCell>
                      <TableCell className="py-4 font-bold text-theme-sm text-brand-600 dark:text-brand-400 whitespace-nowrap">
                        {visit.planned_date}
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm text-gray-600 dark:text-gray-300">
                        <p className="line-clamp-2 max-w-md" title={visit.purpose}>{visit.purpose}</p>
                      </TableCell>
                      <TableCell className="py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(visit)}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors shadow-theme-xs ${visit.is_filled
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                                : "bg-brand-500 text-white hover:bg-brand-600"
                              }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={visit.is_filled ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"}></path></svg>
                            {visit.is_filled ? "Lihat Laporan" : "Isi Laporan"}
                          </button>

                          {visit.is_filled && (
                            <button
                              onClick={async () => {
                                setAlertInfo({ show: true, variant: "info", title: "Memproses", message: "Sedang mengunduh file Excel..." });
                                try {
                                  await exportMonitoring(visit.id);
                                  setAlertInfo({ show: false, variant: "success", title: "", message: "" });
                                } catch {
                                  setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Gagal mengunduh file." });
                                }
                              }}
                              className="inline-flex items-center gap-2 rounded-lg bg-success-50 border border-success-200 px-3 py-2 text-xs font-bold text-success-700 hover:bg-success-100 transition-colors shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                              Export Excel
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

          <TablePagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-5xl overflow-hidden p-0" showCloseButton={false}>
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Form Laporan Monitoring</h3>
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mt-1">{selectedVisit?.industry} — {selectedVisit?.planned_date}</p>
          </div>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleBulkSubmit} className="flex flex-col h-[75vh]">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900">
            {isFormLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500 font-medium">Memuat data siswa...</div>
            ) : studentsForm.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                <span>Tidak ada siswa yang aktif di industri ini.</span>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden dark:border-gray-700">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                  <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3 font-bold w-12 text-center">No</th>
                      <th className="px-4 py-3 font-bold w-64">Nama & NIS</th>
                      <th className="px-4 py-3 font-bold w-40">Kelas</th>
                      <th className="px-4 py-3 font-bold">Hasil Monitoring / Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {studentsForm.map((student, index) => (
                      <tr key={student.internship_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-4 text-center font-medium">{index + 1}</td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-bold text-gray-900 dark:text-white">{student.name}</p>
                          <span className="text-xs text-gray-500">{student.nis}</span>
                        </td>
                        <td className="px-4 py-4 align-top font-medium">{student.kelas}</td>
                        <td className="px-4 py-4">
                          <textarea
                            rows={2}
                            value={student.notes}
                            onChange={(e) => updateStudentNote(student.internship_id, e.target.value)}
                            placeholder={selectedVisit?.is_filled ? "Tidak ada catatan." : "Tuliskan catatan perkembangan teknis / sikap anak ini..."}
                            disabled={selectedVisit?.is_filled}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-900"
                          ></textarea>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 dark:border-gray-800 dark:bg-gray-800/50">
            <button
              type="button" onClick={handleCloseModal}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            >
              Tutup
            </button>
            {!selectedVisit?.is_filled && (
              <button
                type="submit"
                disabled={isSubmitting || studentsForm.length === 0}
                className="rounded-lg bg-brand-500 px-8 py-2.5 text-sm font-bold text-white hover:bg-brand-600 transition-colors shadow-theme-xs disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan Data..." : "Simpan Semua Laporan"}
              </button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}