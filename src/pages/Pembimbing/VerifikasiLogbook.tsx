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

interface StudentLogbook {
  id: number;
  studentName: string;
  nis: string;
  industry: string;
  date: string;
  activity: string;
  attachment: string;
  status: "Approved" | "Pending" | "Revision";
  revisionNote?: string;
}

const mockLogbooks: StudentLogbook[] = [
  { id: 1, studentName: "Fahmi Andika Setiono", nis: "3123512901", industry: "PT. Telkom Indonesia", date: "22 Mar 2026", activity: "Mempelajari struktur database aplikasi dan membuat rancangan awal ERD untuk modul e-commerce.", attachment: "erd_v1.png", status: "Pending" },
  { id: 2, studentName: "Budi Santoso", nis: "3123512902", industry: "PT. Telkom Indonesia", date: "22 Mar 2026", activity: "Mengikuti rapat harian divisi IT dan membantu mencatat notulensi.", attachment: "notulensi.pdf", status: "Pending" },
  { id: 3, studentName: "Siti Aminah", nis: "3123512903", industry: "CV. Media Kreatif", date: "21 Mar 2026", activity: "Membuat desain UI untuk halaman login dan dashboard.", attachment: "ui_design.jpg", status: "Revision", revisionNote: "Desain UI sudah bagus, namun tolong jelaskan juga tools apa yang kamu gunakan di deskripsi aktivitas." },
  { id: 4, studentName: "Fahmi Andika Setiono", nis: "3123512901", industry: "PT. Telkom Indonesia", date: "20 Mar 2026", activity: "Setup environment lokal (XAMPP, Composer, Node.js)", attachment: "setup_env.jpg", status: "Approved" },
];

