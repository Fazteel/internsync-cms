import React, { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SearchInput, SelectInput, TableDataState, TablePagination, TableTopControls } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useLogbookApproval, StudentLogbook } from "../../store/Pembimbing/useLogbookApprovalStore";
import { BadgeColor } from "../../components/ui/badge/Badge";

const LOGBOOK_STATUS_MAP: Record<string, { label: string; color: BadgeColor }> = {
  submitted: { label: "Pending", color: "warning" },
  approved: { label: "Disetujui", color: "success" },
  revised: { label: "Menunggu Revisi", color: "error" },
};

type FilterType = "All" | "submitted" | "approved" | "revised";
type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function LogbookApproval() {
  const { logbooksToVerify, isLoading, fetchLogbooksToVerify, verifyLogbook, bulkVerifyLogbooks } = useLogbookApproval();

  const [filterStatus, setFilterStatus] = useState<FilterType>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLogbook, setSelectedLogbook] = useState<StudentLogbook | null>(null);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  useEffect(() => {
    fetchLogbooksToVerify();
  }, [fetchLogbooksToVerify]);

  const studentList = useMemo(() => {
    const names = logbooksToVerify.map(log => log.studentName);
    return ["All", ...Array.from(new Set(names))];
  }, [logbooksToVerify]);

  const filteredLogbooks = useMemo(() => {
    return logbooksToVerify.filter((log) => {
      const matchStatus = filterStatus === "All" || log.status === filterStatus;
      const matchStudent = selectedStudent === "All" || log.studentName === selectedStudent;
      const matchSearch = log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || log.nis.includes(searchTerm);
      return matchStatus && matchStudent && matchSearch;
    });
  }, [logbooksToVerify, filterStatus, selectedStudent, searchTerm]);

  const totalPages = Math.ceil(filteredLogbooks.length / rowsPerPage);
  const paginatedData = filteredLogbooks.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const onlyPending = paginatedData.filter(l => l.status === "submitted").map(l => l.id);
      setSelectedIds(onlyPending);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkVerifyLogbooks(selectedIds, "Approved");
      setAlertInfo({ show: true, variant: "success", title: "Bulk Berhasil", message: `${selectedIds.length} logbook berhasil disetujui.` });
      setSelectedIds([]);
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Gagal memproses bulk approval." });
    }
  };

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

  const handleApprove = async () => {
    if (!selectedLogbook) return;
    try {
      await verifyLogbook(selectedLogbook.id, "Approved");
      setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: "Logbook disetujui." });
      handleCloseModal();
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Sistem error." });
    }
  };

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNote.trim() || !selectedLogbook) return;
    try {
      await verifyLogbook(selectedLogbook.id, "Revision", revisionNote);
      setAlertInfo({ show: true, variant: "info", title: "Terkirim", message: "Revisi dikirim." });
      handleCloseModal();
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Sistem error." });
    }
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  return (
    <>
      <PageMeta title="Verifikasi Logbook | Sistem Manajemen PKL" description="Pemeriksaan laporan harian siswa." />

      <div className="space-y-6">
        {alertInfo.show && <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />}

        <PageHeader title="Verifikasi Logbook" description="Berikan persetujuan atau catatan perbaikan pada laporan siswa.">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Cari Nama/NIS..." />

          <SelectInput
            value={selectedStudent}
            onChange={(val) => {
              setSelectedStudent(val);
              setCurrentPage(1);
            }}>
            {studentList.map(name => <option key={name} value={name}>{name === "All" ? "Semua Siswa" : name}</option>)}
          </SelectInput>

          <SelectInput
            value={filterStatus}
            onChange={(val) => {
              setFilterStatus(val as FilterType);
              setCurrentPage(1);
            }}>
            <option value="All">Semua Status</option>
            <option value="submitted">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="revised">Revisi</option>
          </SelectInput>
        </PageHeader>

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-brand-50 p-4 rounded-xl border border-brand-200 animate-fade-in dark:bg-brand-900/20">
            <p className="text-sm font-bold text-brand-700 dark:text-brand-400">{selectedIds.length} Logbook dipilih</p>
            <button
              onClick={handleBulkApprove}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 shadow-md"
            >
              Setujui Semua Terpilih
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
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
                  <TableCell isHeader className="w-10 px-6">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      className="cursor-pointer rounded border-gray-300"
                      checked={selectedIds.length > 0 && selectedIds.length === paginatedData.filter(l => l.status === "submitted").length}
                    />
                  </TableCell>
                  <TableCell isHeader className="py-3 px-6 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap">Nama Siswa</TableCell>
                  <TableCell isHeader className="py-3 px-6 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap">Tanggal</TableCell>
                  <TableCell isHeader className="py-3 px-6 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap">Aktivitas</TableCell>
                  <TableCell isHeader className="py-3 px-6 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap">Status</TableCell>
                  <TableCell isHeader className="py-3 px-6 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState
                  isLoading={isLoading}
                  isEmpty={paginatedData.length === 0}
                  colSpan={6}
                  loadingText="Memuat data logbook siswa..."
                  emptyText={searchTerm ? "Siswa tidak ditemukan." : "Tidak ada data logbook."}
                >
                  {paginatedData.map((log) => {
                    const statusConfig = LOGBOOK_STATUS_MAP[log.status] || LOGBOOK_STATUS_MAP.submitted;

                    return (
                      <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <TableCell className="w-10 px-6">
                          {log.status === "submitted" && (
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(log.id)}
                              onChange={() => toggleSelect(log.id)}
                              className="cursor-pointer rounded border-gray-300"
                            />
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-6 whitespace-nowrap">
                          <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{log.studentName}</p>
                          <span className="text-gray-500 text-theme-xs">{log.industry}</span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-gray-800 font-medium text-theme-sm whitespace-nowrap">{log.date}</TableCell>
                        <TableCell className="py-4 px-6 text-theme-sm text-gray-600 truncate max-w-[250px]">{log.activity}</TableCell>
                        <TableCell className="py-4 px-6 whitespace-nowrap">
                          <Badge color={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleOpenModal(log)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${log.status === "submitted" ? "bg-brand-500 text-white hover:bg-brand-600 shadow-sm" : "bg-gray-100 text-gray-600 border border-gray-200"}`}
                          >
                            {log.status === "submitted" ? "Evaluasi" : "Detail"}
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                {selectedLogbook && (
                   <Badge color={LOGBOOK_STATUS_MAP[selectedLogbook.status]?.color || "warning"}>
                    {LOGBOOK_STATUS_MAP[selectedLogbook.status]?.label || "Pending"}
                  </Badge>
                )}
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
          <button onClick={handleCloseModal} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Tutup</button>

          {selectedLogbook?.status === "submitted" && !isRevisionMode && (
            <>
              <button onClick={() => setIsRevisionMode(true)} className="rounded-lg border border-error-200 bg-error-50 px-5 py-2.5 text-sm font-semibold text-error-600 hover:bg-error-100 dark:bg-error-900/20 dark:border-error-800/50 dark:text-error-400">Minta Revisi</button>
              <button onClick={handleApprove} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 shadow-[0_4px_10px_rgba(0,104,55,0.2)]">Setujui Logbook</button>
            </>
          )}

          {isRevisionMode && (
            <button onClick={handleSubmitRevision} className="rounded-lg bg-error-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-error-700">Kirim Revisi</button>
          )}
        </div>
      </Modal>
    </>
  );
}