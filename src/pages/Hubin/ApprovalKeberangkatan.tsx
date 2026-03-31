import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useDepartureStore, DepartureData } from "../../store/useDepartureStore";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function ApprovalKeberangkatan() {
  const { departures, isLoading, fetchDepartures, verifyDeparture, downloadSurat } = useDepartureStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Menunggu" | "Disetujui" | "Dibatalkan">("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DepartureData | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrinting, setIsPrinting] = useState<number | null>(null); // Nahan id yang lagi dicetak

  useEffect(() => {
    fetchDepartures();
  }, [fetchDepartures]);

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const handleOpenModal = (data: DepartureData, action: "approve" | "reject") => {
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
      handleCloseModal();
    } catch (error: unknown) {
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Gagal",
        message: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Terjadi kesalahan server."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintSurat = async (data: DepartureData) => {
    setIsPrinting(data.id);
    setAlertInfo({ show: true, variant: "info", title: "Memproses...", message: `Sedang men-*generate* Surat Pengantar untuk ${data.studentName}...` });
    
    try {
      await downloadSurat(data.id, data.studentName);
      setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: "Surat Pengantar berhasil diunduh!" });
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Gagal mencetak PDF. Hubungi admin." });
    } finally {
      setIsPrinting(null);
    }
  };

  const filteredData = departures.filter((item) => {
    const matchSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || item.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "All" ? true : item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const sortedData = [...filteredData].sort((a, b) => {
      if (a.status === "Menunggu" && b.status !== "Menunggu") return -1;
      if (a.status !== "Menunggu" && b.status === "Menunggu") return 1;
      return 0;
  });

  return (
    <>
      <PageMeta title="Approval Keberangkatan | Sistem Manajemen PKL" description="Persetujuan akhir keberangkatan siswa ke industri dan pencetakan Surat Pengantar." />

      <div className="space-y-6">
        {alertInfo.show && <div className="animate-fade-in"><Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} /></div>}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Approval Keberangkatan</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Verifikasi kesiapan penempatan dan terbitkan Surat Pengantar resmi dari Hubin.</p>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Cari Siswa / Industri..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white sm:w-64" />
            </div>
            <div className="relative w-full sm:w-auto">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as "All" | "Menunggu" | "Disetujui" | "Dibatalkan")} className="appearance-none w-full sm:w-[170px] rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 outline-none transition-all focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 cursor-pointer">
                <option value="All">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Nama Siswa</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Industri Tujuan</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Tgl Mulai</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">Status</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs whitespace-nowrap min-w-[200px]">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-gray-500">Memuat data verifikasi...</TableCell></TableRow>
                ) : sortedData.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-gray-500">Tidak ada data keberangkatan.</TableCell></TableRow>
                ) : (
                  sortedData.map((data) => (
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
                      <TableCell className="py-4 whitespace-nowrap">
                        {/* Biar ga bisa disetujui kalo koordinator belum ngeplot industri */}
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
                                disabled={!data.industry_id || !data.pembimbing_id} // Disable kalo blm komplit plot-annya
                                onClick={() => handleOpenModal(data, "approve")}
                                title={!data.industry_id ? "Siswa belum mendapat industri!" : "Setujui Keberangkatan"}
                                className="inline-flex items-center justify-center rounded bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Setujui
                              </button>
                              <button 
                                onClick={() => handleOpenModal(data, "reject")}
                                className="inline-flex items-center justify-center rounded bg-error-50 px-3 py-1.5 text-xs font-medium text-error-600 hover:bg-error-100 transition-colors"
                              >
                                Batalkan
                              </button>
                            </>
                          ) : data.status === "Disetujui" ? (
                            <button 
                              onClick={() => handlePrintSurat(data)}
                              disabled={isPrinting === data.id}
                              className="inline-flex items-center gap-1 rounded bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700 hover:bg-accent-100 transition-colors disabled:opacity-50"
                            >
                              {isPrinting === data.id ? (
                                 <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                              )}
                              Surat Pengantar
                            </button>
                          ) : (
                             <span className="text-xs text-gray-400 italic">Dibatalkan Hubin</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-lg overflow-hidden" showCloseButton={false}>
        {/* Konten Modal persis kayak punya lu, dibungkus logic isSubmitting aja */}
        <div className={`flex items-center justify-between border-b px-6 py-4 ${actionType === "approve" ? "border-brand-100 bg-brand-50" : "border-error-100 bg-error-50"}`}>
          <h3 className={`text-lg font-bold ${actionType === "approve" ? "text-brand-800" : "text-error-800"}`}>
            {actionType === "approve" ? "Setujui Keberangkatan" : "Batalkan Penempatan"}
          </h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="block text-xs font-medium text-gray-500">Nama Siswa</span><p className="mt-1 font-semibold text-gray-800">{selectedData?.studentName}</p></div>
              <div><span className="block text-xs font-medium text-gray-500">Tujuan Industri</span><p className="mt-1 font-semibold text-gray-800">{selectedData?.industry}</p></div>
            </div>
          </div>

          {actionType === "approve" ? (
            <div className="text-sm text-gray-600">Dengan menyetujui, Anda memvalidasi bahwa industri siap menerima siswa pada tanggal <span className="font-semibold text-gray-800">{selectedData?.startDate}</span>. Surat Pengantar akan otomatis diterbitkan.</div>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-error-600">Alasan Pembatalan <span className="text-error-500">*</span></label>
              <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-lg border border-error-300 bg-error-50/50 px-4 py-2.5 text-sm outline-none focus:border-error-500 focus:ring-1 focus:ring-error-500" required></textarea>
              <p className="mt-1.5 text-xs text-gray-500">Status siswa akan dikembalikan menjadi "Belum Ditempatkan" di halaman Koordinator.</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={handleCloseModal} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors shadow-theme-xs disabled:opacity-50 ${actionType === "approve" ? "bg-brand-500 hover:bg-brand-600" : "bg-error-500 hover:bg-error-600"}`}>
              {isSubmitting ? "Memproses..." : actionType === "approve" ? "Ya, Setujui" : "Batalkan Keberangkatan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}