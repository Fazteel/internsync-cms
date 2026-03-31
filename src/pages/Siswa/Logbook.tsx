import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import DatePicker from "../../components/form/date-picker"; 
import Alert from "../../components/ui/alert/Alert"; 
import { Modal } from "../../components/ui/modal/index";

interface LogbookEntry {
  id: number;
  date: string;
  activity: string;
  attachment: string;
  status: "Approved" | "Pending" | "Revision";
  revisionNote?: string;
}

const initialData: LogbookEntry[] = [
  { id: 1, date: "22 Mar 2026", activity: "Mempelajari struktur database aplikasi dan membuat ERD", attachment: "erd_v1.png", status: "Pending" },
  { id: 2, date: "21 Mar 2026", activity: "Meeting dengan pembimbing lapangan membahas alur kerja", attachment: "notulensi.pdf", status: "Revision", revisionNote: "Tolong lengkapi poin-poin hasil keputusan meeting di bagian deskripsi." },
  { id: 3, date: "20 Mar 2026", activity: "Setup environment lokal (XAMPP, Composer, Node.js)", attachment: "setup_env.jpg", status: "Approved" },
];

export default function LogbookHarian() {
  const [logbookData] = useState<LogbookEntry[]>(initialData); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add"); 
  const [selectedLogbook, setSelectedLogbook] = useState<LogbookEntry | null>(null); 
  const [selectedDate, setSelectedDate] = useState("");
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedLogbook(null); 
    setSelectedDate(""); 
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (log: LogbookEntry) => {
    setModalMode("edit");
    setSelectedLogbook(log); 
    setSelectedDate(log.date); 
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (log: LogbookEntry) => {
    setModalMode("view");
    setSelectedLogbook(log); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLogbook(null);
  };

  const handleOpenPreview = (fileName: string) => {
    setPreviewFile(fileName);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "view") return;

    if (!selectedDate) {
      setAlertInfo({
        show: true,
        variant: "warning",
        title: "Peringatan Form",
        message: "Tanggal aktivitas wajib dipilih. Silakan pilih tanggal terlebih dahulu pada kalender.",
      });
      return; 
    }

    setAlertInfo({
      show: true,
      variant: "success",
      title: "Logbook Berhasil Dikirim",
      message: `Data logbook ${modalMode === "add" ? "baru" : "revisi"} Anda berhasil disimpan dan diteruskan ke pembimbing.`,
    });

    handleCloseModal();
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        setAlertInfo((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  return (
    <>
      <PageMeta title="Logbook Harian | Sistem Manajemen PKL" description="Halaman untuk mengisi dan memantau riwayat laporan aktivitas harian PKL." />

      <div className="space-y-6">
        
        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert 
              variant={alertInfo.variant} 
              title={alertInfo.title} 
              message={alertInfo.message} 
            />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Logbook Harian</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Catat aktivitas PKL Anda setiap hari. Logbook akan diperiksa oleh Guru Pembimbing.</p>
          </div>
          <div>
            <button 
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-center font-bold text-white shadow-theme-xs hover:bg-brand-600 transition-colors w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Tambah Logbook
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Riwayat Aktivitas</h3>
          </div>

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[120px]">Tanggal</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs min-w-[320px]">Aktivitas</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Lampiran</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[120px]">Status</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logbookData.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <TableCell className="py-4 text-gray-800 dark:text-white/90 font-medium text-theme-sm whitespace-nowrap">{log.date}</TableCell>
                    
                    <TableCell className="py-4 text-theme-sm">
                      <p className="text-gray-800 dark:text-white/90 leading-relaxed max-w-md">{log.activity}</p>
                      {log.status === "Revision" && log.revisionNote && (
                        <div className="mt-3 rounded-lg bg-error-50 p-3 border border-error-100 dark:bg-error-900/10 dark:border-error-800/30">
                          <p className="text-xs font-bold text-error-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Catatan Revisi:
                          </p>
                          <p className="text-sm text-error-600 dark:text-error-400">{log.revisionNote}</p>
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="py-4 whitespace-nowrap">
                      <div 
                        className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-brand-600 dark:text-brand-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => handleOpenPreview(log.attachment)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        <span className="truncate max-w-[120px]">{log.attachment}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="mt-1 flex items-start">
                        <Badge color={log.status === "Approved" ? "success" : log.status === "Pending" ? "warning" : "error"}>
                          {log.status === "Revision" ? "Revisi" : log.status === "Approved" ? "Disetujui" : "Menunggu"}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-center whitespace-nowrap">
                      {log.status === "Revision" ? (
                        <button onClick={() => handleOpenEditModal(log)} className="inline-flex items-center gap-1.5 rounded-lg bg-error-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-error-600 transition-colors shadow-theme-xs">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          Perbaiki
                        </button>
                      ) : (
                        <button onClick={() => handleOpenViewModal(log)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          Detail
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-[700px] p-0 max-h-[90vh] overflow-y-auto custom-scrollbar" showCloseButton={false}>
        <div className={`flex items-center justify-between border-b px-6 py-4 ${modalMode === "edit" ? "border-error-100 bg-error-50 dark:border-error-800/30 dark:bg-error-900/10" : "border-brand-100 bg-brand-50 dark:border-brand-800/30 dark:bg-brand-900/10"}`}>
          <h3 className={`text-lg font-bold ${modalMode === "edit" ? "text-error-800 dark:text-error-400" : "text-brand-800 dark:text-brand-400"}`}>
            {modalMode === "add" && "Tambah Logbook Baru"}
            {modalMode === "edit" && "Perbaiki Logbook"}
            {modalMode === "view" && "Detail Logbook"}
          </h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {(modalMode === "edit" || modalMode === "view") && selectedLogbook?.revisionNote && (
            <div className="rounded-xl bg-error-50 p-4 border border-error-100 shadow-sm dark:bg-error-900/10 dark:border-error-800/30">
              <p className="text-xs font-bold text-error-700 uppercase tracking-wider mb-1">Catatan dari Pembimbing:</p>
              <p className="text-sm text-error-600 dark:text-error-400 leading-relaxed">{selectedLogbook.revisionNote}</p>
            </div>
          )}

          <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 space-y-5">
            <div>
              {modalMode === "view" ? (
                <>
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-400">Tanggal Aktivitas</span>
                  <p className="text-sm font-bold text-gray-800 dark:text-white/90 bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    {selectedLogbook?.date}
                  </p>
                </>
              ) : (
                <DatePicker
                  id="date-picker-logbook"
                  label="Tanggal Aktivitas *"
                  placeholder="Pilih tanggal"
                  onChange={(dates: Date[], currentDateString: string): void => {
                    setSelectedDate(currentDateString);
                  }}
                />
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-400">Deskripsi Aktivitas <span className="text-error-500">*</span></label>
              {modalMode === "view" ? (
                <div className="text-sm text-gray-800 dark:text-white/90 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[120px] leading-relaxed">
                  {selectedLogbook?.activity}
                </div>
              ) : (
                <textarea 
                  rows={5} 
                  defaultValue={modalMode === "edit" ? selectedLogbook?.activity : ""}
                  placeholder="Ceritakan detail aktivitas pekerjaan yang Anda lakukan hari ini..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  required
                ></textarea>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-400">Bukti Lampiran <span className="text-error-500">*</span></label>
              {modalMode === "view" ? (
                  <div 
                  onClick={() => { handleCloseModal(); handleOpenPreview(selectedLogbook?.attachment || ""); }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors bg-white dark:bg-gray-900 shadow-sm group"
                >
                  <div className="bg-brand-100 text-brand-600 p-2.5 rounded-lg group-hover:bg-brand-500 group-hover:text-white transition-colors dark:bg-brand-900/40 dark:text-brand-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-brand-600 dark:text-gray-200 dark:group-hover:text-brand-400 transition-colors">{selectedLogbook?.attachment}</span>
                </div>
              ) : (
                <div className="flex w-full items-center justify-center mt-2">
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white hover:bg-brand-50 hover:border-brand-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <div className="bg-brand-50 p-2 rounded-full mb-3 dark:bg-brand-900/20">
                         <svg className="h-6 w-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      </div>
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400"><span className="font-bold text-brand-600 dark:text-brand-400">Klik untuk upload</span> atau drag and drop</p>
                      <p className="text-xs text-gray-400">PNG, JPG atau PDF (Max. 2MB)</p>
                    </div>
                    <input type="file" className="hidden" />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-2">
            {modalMode === "view" ? (
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Tutup
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={`rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-colors shadow-theme-xs ${modalMode === "edit" ? "bg-error-500 hover:bg-error-600 shadow-[0_4px_10px_rgba(220,38,38,0.2)]" : "bg-brand-500 hover:bg-brand-600 shadow-[0_4px_10px_rgba(0,104,55,0.2)]"}`}
                >
                  {modalMode === "add" ? "Kirim Logbook" : "Simpan Perbaikan"}
                </button>
              </>
            )}
          </div>
        </form>
      </Modal>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-brand-100 text-brand-600 p-1.5 rounded-md">
                   <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{previewFile}</span>
              </div>
              <button onClick={handleClosePreview} className="rounded-full p-1 text-gray-400 hover:bg-error-100 hover:text-error-600 dark:hover:bg-error-900/30 dark:hover:text-error-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex flex-col items-center justify-center bg-gray-100/50 dark:bg-black/50 p-6 min-h-[500px]">
              <div className="flex flex-col items-center justify-center opacity-40">
                <svg className="w-24 h-24 mb-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">Pratinjau Dokumen/Gambar</p>
                <p className="text-sm text-gray-500 mt-2 font-medium">Data asli akan dirender di area ini.</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}