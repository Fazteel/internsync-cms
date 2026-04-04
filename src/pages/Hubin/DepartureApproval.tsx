import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SearchInput, SelectInput, TableDataState, TablePagination, TableTopControls } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useDepartureStore, DepartureData } from "../../store/Hubin/useDepartureStore";
import { useMasterStore } from "../../store/Admin/useMasterStore";

type AlertVariant = "success" | "warning" | "info" | "error";
type StatusType = "All" | "Menunggu" | "Disetujui" | "Dibatalkan";
type ActionType = "approve" | "reject";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function DepartureApproval() {
  const { departures, isLoading, fetchDepartures, verifyDeparture } = useDepartureStore();
  const { majors, fetchMajors } = useMasterStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusType>("All");
  const [filterJurusan, setFilterJurusan] = useState("All");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DepartureData | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [reason, setReason] = useState("");

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrinting, setIsPrinting] = useState<number | null>(null);

  useEffect(() => {
    fetchDepartures();
    fetchMajors();
  }, [fetchDepartures, fetchMajors]);

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const handleOpenModal = (data: DepartureData, action: ActionType) => {
    setSelectedData(data);
    setActionType(action);
    setReason("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedData(null);
    setActionType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedData || !actionType) return;

    if (actionType === "reject" && !reason.trim()) {
      setAlertInfo({ show: true, variant: "warning", title: "Perhatian", message: "Alasan pembatalan wajib diisi!" });
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyDeparture(selectedData.id, actionType, reason);
      const actionText = actionType === "approve" ? "disetujui" : "dibatalkan";
      setAlertInfo({ show: true, variant: actionType === "approve" ? "success" : "info", title: "Berhasil", message: `Keberangkatan ${selectedData.studentName} berhasil ${actionText}.` });
      fetchDepartures();
    } catch (error: unknown) {
      console.error("Gagal approval:", error);
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Gagal",
        message: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Terjadi kesalahan server."
      });
    } finally {
      handleCloseModal();
      setIsSubmitting(false);
    }
  };

  const filteredData = departures.filter((item) => {
    const matchSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || item.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "All" ? true : item.status === filterStatus;
    
    const selectedMajorObj = majors.find(m => m.kode === filterJurusan);
    const matchJurusan = filterJurusan === "All" 
      ? true 
      : (item.major === selectedMajorObj?.kode || item.major === selectedMajorObj?.nama);

    return matchSearch && matchStatus && matchJurusan;
  });

  const sortedData = [...filteredData].sort((a, b) => {
      if (a.status === "Menunggu" && b.status !== "Menunggu") return -1;
      if (a.status !== "Menunggu" && b.status === "Menunggu") return 1;
      return 0;
  });

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <PageMeta title="Approval Keberangkatan | Sistem Manajemen PKL" description="Persetujuan akhir keberangkatan siswa ke industri dan pencetakan Surat Pengantar." />

      <div className="space-y-6">
        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <PageHeader 
          title="Approval Keberangkatan" 
          description="Verifikasi kesiapan penempatan dan terbitkan Surat Pengantar resmi dari Hubin."
        >
          <SearchInput value={searchTerm} onChange={(val) => { setSearchTerm(val); setCurrentPage(1); }} placeholder="Cari Siswa / Industri..." />
          
          <SelectInput
            value={filterJurusan} 
            onChange={(val) => { setFilterJurusan(val); setCurrentPage(1); }}
          >
            <option value="All">Semua Jurusan</option>
            {majors.map(m => <option key={m.id} value={m.kode}>{m.kode} - {m.nama}</option>)}
          </SelectInput>

          <SelectInput
            value={filterStatus} 
            onChange={(val) => { setFilterStatus(val as StatusType); setCurrentPage(1); }}>
            <option value="All">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </SelectInput>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <TableTopControls 
            rowsPerPage={rowsPerPage} 
            setRowsPerPage={setRowsPerPage} 
            totalData={sortedData.length} 
            setCurrentPage={setCurrentPage} 
          />

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Nama Siswa</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Industri Tujuan</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Tgl Mulai</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Tgl Selesai</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">Status</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs whitespace-nowrap min-w-[200px]">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState 
                  isLoading={isLoading} 
                  isEmpty={paginatedData.length === 0} 
                  colSpan={6} 
                  loadingText="Memuat data verifikasi..."
                  emptyText="Tidak ada data keberangkatan."
                >
                  {paginatedData.map((data) => (
                    <TableRow key={data.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 whitespace-nowrap">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{data.studentName}</p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">{data.nis} • {data.major}</span>
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm text-gray-800 dark:text-white/90 font-medium whitespace-nowrap">
                        {data.industry}
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {data.startDate}
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {data.endDate}
                      </TableCell>
                      <TableCell className="py-4 whitespace-nowrap">
                        {!data.industry_id && data.status === "Menunggu" ? (
                           <Badge color="error">Belum Di-plot</Badge>
                        ) : (
                          <div className="flex items-start mt-1">
                            <Badge color={data.status === "Disetujui" ? "success" : data.status === "Menunggu" ? "warning" : "error"}>
                              {data.status}
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {data.status === "Menunggu" ? (
                            <>
                              <button 
                                disabled={!data.industry_id || !data.pembimbing_id}
                                onClick={() => handleOpenModal(data, "approve")}
                                title={!data.industry_id ? "Siswa belum mendapat industri!" : "Setujui Keberangkatan"}
                                className="inline-flex items-center justify-center rounded bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Setujui
                              </button>
                              <button 
                                onClick={() => handleOpenModal(data, "reject")}
                                className="inline-flex items-center justify-center rounded bg-error-50 px-3 py-1.5 text-xs font-medium text-error-600 hover:bg-error-100 transition-colors dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20"
                              >
                                Batalkan
                              </button>
                            </>
                          ) : data.status === "Disetujui" ? (
                            <div className="flex gap-2">
                              {!data.has_letter ? (
                                <button 
                                  onClick={async () => {
                                    setIsPrinting(data.id);
                                    try {
                                      await useDepartureStore.getState().generateSurat(data.id);
                                      setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: "Surat Pengantar berhasil dibuat dan disimpan!" });
                                      fetchDepartures();
                                    } catch (err: unknown) {
                                      console.error("Gagal generate surat:", err);
                                      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Gagal membuat surat." });
                                    } finally {
                                      setIsPrinting(null);
                                    }
                                  }}
                                  disabled={isPrinting === data.id}
                                  className="inline-flex items-center gap-1 rounded bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors disabled:opacity-50 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                                >
                                  {isPrinting === data.id ? "Memproses..." : "Generate Surat"}
                                </button>
                              ) : (
                                <button 
                                  onClick={() => useDepartureStore.getState().viewSurat(data.id)}
                                  className="inline-flex items-center gap-1 rounded bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700 hover:bg-accent-100 transition-colors dark:bg-accent-500/10 dark:text-accent-400 dark:hover:bg-accent-500/20"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                  Lihat Surat
                                </button>
                              )}
                            </div>
                          ) : (
                             <span className="text-xs text-gray-400 italic">Dibatalkan Hubin</span>
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-lg overflow-hidden p-0" showCloseButton={false}>
        <div className={`flex items-center justify-between border-b px-6 py-4 ${actionType === "approve" ? "border-brand-100 bg-brand-50 dark:border-brand-800/30 dark:bg-brand-900/10" : "border-error-100 bg-error-50 dark:border-error-800/30 dark:bg-error-900/10"}`}>
          <h3 className={`text-lg font-bold ${actionType === "approve" ? "text-brand-800 dark:text-brand-400" : "text-error-800 dark:text-error-400"}`}>
            {actionType === "approve" ? "Setujui Keberangkatan" : "Batalkan Penempatan"}
          </h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</span>
                <p className="mt-1 font-bold text-gray-800 dark:text-white/90">{selectedData?.studentName}</p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan Industri</span>
                <p className="mt-1 font-bold text-gray-800 dark:text-white/90">{selectedData?.industry}</p>
              </div>
            </div>
          </div>

          {actionType === "approve" ? (
            <div className="text-sm text-gray-600 dark:text-gray-300 bg-brand-50/50 p-4 rounded-lg border border-brand-100 dark:bg-brand-900/10 dark:border-brand-800/30">
              Dengan menyetujui, Anda memvalidasi bahwa industri siap menerima siswa pada tanggal <span className="font-bold text-gray-800 dark:text-white/90">{selectedData?.startDate}</span>. Surat Pengantar akan otomatis diterbitkan.
            </div>
          ) : (
            <div className="bg-error-50/50 p-4 rounded-lg border border-error-100 dark:bg-error-900/10 dark:border-error-800/30">
              <label className="mb-2 block text-sm font-bold text-error-700 dark:text-error-500">Alasan Pembatalan <span className="text-error-500">*</span></label>
              <textarea 
                rows={3} 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                className="w-full rounded-lg border border-error-300 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-error-500 focus:ring-2 focus:ring-error-500/20 dark:bg-gray-900 dark:text-white dark:border-error-700" 
                placeholder="Kenapa dibatalin? Ketik di sini..."
                required
              ></textarea>
              <p className="mt-2 text-xs text-error-600 dark:text-error-400">Status siswa akan dikembalikan menjadi "Belum Ditempatkan" di halaman Koordinator.</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button 
              type="button" 
              onClick={handleCloseModal} 
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed ${
                actionType === "approve" ? "bg-brand-500 hover:bg-brand-600" : "bg-error-600 hover:bg-error-700"
              }`}
            >
              {isSubmitting ? "Memproses..." : actionType === "approve" ? "Ya, Setujui" : "Batalkan Keberangkatan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}