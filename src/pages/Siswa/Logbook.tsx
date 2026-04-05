import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useStudentPlacementStore } from "../../store/Siswa/useStudentPlacementStore";
import { useLogbookStore, LogbookEntry } from "../../store/Siswa/useLogbookStore";
import { PageHeader, SelectInput, TablePagination, TableTopControls } from "../../components/common/SharedUI";
import { usePermissionStore } from "../../store/Siswa/usePermissionStore";

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

type FilterType = "All" | "submitted" | "approved" | "revised";

export default function Logbook() {
  const { penempatanData, fetchMyPlacement } = useStudentPlacementStore();
  const { logbookEntries, isLoading, fetchLogbooks, addLogbook, updateLogbook } = useLogbookStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedLogbook, setSelectedLogbook] = useState<LogbookEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const { permissions, fetchPermissions } = usePermissionStore();

  const [filterStatus, setFilterStatus] = useState<FilterType>("All");
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

  const filteredEntries = useMemo(() => {
    return logbookEntries.filter((entry) => {
      if (filterStatus === "All") return true;
      return entry.status === filterStatus;
    });
  }, [logbookEntries, filterStatus]);

  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, rowsPerPage]);

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

      const isOnLeave = permissions.some(p =>
        p.status === "Approved" &&
        dateStr >= p.raw_start_date &&
        dateStr <= p.raw_end_date
      );

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
        if (!file) {
          setAlertInfo({ show: true, variant: "warning", title: "Peringatan", message: "File lampiran wajib diunggah." });
          setIsSubmitting(false);
          return;
        }
        await addLogbook({ date: selectedDate, activity: description, attachment: file });
      } else if (modalMode === "edit" && selectedLogbook) {
        await updateLogbook(selectedLogbook.id, { activity: description, attachment: file });
      }

      setAlertInfo({
        show: true, variant: "success", title: "Logbook Tersimpan",
        message: `Data logbook ${modalMode === "add" ? "baru" : "revisi"} berhasil disimpan.`,
      });
    } catch (err: unknown) {
      let message = "Terjadi kesalahan pada server.";

      if (axios.isAxiosError(err)) {
        const data = err.response?.data as {
          message?: string;
          errors?: { attachment?: string[] };
        };

        const attachmentError = data?.errors?.attachment?.[0];
        message = attachmentError || data?.message || message;
      }

      setAlertInfo({
        show: true,
        variant: "error",
        title: "Gagal Menyimpan",
        message,
      });
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

  const filteredLogbooks = logbookEntries.filter((logbook) => {
    const matchStatus = filterStatus === "All" ? true : logbook.status === filterStatus;
    return matchStatus;
  })

  return (
    <>
      <PageMeta title="Logbook Harian | Sistem Manajemen PKL" description="Halaman untuk mengisi dan memantau riwayat laporan aktivitas harian PKL." />

      <div className="space-y-6">

        {alertInfo.show && (
          <div className="animate-fade-in"><Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} /></div>
        )}

        <PageHeader
          title="Logbook Harian"
          description="Catat aktivitas PKL Anda setiap hari. Logbook akan diperiksa oleh Guru Pembimbing."
        >
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <SelectInput
              value={filterStatus}
              onChange={(val) => setFilterStatus(val as FilterType)}>
              <option value="All">Semua</option>
              <option value="submitted">Disubmit</option>
              <option value="approved">Disetujui</option>
              <option value="revised">Revisi</option>
            </SelectInput>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-center font-bold text-white shadow-theme-xs hover:bg-brand-600 transition-colors w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Tambah Logbook
            </button>
          </div>

        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">

          <TableTopControls
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalData={filteredLogbooks.length}
            setCurrentPage={setCurrentPage}
          />

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-start text-theme-xs">Tanggal</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-start text-theme-xs">Aktivitas</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-start text-theme-xs">Lampiran</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-start text-theme-xs">Status</TableCell>
                  <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-center text-theme-xs">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-gray-500">Memuat data logbook...</TableCell></TableRow>
                ) : paginatedEntries.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-gray-500 italic"> Belum ada riwayat aktivitas.</TableCell></TableRow>
                ) : (
                  paginatedEntries.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 px-4 text-gray-800 dark:text-white/90 font-medium text-theme-sm whitespace-nowrap">{formatTanggalLokal(log.date)}</TableCell>
                      <TableCell className="py-4 px-4 text-theme-sm">
                        <p className="text-gray-800 dark:text-white/90 leading-relaxed max-w-md line-clamp-2">{log.activity}</p>
                        {log.status === "revised" && log.revisionNote && (
                          <div className="mt-2 text-xs text-error-600 bg-error-50 p-2 rounded border border-error-100 dark:bg-error-900/10">Catatan: {log.revisionNote}</div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <div className="text-brand-600 text-xs font-medium cursor-pointer hover:underline" onClick={() => handleOpenPreview(log.attachment, log.attachment_url)}>Lihat File</div>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Badge color={log.status === "approved" ? "success" : log.status === "submitted" ? "warning" : "error"}>
                          {log.status === "revised" ? "Revisi" : log.status === "approved" ? "Disetujui" : "Menunggu"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-4 text-center">
                        {log.status === "revised" ? (
                          <button onClick={() => handleOpenEditModal(log)} className="bg-error-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-error-600 transition shadow-sm">Perbaiki</button>
                        ) : (
                          <button onClick={() => handleOpenViewModal(log)} className="border border-gray-300 px-3 py-1.5 rounded-md text-xs font-semibold dark:border-gray-700 dark:text-gray-300">Detail</button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
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


      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-[700px] p-0 max-h-[90vh] overflow-y-auto custom-scrollbar" showCloseButton={false}>
        <div className={`flex items-center justify-between border-b px-6 py-4 ${modalMode === "edit" ? "border-error-100 bg-error-50" : "border-brand-100 bg-brand-50"} dark:bg-gray-800`}>
          <h3 className={`text-lg font-bold ${modalMode === "edit" ? "text-error-800" : "text-brand-800"} dark:text-white`}>
            {modalMode === "add" && "Tambah Logbook Baru"}
            {modalMode === "edit" && "Perbaiki Logbook"}
            {modalMode === "view" && "Detail Logbook"}
          </h3>
          <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {(modalMode === "edit" || modalMode === "view") && selectedLogbook?.revisionNote && (
            <div className="rounded-xl bg-error-50 p-4 border border-error-100 shadow-sm dark:bg-error-900/10">
              <p className="text-xs font-bold text-error-700 uppercase tracking-wider mb-1 flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Catatan dari Pembimbing:</p>
              <p className="text-sm text-error-600 leading-relaxed">{selectedLogbook.revisionNote}</p>
            </div>
          )}

          <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-400">
                Tanggal Aktivitas <span className="text-error-500">*</span>
              </label>

              {modalMode !== "add" ? (
                <p className="text-sm font-bold text-gray-800 bg-white p-3 rounded-lg border border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700">
                  {formatTanggalLokal(selectedLogbook?.date || "")}
                </p>
              ) : (
                <div className="relative">
                  <SelectInput
                    value={selectedDate}
                    onChange={(val) => setSelectedDate(val)}
                    required
                  >
                    <option value="" disabled>Pilih tanggal aktivitas yang belum diisi...</option>
                    {availableDates.map(d => (
                      <option key={d} value={d}>
                        {formatTanggalLokal(d)} {d === todayStr ? "(Hari Ini)" : ""}
                      </option>
                    ))}
                  </SelectInput>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-400">Deskripsi Aktivitas <span className="text-error-500">*</span></label>
              {modalMode === "view" ? (
                <div className="text-sm text-gray-800 bg-white p-4 rounded-xl border border-gray-200 min-h-[120px] dark:bg-gray-900 dark:text-white dark:border-gray-700 whitespace-pre-wrap">{selectedLogbook?.activity}</div>
              ) : (
                <textarea name="description" rows={5} defaultValue={modalMode === "edit" ? selectedLogbook?.activity : ""} placeholder="Ceritakan detail aktivitas pekerjaan yang Anda lakukan hari ini..." className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white dark:border-gray-600" required></textarea>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-400">Bukti Lampiran <span className="text-error-500">*</span></label>
              {modalMode === "view" ? (
                <div onClick={() => { handleCloseModal(); handleOpenPreview(selectedLogbook?.attachment || "", selectedLogbook?.attachment_url || null); }} className="flex w-max items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-brand-300 bg-white dark:bg-gray-900 dark:border-gray-700 group transition-all">
                  <div className="bg-brand-50 text-brand-600 p-2 rounded-lg group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-brand-600 transition-colors pr-2 truncate max-w-[250px]" title={selectedLogbook?.attachment}>{selectedLogbook?.attachment}</span>
                </div>
              ) : (
                <div className="flex w-full items-center justify-center mt-2">
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white hover:bg-brand-50 hover:border-brand-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <div className="bg-brand-50 p-2 rounded-full mb-3 dark:bg-brand-900/20 text-brand-500">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      </div>
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400"><span className="font-bold text-brand-600 dark:text-brand-400">Klik untuk upload</span> gambar/dokumen</p>
                      <p className="text-xs text-gray-400">PNG, JPG atau PDF (Max. 2MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) => {
                        const selectedFile = e.target.files ? e.target.files[0] : null;
                        setFile(selectedFile);
                      }}
                      required={modalMode === "add"}
                    />
                  </label>
                  {file ? (
                    <div className="w-full flex flex-col items-center gap-2 mt-3">
                      <p className="text-center text-xs text-brand-600 font-medium">File terpilih: {file.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                        }}
                        className="text-xs font-bold text-error-600 bg-error-50 px-3 py-1.5 rounded-md border border-error-200 hover:bg-error-100 hover:text-error-700 transition"
                      >
                        Hapus Attachment
                      </button>
                    </div>
                  ) : modalMode === "edit" && selectedLogbook?.attachment ? (
                    <p className="w-full text-center text-xs text-gray-500 mt-2 truncate">File saat ini: {selectedLogbook.attachment} (Abaikan jika tidak ingin mengubah)</p>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={handleCloseModal} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300" disabled={isSubmitting}>Tutup</button>
            {modalMode !== "view" && (
              <button type="submit" disabled={isSubmitting} className={`rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-colors shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed ${modalMode === "edit" ? "bg-error-500 hover:bg-error-600" : "bg-brand-500 hover:bg-brand-600"}`}>
                {isSubmitting ? "Menyimpan..." : modalMode === "add" ? "Kirim Logbook" : "Simpan Perbaikan"}
              </button>
            )}
          </div>
        </form>
      </Modal>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden dark:bg-gray-900 h-[80vh]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800 shrink-0">
              <span className="text-sm font-bold text-gray-800 dark:text-white truncate max-w-md">{previewFile}</span>
              <div className="flex items-center gap-2">
                <a href={previewUrl || "#"} target="_blank" rel="noreferrer" className="text-xs font-medium text-brand-600 hover:underline mr-2">Buka di Tab Baru</a>
                <button onClick={handleClosePreview} className="text-gray-400 hover:text-error-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 p-4 dark:bg-black/50 overflow-hidden relative">
              {previewUrl ? (
                previewFile?.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={previewUrl} className="w-full h-full border-0 rounded" title="Preview PDF" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center overflow-auto">
                    <img src={previewUrl} alt="Preview Lampiran" className="max-w-full max-h-full object-contain rounded shadow-sm" />
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p className="font-medium">File tidak dapat dimuat atau belum tersedia dari server.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}