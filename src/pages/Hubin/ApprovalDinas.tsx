import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

interface TripApproval {
  id: number;
  teacherName: string;
  industry: string;
  plannedDate: string;
  purpose: string;
  status: "Pending" | "Approved" | "Rejected";
  feedback?: string;
}

const mockTrips: TripApproval[] = [
  { id: 1, teacherName: "Mohammad Robihul Mufid, M.Tr.Kom", industry: "PT. Telkom Indonesia (Witel Karawang)", plannedDate: "24 Mar 2026", purpose: "Monitoring rutin bulan ke-3 dan evaluasi tengah periode dengan pembimbing lapangan.", status: "Pending" },
  { id: 2, teacherName: "Ahmad Yani, S.Kom", industry: "CV. Media Kreatif", plannedDate: "15 Feb 2026", purpose: "Kunjungan pertama untuk penyerahan siswa dan pengecekan kesesuaian tempat magang.", status: "Approved" },
  { id: 3, teacherName: "Siti Aminah, S.Pd", industry: "PT. Inovasi Teknologi", plannedDate: "10 Jan 2026", purpose: "Penarikan siswa magang karena durasi PKL telah selesai.", status: "Rejected", feedback: "Tanggal bentrok dengan jadwal ujian sekolah, mohon ajukan ulang di minggu depannya." },
];

