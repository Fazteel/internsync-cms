import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SelectInput, TableDataState, TablePagination, TableTopControls } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import DatePicker from "../../components/form/date-picker";
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
  const {
    visits,
    assignedIndustries,
    fetchVisits,
    submitVisit,
    isLoading,
    fetchAssignedIndustries,
    viewVisitLetter
  } = useIndustryVisitStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<IndustryVisitRecord | null>(null);

  const [industryId, setIndustryId] = useState("");
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");

  const [filterStatus, setFilterStatus] = useState<FilterStatusType>("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVisits();
    fetchAssignedIndustries();
  }, [fetchVisits, fetchAssignedIndustries]);

  const handleOpenAddModal = () => {
    if (assignedIndustries.length === 0) {
      setAlertInfo({ show: true, variant: "warning", title: "Belum Ada Siswa", message: "Anda belum memiliki siswa bimbingan yang sudah ditempatkan." });
      return;
    }
    setIndustryId("");
    setDate("");
    setPurpose("");
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (visit: IndustryVisitRecord) => {
    setSelectedVisit(visit);
    setIsDetailModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedVisit(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setAlertInfo({ show: true, variant: "warning", title: "Tanggal Kosong", message: "Silakan pilih tanggal kunjungan." });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitVisit({ industry_id: industryId, planned_date: date, purpose });
      setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: "Pengajuan kunjungan dikirim." });
      handleCloseModals();
    } catch (error) {
      console.error("Error submitting form:", error);
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Gagal mengirim pengajuan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewLetter = async (id: number) => {
    setAlertInfo({ show: true, variant: "info", title: "Memproses", message: "Membuka dokumen SPPD..." });
    try {
      await viewVisitLetter(id);
    } catch (error) {
      console.error("Error opening letter:", error);
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "File belum siap atau Anda tidak memiliki akses." });
    }
  };

  const filteredVisit = visits.filter((v) => {
    const matchStatus = filterStatus === "All" ? true : v.status === filterStatus;
    return matchStatus;
  })

  const totalPages = Math.ceil(filteredVisit.length / rowsPerPage);
  const paginatedData = filteredVisit.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <PageMeta title="Perjalanan Dinas | Sistem Manajemen PKL" description="Ajukan dan pantau jadwal kunjungan monitoring ke industri tempat siswa PKL." />

      <div className="space-y-6">
        {alertInfo.show && <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />}

        <PageHeader title="Kunjungan Industri" description="Ajukan jadwal monitoring ke industri mitra sekolah.">
          <SelectInput
            value={filterStatus}
            onChange={(val) => {
              setFilterStatus(val as FilterStatusType);
              setCurrentPage(1);
            }}
          >
            <option value="All">Semua Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </SelectInput>
          <button onClick={handleOpenAddModal} className="bg-brand-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-brand-600 transition shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Ajukan Kunjungan
          </button>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <TableTopControls
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalData={filterStatus.length}
            setCurrentPage={setCurrentPage}
          />

          <div className="max-w-full overflow-x-auto custom-scrollbar">  
            <Table>
              <TableHeader className="border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 px-4 text-theme-xs">Industri</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-theme-xs text-center">Tanggal Rencana</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-theme-xs text-center">Tujuan Kunjungan</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-theme-xs text-center">Status</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-theme-xs text-center">Aksi</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y">
                <TableDataState isLoading={isLoading} isEmpty={visits.length === 0} colSpan={4}>
                  {paginatedData.map((visit) => (
                    <TableRow key={visit.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4 px-4 font-bold text-center text-gray-800 dark:text-white/90">{visit.industry}</TableCell>
                      <TableCell className="py-4 px-4 text-center text-sm">{visit.plannedDate}</TableCell>
                      <TableCell className="py-4 text-theme-sm text-center whitespace-nowrap">
                        <p className="text-gray-800 dark:text-white/90 truncate max-w-[300px]" title={visit.purpose}>
                          {visit.purpose}
                        </p>
                        {visit.status === "Rejected" && visit.feedback && (
                          <div className="mt-2 rounded-lg bg-error-50 p-2 border border-error-100 text-xs text-error-700 dark:bg-error-900/10 dark:border-error-800/30 dark:text-error-400 whitespace-normal">
                            <span className="font-semibold">Catatan Penolakan:</span> {visit.feedback}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-center">
                        <Badge color={visit.status === "Approved" ? "success" : visit.status === "Pending" ? "warning" : "error"}>{visit.status}</Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {visit.status === "Pending" ? (
                            <button
                              onClick={() => handleOpenDetailModal(visit)}
                              className="inline-flex items-center gap-1 rounded bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700 hover:bg-accent-100 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Tinjau
                            </button>
                          ) : visit.status === "Approved" ? (
                            visit.file_path ? (
                              <button
                                onClick={() => handleViewLetter(visit.id)}
                                className="inline-flex items-center gap-1 rounded bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Lihat Surat
                              </button>
                            ) : (
                              <button
                                onClick={() => handleViewLetter(visit.id)}
                                className="inline-flex items-center gap-1 rounded bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Cetak SPPD
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => handleOpenDetailModal(visit)}
                              className="inline-flex items-center gap-1 rounded bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                              Detail
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModals} className="max-w-lg p-0 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold">Form Pengajuan Kunjungan</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Industri</label>
            <SelectInput value={industryId} onChange={setIndustryId} required>
              <option value="" disabled>Pilih Lokasi</option>
              {assignedIndustries.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
            </SelectInput>
          </div>
          <DatePicker id="dp-visit" label={<span className="text-xs font-bold text-gray-500 uppercase">Tanggal</span>} onChange={(_, str) => setDate(str)} />
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Tujuan</label>
            <textarea rows={4} value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20" required placeholder="Contoh: Monitoring rutin bulan ke-3, penarikan siswa, dll." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={handleCloseModals} className="text-sm font-bold text-gray-500">Batal</button>
            <button type="submit" disabled={isSubmitting} className="bg-brand-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-600 disabled:opacity-50">{isSubmitting ? "Mengirim..." : "Kirim"}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={handleCloseModals} className="max-w-lg p-0 overflow-hidden">
        <div className={`px-6 py-4 border-b ${selectedVisit?.status === "Rejected" ? "bg-error-50" : "bg-gray-50"}`}>
          <h3 className={`text-lg font-bold ${selectedVisit?.status === "Rejected" ? "text-error-700" : ""}`}>
            {selectedVisit?.status === "Pending" ? "Review Pengajuan" : "Detail Pengajuan"}
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Industri</span>
              <p className="font-bold">{selectedVisit?.industry}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Rencana</span>
              <p className="text-sm font-medium">{selectedVisit?.plannedDate}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
              <div className="mt-1"><Badge color={selectedVisit?.status === "Approved" ? "success" : selectedVisit?.status === "Pending" ? "warning" : "error"}>{selectedVisit?.status}</Badge></div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Agenda</span>
            <p className="text-sm mt-1 leading-relaxed">{selectedVisit?.purpose}</p>
          </div>

          {selectedVisit?.status === "Rejected" && (
            <div className="bg-error-50 p-4 rounded-xl border border-error-100">
              <span className="text-xs font-bold text-error-700 uppercase flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
                Catatan Penolakan
              </span>
              <p className="text-sm text-error-600 italic mt-2">"{selectedVisit.feedback || "Tidak ada catatan."}"</p>
            </div>
          )}
        </div>
        <div className="flex justify-end p-6 pt-0">
          <button onClick={handleCloseModals} className="bg-gray-100 px-6 py-2 rounded-lg font-bold">Tutup</button>
        </div>
      </Modal>
    </>
  );
}