export default function VerifikasiLogbook() {
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Approved" | "Revision">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLogbook, setSelectedLogbook] = useState<StudentLogbook | null>(null);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  const handleOpenModal = (log: StudentLogbook) => {
    setSelectedLogbook(log);
    setIsRevisionMode(false);
    setRevisionNote("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLogbook(null);
  };

  const handleApprove = () => {
    setAlertInfo({
      show: true,
      variant: "success",
      title: "Verifikasi Berhasil",
      message: `Logbook milik ${selectedLogbook?.studentName} berhasil disetujui.`,
    });
    handleCloseModal();
  };

  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNote.trim()) {
      setAlertInfo({
        show: true,
        variant: "warning",
        title: "Peringatan Form",
        message: "Catatan revisi tidak boleh kosong!",
      });
      return;
    }
    
    setAlertInfo({
      show: true,
      variant: "info",
      title: "Revisi Dikirim",
      message: `Catatan revisi berhasil dikirim ke ${selectedLogbook?.studentName}.`,
    });
    handleCloseModal();
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const filteredLogbooks = mockLogbooks.filter((log) => filterStatus === "All" ? true : log.status === filterStatus);

  return (
    <>
      <PageMeta title="Verifikasi Logbook | Sistem Manajemen PKL" description="Halaman untuk memeriksa dan memverifikasi laporan harian siswa bimbingan." />

      <div className="space-y-6">
        
        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Verifikasi Logbook</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Periksa laporan harian siswa. Berikan persetujuan atau catatan perbaikan.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "All" | "Pending" | "Approved" | "Revision")}
                className="appearance-none cursor-pointer rounded-lg border border-gray-300 bg-gray-50 pl-4 pr-10 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 w-full sm:w-[200px] transition-colors"
              >
                <option value="All" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Semua Status</option>
                <option value="Pending" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Menunggu (Pending)</option>
                <option value="Approved" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Disetujui</option>
                <option value="Revision" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Revisi</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Nama Siswa</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap">Tanggal</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[300px]">Aktivitas Singkat</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap">Status</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredLogbooks.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <TableCell className="py-4 whitespace-nowrap">
                      <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{log.studentName}</p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">{log.industry}</span>
                    </TableCell>
                    <TableCell className="py-4 text-gray-800 dark:text-white/90 font-medium text-theme-sm whitespace-nowrap">{log.date}</TableCell>
                    <TableCell className="py-4 text-theme-sm text-gray-600 dark:text-gray-300 truncate max-w-[250px] whitespace-nowrap">
                      {log.activity}
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      <Badge color={log.status === "Approved" ? "success" : log.status === "Pending" ? "warning" : "error"}>
                        {log.status === "Revision" ? "Menunggu Revisi" : log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-center whitespace-nowrap">
                      <button 
                        onClick={() => handleOpenModal(log)} 
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          log.status === "Pending" 
                            ? "bg-brand-500 text-white hover:bg-brand-600 shadow-[0_2px_8px_rgba(0,104,55,0.2)]"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        {log.status === "Pending" ? "Evaluasi" : "Detail"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredLogbooks.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-500">Tidak ada data logbook dengan status tersebut.</div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-lg overflow-hidden p-0" showCloseButton={false}>
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Evaluasi Logbook</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{selectedLogbook?.studentName} ({selectedLogbook?.nis})</p>
          </div>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tanggal Aktivitas</span>
              <p className="font-bold text-gray-800 dark:text-white/90">{selectedLogbook?.date}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Status Saat Ini</span>
              <div className="mt-1 flex items-start">
                <Badge color={selectedLogbook?.status === "Approved" ? "success" : selectedLogbook?.status === "Pending" ? "warning" : "error"}>
                  {selectedLogbook?.status === "Revision" ? "Menunggu Revisi" : selectedLogbook?.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Deskripsi Aktivitas</span>
            <div className="text-sm text-gray-800 dark:text-white/90 leading-relaxed bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[80px]">
              {selectedLogbook?.activity}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Bukti Lampiran</span>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:border-brand-300 group transition-colors shadow-sm">
              <div className="bg-brand-50 text-brand-600 p-2.5 rounded-lg group-hover:bg-brand-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-brand-600 dark:text-gray-300 dark:group-hover:text-brand-400 transition-colors">{selectedLogbook?.attachment}</span>
            </div>
          </div>

          {selectedLogbook?.revisionNote && !isRevisionMode && (
            <div className="rounded-xl bg-error-50 p-4 border border-error-100 shadow-sm dark:bg-error-900/10 dark:border-error-800/30">
              <p className="text-xs font-bold uppercase tracking-wider text-error-700 dark:text-error-500 mb-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Catatan Revisi Anda Sebelumnya
              </p>
              <p className="text-sm text-error-600 dark:text-error-400">{selectedLogbook.revisionNote}</p>
            </div>
          )}

          {isRevisionMode && (
            <form onSubmit={handleSubmitRevision} className="mt-4 animate-fade-in bg-error-50/50 p-4 rounded-xl border border-error-100 dark:bg-error-900/10 dark:border-error-800/30">
              <label className="mb-2 block text-sm font-bold text-error-700 dark:text-error-500">Catatan Revisi untuk Siswa <span className="text-error-500">*</span></label>
              <textarea 
                rows={4} 
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Tuliskan bagian mana yang perlu diperbaiki oleh siswa..."
                className="w-full rounded-lg border border-error-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-error-500 focus:ring-2 focus:ring-error-500/20 dark:bg-gray-900 dark:text-white dark:border-error-700"
                required
              ></textarea>
            </form>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button 
            onClick={handleCloseModal}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Tutup
          </button>
          
          {selectedLogbook?.status === "Pending" && !isRevisionMode && (
            <>
              <button 
                onClick={() => setIsRevisionMode(true)}
                className="rounded-lg border border-error-200 bg-error-50 px-5 py-2.5 text-sm font-semibold text-error-600 hover:bg-error-100 transition-colors dark:bg-error-900/20 dark:border-error-800/50 dark:text-error-400 dark:hover:bg-error-900/40"
              >
                Minta Revisi
              </button>
              <button 
                onClick={handleApprove}
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 shadow-[0_4px_10px_rgba(0,104,55,0.2)] transition-colors"
              >
                Setujui Logbook
              </button>
            </>
          )}

          {isRevisionMode && (
            <button 
              onClick={handleSubmitRevision}
              className="rounded-lg bg-error-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-error-700 shadow-[0_4px_10px_rgba(220,38,38,0.2)] transition-colors"
            >
              Kirim Revisi
            </button>
          )}
        </div>
      </Modal>
    </>
  );
}