export default function ApprovalPerjalananDinas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripApproval | null>(null);
  
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });

  const handleOpenModal = (trip: TripApproval) => {
    setSelectedTrip(trip);
    setIsRejecting(false); 
    setRejectReason("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrip(null);
  };

  const handleApprove = () => {
    setAlertInfo({
      show: true,
      variant: "success",
      title: "Persetujuan Berhasil",
      message: `Perjalanan dinas atas nama ${selectedTrip?.teacherName} berhasil disetujui! SPPD siap dicetak.`,
    });
    handleCloseModal();
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setAlertInfo({
        show: true,
        variant: "warning",
        title: "Perhatian",
        message: "Alasan penolakan wajib diisi sebelum mengirim form.",
      });
      return;
    }
    setAlertInfo({
      show: true,
      variant: "error",
      title: "Pengajuan Ditolak",
      message: `Pengajuan ${selectedTrip?.teacherName} telah ditolak. Alasan: ${rejectReason}`,
    });
    handleCloseModal();
  };

  const handlePrintSPPD = (teacherName: string) => {
    setAlertInfo({
      show: true,
      variant: "info",
      title: "Mencetak Dokumen",
      message: `Sedang menyiapkan Surat Perintah Perjalanan Dinas (SPPD) untuk ${teacherName}...`,
    });
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        setAlertInfo((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const filteredTrips = mockTrips.filter((trip) => {
    const matchSearch = trip.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) || trip.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "All" ? true : trip.status === filterStatus;
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Approval Perjalanan Dinas</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tinjau pengajuan kunjungan guru dan terbitkan SPPD jika disetujui.</p>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                placeholder="Cari Guru atau Industri..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white sm:w-64"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "All" | "Pending" | "Approved" | "Rejected")}
                className="appearance-none w-full sm:w-[170px] rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 cursor-pointer"
              >
                <option value="All" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Semua Status</option>
                <option value="Pending" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Menunggu</option>
                <option value="Approved" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Disetujui</option>
                <option value="Rejected" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Ditolak</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
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
                {filteredTrips.map((trip) => (
                  <TableRow key={trip.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 font-bold text-sm">
                          {trip.teacherName.charAt(0)}
                        </div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{trip.teacherName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-theme-sm whitespace-nowrap">
                      <p className="font-medium text-gray-800 dark:text-white/90">{trip.industry}</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-0.5">{trip.plannedDate}</p>
                    </TableCell>
                    <TableCell className="py-4 text-theme-sm whitespace-nowrap">
                      <p className="text-gray-800 dark:text-white/90 truncate max-w-[300px]" title={trip.purpose}>
                        {trip.purpose}
                      </p>
                      {trip.status === "Rejected" && trip.feedback && (
                        <div className="mt-2 rounded-lg bg-error-50 p-2 border border-error-100 text-xs text-error-600 whitespace-normal">
                          <span className="font-semibold">Penolakan:</span> {trip.feedback}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="flex items-start mt-1">
                        <Badge color={trip.status === "Approved" ? "success" : trip.status === "Pending" ? "warning" : "error"}>
                          {trip.status === "Pending" ? "Menunggu" : trip.status === "Approved" ? "Disetujui" : "Ditolak"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {trip.status === "Pending" ? (
                          <button 
                            onClick={() => handleOpenModal(trip)}
                            className="inline-flex items-center gap-1 rounded bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700 hover:bg-accent-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            Tinjau
                          </button>
                        ) : trip.status === "Approved" ? (
                          <button 
                            onClick={() => handlePrintSPPD(trip.teacherName)}
                            className="inline-flex items-center gap-1 rounded bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            Cetak SPPD
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleOpenModal(trip)}
                            className="inline-flex items-center gap-1 rounded bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                          >
                            Detail
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredTrips.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-500">Tidak ada pengajuan perjalanan dinas.</div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-lg overflow-hidden" showCloseButton={false}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
            {selectedTrip?.status === "Pending" ? "Tinjau Pengajuan" : "Detail Pengajuan"}
          </h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <span className="block text-xs font-medium text-gray-500">Diajukan Oleh:</span>
            <p className="mt-1 font-semibold text-gray-800 dark:text-white/90">{selectedTrip?.teacherName}</p>
             <div className="mt-2 flex items-start">
              <Badge color={selectedTrip?.status === "Approved" ? "success" : selectedTrip?.status === "Pending" ? "warning" : "error"}>
                {selectedTrip?.status === "Pending" ? "Menunggu" : selectedTrip?.status === "Approved" ? "Disetujui" : "Ditolak"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-xs font-medium text-gray-500">Tujuan Industri</span>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{selectedTrip?.industry}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-xs font-medium text-gray-500">Tanggal Rencana</span>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{selectedTrip?.plannedDate}</p>
            </div>
            <div className="col-span-2">
              <span className="block text-xs font-medium text-gray-500 mb-1.5">Agenda / Tujuan Kunjungan</span>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 min-h-[80px]">
                {selectedTrip?.purpose}
              </div>
            </div>
          </div>

          {selectedTrip?.status === "Rejected" && selectedTrip?.feedback && !isRejecting && (
            <div className="rounded-lg bg-error-50 p-3 border border-error-100">
              <p className="text-xs font-semibold text-error-600">Catatan Penolakan Anda:</p>
              <p className="text-sm text-error-700 mt-1">{selectedTrip.feedback}</p>
            </div>
          )}

          {isRejecting && (
            <form id="rejectForm" onSubmit={handleRejectSubmit} className="mt-4 animate-fade-in">
              <label className="mb-1.5 block text-sm font-medium text-error-600">Alasan Penolakan <span className="text-error-500">*</span></label>
              <textarea 
                rows={3} 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Berikan alasan mengapa jadwal ini ditolak..."
                className="w-full rounded-lg border border-error-300 bg-error-50/30 px-4 py-2.5 text-sm outline-none transition-all focus:border-error-500 focus:ring-1 focus:ring-error-500 dark:text-white"
                required
              ></textarea>
            </form>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button 
            type="button" 
            onClick={handleCloseModal}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {selectedTrip?.status === "Pending" && !isRejecting ? "Batal" : "Tutup"}
          </button>
          
          {selectedTrip?.status === "Pending" && !isRejecting && (
            <>
              <button 
                onClick={() => setIsRejecting(true)}
                className="rounded-lg border border-error-200 bg-error-50 px-5 py-2 text-sm font-medium text-error-600 hover:bg-error-100 transition-colors"
              >
                Tolak Kunjungan
              </button>
              <button 
                onClick={handleApprove}
                className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 shadow-theme-xs transition-colors"
              >
                Setujui & Terbitkan SPPD
              </button>
            </>
          )}

          {isRejecting && (
            <button 
              type="submit"
              form="rejectForm"
              className="rounded-lg bg-error-500 px-5 py-2 text-sm font-medium text-white hover:bg-error-600 shadow-theme-xs transition-colors"
            >
              Kirim Penolakan
            </button>
          )}
        </div>
      </Modal>
    </>
  );
}