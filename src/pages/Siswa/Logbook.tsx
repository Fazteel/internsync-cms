import React, { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useStudentPlacementStore } from "../../store/Siswa/useStudentPlacementStore";
import { useLogbookStore, LogbookEntry } from "../../store/Siswa/useLogbookStore";
import { PageHeader, TablePagination, TableTopControls } from "../../components/common/SharedUI";
import { usePermissionStore } from "../../store/Siswa/usePermissionStore";
import axios from "axios";

const getLocalYYYYMMDD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTanggalLokal = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Logbook() {
  const { penempatanData, fetchMyPlacement } = useStudentPlacementStore();
  const { logbookEntries, isLoading, fetchLogbooks, addLogbook, updateLogbook } = useLogbookStore();
  const { permissions, fetchPermissions } = usePermissionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedLogbook, setSelectedLogbook] = useState<LogbookEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [file, setFile] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [alertInfo, setAlertInfo] = useState<{ show: boolean; variant: "success" | "error" | "warning" | "info"; title: string; message: string; }>({
    show: false, variant: "success", title: "", message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyPlacement();
    fetchLogbooks();
    fetchPermissions();
  }, [fetchMyPlacement, fetchLogbooks, fetchPermissions]);

  const totalPages = Math.ceil(logbookEntries.length / rowsPerPage);
  const paginatedEntries = logbookEntries.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const availableDates = useMemo(() => {
    if (!penempatanData?.raw_start_date) return [];
    const start = new Date(penempatanData.raw_start_date);
    const today = new Date();
    const endLimit = penempatanData.raw_end_date ? new Date(penempatanData.raw_end_date) : today;
    const actualEnd = today > endLimit ? endLimit : today;
    const missingDates = [];
    const curr = new Date(start);
    curr.setHours(0, 0, 0, 0);
    actualEnd.setHours(0, 0, 0, 0);

    const todayStr = getLocalYYYYMMDD(today);

    while (curr <= actualEnd) {
      const day = curr.getDay();
      const dateStr = getLocalYYYYMMDD(curr);
      const isAlreadyFilled = logbookEntries.some(log => log.date === dateStr);
      const isOnLeave = permissions.some(p => p.status === "Approved" && dateStr >= p.raw_start_date && dateStr <= p.raw_end_date);

      if (day !== 0 && !isAlreadyFilled && !isOnLeave && dateStr <= todayStr) {
        missingDates.push(dateStr);
      }
      curr.setDate(curr.getDate() + 1);
    }
    return missingDates.reverse();
  }, [penempatanData, logbookEntries, permissions]);

  const handleOpenAddModal = () => {
    if (penempatanData?.status !== "Aktif") {
      setAlertInfo({ show: true, variant: "error", title: "Ditolak", message: "Anda hanya bisa mengisi logbook jika status PKL sudah Aktif." });
      return;
    }
    if (availableDates.length === 0) {
      setAlertInfo({ show: true, variant: "info", title: "Hebat!", message: "Semua logbook aktivitas hingga hari ini sudah Anda isi. Silakan kembali besok." });
      return;
    }

    setModalMode("add");
    setSelectedLogbook(null);
    setSelectedDate(availableDates[0]);
    setFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (log: LogbookEntry) => {
    setModalMode("edit");
    setSelectedLogbook(log);
    setSelectedDate(log.date);
    setFile(null);
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
    setFile(null);
  };

  const handleOpenPreview = (fileName: string, fileUrl: string | null) => {
    setPreviewFile(fileName);
    setPreviewUrl(fileUrl);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "view") return;
    if (!selectedDate) {
      setAlertInfo({ show: true, variant: "warning", title: "Peringatan", message: "Tanggal aktivitas wajib dipilih." });
      return;
    }

    const description = ((e.currentTarget as HTMLFormElement).elements.namedItem('description') as HTMLTextAreaElement).value;
    setIsSubmitting(true);

    try {
      if (modalMode === "add") {
        if (!file) throw new Error("File lampiran wajib diunggah.");
        await addLogbook({ date: selectedDate, activity: description, attachment: file });
      } else if (modalMode === "edit" && selectedLogbook) {
        await updateLogbook(selectedLogbook.id, { activity: description, attachment: file });
      }

      setAlertInfo({ show: true, variant: "success", title: "Tersimpan", message: `Data logbook berhasil disimpan.` });
    } catch (err: unknown) {
      let errorMessage = "Gagal menyimpan logbook.";

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: errorMessage });
    } finally {
      handleCloseModal();
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const todayStr = getLocalYYYYMMDD(new Date());

  return (
    <>
      <PageMeta title="Logbook Harian | Sistem Manajemen PKL" description="Catat aktivitas harian magang Anda." />

      <div className="space-y-6">
        {alertInfo.show && <div className="animate-fade-in"><Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} /></div>}

        <PageHeader title="Logbook Harian" description="Catat aktivitas PKL Anda setiap hari sebagai laporan kepada sekolah.">
          <button onClick={handleOpenAddModal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-center font-bold text-white shadow-theme-xs hover:bg-brand-600 transition-colors w-full sm:w-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Logbook
          </button>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <TableTopControls rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} totalData={logbookEntries.length} setCurrentPage={setCurrentPage} />

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-start text-theme-xs w-[15%]">Tanggal</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-start text-theme-xs w-[15%]">Aktivitas</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-start text-theme-xs w-[15%]">Lampiran</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-center text-theme-xs w-[15%]">Aksi</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="py-8 text-center text-gray-500">Memuat data logbook...</TableCell></TableRow>
                ) : paginatedEntries.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="py-8 text-center text-gray-500 italic"> Belum ada riwayat aktivitas.</TableCell></TableRow>
                ) : (
                  paginatedEntries.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">

                      <TableCell className="py-4 px-4 text-gray-800 dark:text-white/90 font-medium text-theme-sm whitespace-nowrap align-top">
                        {formatTanggalLokal(log.date)}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-theme-sm text-gray-800 dark:text-white/90 align-top">
                        <p className="line-clamp-2 leading-relaxed">{log.activity}</p>
                      </TableCell>

                      <TableCell className="py-4 px-4 align-top">
                        <div
                          className="inline-flex items-center gap-1.5 text-brand-600 text-xs font-medium cursor-pointer hover:text-brand-700 hover:underline"
                          onClick={() => handleOpenPreview(log.attachment, log.attachment_url)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                          Lihat File
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-4 text-center whitespace-nowrap align-top">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenViewModal(log)} className="border border-gray-300 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">Detail</button>
                          <button onClick={() => handleOpenEditModal(log)} className="bg-brand-50 text-brand-600 border border-brand-200 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-brand-100 transition-colors shadow-sm">Ubah</button>
                        </div>
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-[700px] p-0" showCloseButton={false}>
        <div className="flex items-center justify-between border-b rounded-t-2xl border-brand-100 bg-brand-50 px-6 py-4 dark:bg-gray-800">
          <h3 className="text-lg font-bold text-brand-800 dark:text-white">
            {modalMode === "add" ? "Tambah Logbook Baru" : modalMode === "edit" ? "Ubah Logbook" : "Detail Logbook"}
          </h3>
          <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-400">Tanggal Aktivitas</label>
              {modalMode !== "add" ? (
                <p className="text-sm font-bold text-gray-800 bg-white p-3 rounded-lg border border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700">{formatTanggalLokal(selectedLogbook?.date || "")}</p>
              ) : (
                <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-brand-500">
                  {availableDates.map(d => <option key={d} value={d}>{formatTanggalLokal(d)} {d === todayStr ? "(Hari Ini)" : ""}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-400">Deskripsi Aktivitas</label>
              {modalMode === "view" ? (
                <div className="text-sm text-gray-800 bg-white p-4 rounded-xl border border-gray-200 min-h-[120px] dark:bg-gray-900 dark:text-white whitespace-pre-wrap">{selectedLogbook?.activity}</div>
              ) : (
                <textarea name="description" rows={5} defaultValue={selectedLogbook?.activity || ""} placeholder="Ceritakan detail aktivitas..." className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-brand-500" required></textarea>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-400">Bukti Lampiran</label>
              {modalMode === "view" ? (
                <div onClick={() => { handleCloseModal(); handleOpenPreview(selectedLogbook?.attachment || "", selectedLogbook?.attachment_url || null); }} className="flex w-max items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-brand-300 bg-white group transition-all">
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-brand-600 transition-colors pr-2">{selectedLogbook?.attachment}</span>
                </div>
              ) : (
                <input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} required={modalMode === "add"} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={handleCloseModal} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Tutup</button>
            {modalMode !== "view" && (
              <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
                {isSubmitting ? "Menyimpan..." : "Simpan Logbook"}
              </button>
            )}
          </div>
        </form>
      </Modal>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex flex-col h-[80vh]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <span className="text-sm font-bold text-gray-800">{previewFile}</span>
              <button onClick={handleClosePreview} className="text-gray-400 hover:text-error-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <div className="flex-1 bg-gray-100 p-4 relative">
              {previewUrl ? (
                previewFile?.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={previewUrl} className="w-full h-full border-0 rounded" title="Preview PDF" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center overflow-auto"><img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded" /></div>
                )
              ) : (<div className="flex justify-center items-center h-full text-gray-500">File tidak dapat dimuat.</div>)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}