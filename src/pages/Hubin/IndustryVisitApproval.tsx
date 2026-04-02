import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SearchInput, SelectInput, TableDataState } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useApprovalVisitStore, VisitApproval } from "../../store/Hubin/useApprovalVisitStore";

type AlertVariant = "success" | "warning" | "info" | "error";
type StatusType = "All" | "Pending" | "Approved" | "Rejected";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function IndustryVisitApproval() {
  const { visits, isLoading, fetchVisits, verifyVisit, generateVisitLetter, viewVisitLetter } = useApprovalVisitStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusType>("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisit, setSelectedTrip] = useState<VisitApproval | null>(null);
  
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleOpenModal = (visit: VisitApproval) => {
    setSelectedTrip(visit);
    setIsRejecting(false); 
    setRejectReason("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrip(null);
  };

  const handleApprove = async () => {
    if (!selectedVisit) return;
    setIsSubmitting(true);
    try {
      await verifyVisit(selectedVisit.id, "Approved");
      setAlertInfo({
        show: true,
        variant: "success",
        title: "Persetujuan Berhasil",
        message: `Perjalanan dinas atas nama ${selectedVisit.teacherName} berhasil disetujui. SPPD siap dicetak.`,
      });
      handleCloseModal();
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal Memproses", message: "Terjadi kesalahan sistem saat menyetujui pengajuan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setAlertInfo({
        show: true,
        variant: "warning",
        title: "Perhatian",
        message: "Alasan penolakan wajib diisi sebelum mengirim formulir.",
      });
      return;
    }

    if (!selectedVisit) return;
    setIsSubmitting(true);
    
    try {
      await verifyVisit(selectedVisit.id, "Rejected", rejectReason);
      setAlertInfo({
        show: true,
        variant: "info",
        title: "Pengajuan Ditolak",
        message: `Pengajuan dari ${selectedVisit.teacherName} telah ditolak dan dikembalikan ke pembimbing bersangkutan.`,
      });
      handleCloseModal();
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal Memproses", message: "Terjadi kesalahan sistem saat menolak pengajuan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintSPPD = async (id: number, teacherName: string) => {
    setAlertInfo({
      show: true,
      variant: "info",
      title: "Memproses Dokumen",
      message: `Sedang menyiapkan Surat Perintah Perjalanan Dinas (SPPD) untuk ${teacherName}...`,
    });

    try {
      const fileUrl = await generateVisitLetter(id);
      if (fileUrl) {
        window.open(fileUrl, '_blank');
        setAlertInfo({
          show: true,
          variant: "success",
          title: "Dokumen Siap",
          message: "SPPD berhasil diterbitkan dan dibuka di tab baru.",
        });
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Gagal Cetak",
        message: "Terjadi kesalahan saat menggenerate dokumen. Pastikan server aktif.",
      });
    }
  };

  const viewLetter = async(id: number) => {
    setAlertInfo({
      show: true,
      variant: "info",
      title: "Membuka Dokumen",
      message: `Membuka Surat Perintah Perjalanan Dinas (SPPD)...`,
    });
    try {
      await viewVisitLetter(id);
      setAlertInfo({
        show: true,
        variant: "success",
        title: "Dokumen Siap",
        message: "SPPD berhasil diterbitkan dan dibuka di tab baru.",
      });
    } catch (error) {
      console.error("Gagal memuat data:", error);
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Gagal Cetak",
        message: "Terjadi kesalahan saat menggenerate dokumen. Pastikan server aktif.",
      });
    }
  }

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        setAlertInfo((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const filteredVisits = visits.filter((visit) => {
    const matchSearch = visit.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) || visit.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "All" ? true : visit.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <PageMeta title="Approval Perjalanan Dinas | Sistem Manajemen PKL" description="Halaman untuk meninjau dan menyetujui pengajuan kunjungan monitoring guru pembimbing." />

      <div className="space-y-6">
        
        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <PageHeader 
          title="Approval Perjalanan Dinas" 
          description="Tinjau pengajuan kunjungan guru dan terbitkan SPPD jika disetujui."
        />

        <div className="flex flex-col sm:flex-row justify-end gap-3 bg-white p-4 rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <div className="w-full sm:w-[300px]">
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Cari Nama Guru atau Industri..." />
          </div>
          <div className="w-full sm:w-[200px]">
            <SelectInput 
              value={filterStatus} 
              onChange={(val) => setFilterStatus(val as StatusType)}
            >
              <option value="All">Semua Status</option>
              <option value="Pending">Menunggu</option>
              <option value="Approved">Disetujui</option>
              <option value="Rejected">Ditolak</option>
            </SelectInput>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs min-w-[200px] whitespace-nowrap">Guru Pembimbing</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs min-w-[200px] whitespace-nowrap">Tujuan & Tanggal</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs min-w-[250px] whitespace-nowrap">Agenda</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs min-w-[100px] whitespace-nowrap">Status</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs min-w-[100px] whitespace-nowrap">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState 
                  isLoading={isLoading}
                  isEmpty={filteredVisits.length === 0} 
                  colSpan={5} 
                  emptyText="Tidak ada data pengajuan perjalanan dinas."
                >
                  {filteredVisits.map((visit) => (
                    <TableRow key={visit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 font-bold text-sm">
                            {visit.teacherName.charAt(0)}
                          </div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{visit.teacherName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm whitespace-nowrap">
                        <p className="font-medium text-gray-800 dark:text-white/90">{visit.industry}</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5">{visit.plannedDate}</p>
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm whitespace-nowrap">
                        <p className="text-gray-800 dark:text-white/90 truncate max-w-[300px]" title={visit.purpose}>
                          {visit.purpose}
                        </p>
                        {visit.status === "Rejected" && visit.feedback && (
                          <div className="mt-2 rounded-lg bg-error-50 p-2 border border-error-100 text-xs text-error-600 whitespace-normal">
                            <span className="font-semibold">Penolakan:</span> {visit.feedback}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 whitespace-nowrap">
                        <div className="flex items-start mt-1">
                          <Badge color={visit.status === "Approved" ? "success" : visit.status === "Pending" ? "warning" : "error"}>
                            {visit.status === "Pending" ? "Menunggu" : visit.status === "Approved" ? "Disetujui" : "Ditolak"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {visit.status === "Pending" ? (
                            <button 
                              onClick={() => handleOpenModal(visit)}
                              className="inline-flex items-center gap-1 rounded bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700 hover:bg-accent-100 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                              Tinjau
                            </button>
                          ) : visit.status === "Approved" ? (
                              visit.file_path ? (
                                <button 
                                  onClick={() => viewLetter(visit.id)}
                                  className="inline-flex items-center gap-1 rounded bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                  Lihat Surat
                                </button>
                              ) : (
                              <button
                                onClick={() => handlePrintSPPD(visit.id, visit.teacherName)}
                                className="inline-flex items-center gap-1 rounded bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                Cetak SPPD
                              </button>
                              )
                          ) : (
                            <button 
                              onClick={() => handleOpenModal(visit)}
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
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-lg overflow-hidden p-0" showCloseButton={false}>
        <div className={`flex items-center justify-between border-b px-6 py-4 ${isRejecting ? "border-error-100 bg-error-50 dark:bg-error-900/10 dark:border-error-800/30" : "border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-800"}`}>
          <h3 className={`text-lg font-bold ${isRejecting ? "text-error-800 dark:text-error-400" : "text-gray-800 dark:text-white/90"}`}>
            {selectedVisit?.status === "Pending" ? "Tinjau Pengajuan" : "Detail Pengajuan"}
          </h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <span className="block text-xs font-medium text-gray-500">Diajukan Oleh:</span>
            <p className="mt-1 font-bold text-gray-800 dark:text-white/90">{selectedVisit?.teacherName}</p>
             <div className="mt-2 flex items-start">
              <Badge color={selectedVisit?.status === "Approved" ? "success" : selectedVisit?.status === "Pending" ? "warning" : "error"}>
                {selectedVisit?.status === "Pending" ? "Menunggu" : selectedVisit?.status === "Approved" ? "Disetujui" : "Ditolak"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-xs font-medium text-gray-500">Tujuan Industri</span>
              <p className="mt-1 text-sm font-bold text-gray-800 dark:text-white/90">{selectedVisit?.industry}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-xs font-medium text-gray-500">Tanggal Rencana</span>
              <p className="mt-1 text-sm font-bold text-gray-800 dark:text-white/90">{selectedVisit?.plannedDate}</p>
            </div>
            <div className="col-span-2">
              <span className="block text-xs font-medium text-gray-500 mb-1.5">Agenda / Tujuan Kunjungan</span>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 min-h-[80px]">
                {selectedVisit?.purpose}
              </div>
            </div>
          </div>

          {selectedVisit?.status === "Rejected" && selectedVisit?.feedback && !isRejecting && (
            <div className="rounded-lg bg-error-50 p-3 border border-error-100 dark:bg-error-900/10 dark:border-error-800/30">
              <p className="text-xs font-bold text-error-600 dark:text-error-500">Catatan Penolakan Anda:</p>
              <p className="text-sm text-error-700 dark:text-error-400 mt-1">{selectedVisit.feedback}</p>
            </div>
          )}

          {isRejecting && (
            <form id="rejectForm" onSubmit={handleRejectSubmit} className="mt-4 animate-fade-in bg-error-50/50 p-4 rounded-lg border border-error-100 dark:bg-error-900/10 dark:border-error-800/30">
              <label className="mb-2 block text-sm font-bold text-error-700 dark:text-error-500">Alasan Penolakan <span className="text-error-500">*</span></label>
              <textarea 
                rows={3} 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Berikan alasan mengapa jadwal ini ditolak..."
                className="w-full rounded-lg border border-error-300 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-error-500 focus:ring-2 focus:ring-error-500/20 dark:bg-gray-900 dark:border-error-700 dark:text-white"
                required
              ></textarea>
            </form>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button 
            type="button" 
            onClick={handleCloseModal}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {selectedVisit?.status === "Pending" && !isRejecting ? "Batal" : "Tutup"}
          </button>
          
          {selectedVisit?.status === "Pending" && !isRejecting && (
            <>
              <button 
                onClick={() => setIsRejecting(true)}
                disabled={isSubmitting}
                className="rounded-lg border border-error-200 bg-error-50 px-5 py-2.5 text-sm font-semibold text-error-600 hover:bg-error-100 transition-colors dark:bg-error-900/20 dark:border-error-800/50 dark:text-error-400 dark:hover:bg-error-900/40 disabled:opacity-50"
              >
                Tolak Kunjungan
              </button>
              <button 
                onClick={handleApprove}
                disabled={isSubmitting}
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 shadow-[0_4px_10px_rgba(0,104,55,0.2)] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Memproses..." : "Setujui & Terbitkan SPPD"}
              </button>
            </>
          )}

          {isRejecting && (
            <button 
              type="submit"
              form="rejectForm"
              disabled={isSubmitting}
              className="rounded-lg bg-error-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-error-700 shadow-[0_4px_10px_rgba(220,38,38,0.2)] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Penolakan"}
            </button>
          )}
        </div>
      </Modal>
    </>
  );
}