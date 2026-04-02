import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SelectInput, TableDataState } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import DatePicker from "../../components/form/date-picker"; 
import Alert from "../../components/ui/alert/Alert"; 
import { Modal } from "../../components/ui/modal/index";
import { useIndustiryVisit } from "../../store/Pembimbing/useIndustryVisitStore";

type AlertVariant = "success" | "warning" | "info" | "error";

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
    fetchVisit, 
    submitVisit, 
    isLoading, 
    fetchAssignedIndustries, 
  } = useIndustiryVisit();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [industryId, setIndustryId] = useState("");
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVisit();
    fetchAssignedIndustries();
  }, [fetchVisit, fetchAssignedIndustries]);

  const handleOpenModal = () => {
    if (assignedIndustries.length === 0) {
      setAlertInfo({ show: true, variant: "warning", title: "Informasi", message: "Anda belum memiliki siswa bimbingan yang ditempatkan di industri." });
      return;
    }
    setIndustryId("");
    setDate("");
    setPurpose("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setAlertInfo({ show: true, variant: "warning", title: "Peringatan", message: "Silakan lengkapi tanggal rencana kunjungan Anda." });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitVisit({
        industry_id: industryId,
        planned_date: date,
        purpose: purpose
      });
      
      setAlertInfo({
        show: true,
        variant: "success",
        title: "Pengajuan Terkirim",
        message: "Pengajuan perjalanan dinas berhasil dikirim ke tim Hubin.",
      });
      handleCloseModal();
    } catch (error) {
      console.error("Gagal melakukan pengajuan:", error);
      setAlertInfo({ show: true, variant: "error", title: "Gagal Mengirim", message: "Terjadi kesalahan pada sistem. Silakan coba kembali beberapa saat lagi." });
    } finally {
      setIsSubmitting(false);
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
      <PageMeta title="Perjalanan Dinas | Sistem Manajemen PKL" description="Ajukan dan pantau jadwal kunjungan monitoring ke industri tempat siswa PKL." />

      <div className="space-y-6">
        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <PageHeader 
          title="Pengajuan Perjalanan Dinas" 
          description="Ajukan jadwal monitoring ke industri. Pengajuan akan ditinjau oleh tim Hubin."
        >
          <div className="w-full sm:w-auto">
            <button 
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-center font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors w-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Ajukan Kunjungan
            </button>
          </div>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Riwayat Pengajuan</h3>
          </div>

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Industri Tujuan</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Tanggal Rencana</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[300px]">Tujuan Kunjungan</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap">Status</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState 
                  isLoading={isLoading} 
                  isEmpty={visits.length === 0} 
                  colSpan={4} 
                  emptyText="Belum ada riwayat pengajuan perjalanan dinas."
                >
                  {visits.map((visit) => (
                    <TableRow key={visit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                          </div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{visit.industry}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 text-theme-sm text-gray-800 dark:text-white/90 font-medium whitespace-nowrap">
                        {visit.plannedDate}
                      </TableCell>
                      
                      <TableCell className="py-4 text-theme-sm whitespace-nowrap">
                        <p className="text-gray-800 dark:text-white/90 truncate max-w-[300px]" title={visit.purpose}>
                          {visit.purpose}
                        </p>
                        {visit.status === "Rejected" && visit.feedback && (
                          <div className="mt-2 rounded-lg bg-error-50 p-2 border border-error-100 text-xs text-error-700 dark:bg-error-900/10 dark:border-error-800/30 dark:text-error-400 whitespace-normal">
                            <span className="font-semibold">Catatan Penolakan:</span> {visit.feedback}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="py-4 whitespace-nowrap">
                        <Badge color={visit.status === "Approved" ? "success" : visit.status === "Pending" ? "warning" : "error"}>
                          {visit.status}
                        </Badge>
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
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
            Form Pengajuan Kunjungan
          </h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                Pilih Industri Tujuan <span className="text-error-500">*</span>
              </label>
              <SelectInput 
                value={industryId} 
                onChange={setIndustryId} 
                required
              >
                <option value="" disabled>Pilih Lokasi Industri</option>
                {assignedIndustries.map((ind) => (
                  <option key={ind.id} value={ind.id}>{ind.name}</option>
                ))}
              </SelectInput>
              <p className="mt-1.5 text-xs text-gray-500">Hanya menampilkan daftar industri tempat siswa bimbingan Anda ditugaskan.</p>
            </div>

            <div>
              <DatePicker
                id="date-picker-dinas"
                label={<>Tanggal Rencana Kunjungan <span className="text-error-500">*</span></>}
                placeholder="Pilih tanggal kunjungan"
                onChange={(dates: Date[], currentDateString: string) => {
                  setDate(currentDateString);
                }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                Tujuan & Agenda Kunjungan <span className="text-error-500">*</span>
              </label>
              <textarea 
                rows={4} 
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Misal: Monitoring rutin bulan ke-3, penarikan siswa, dll."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                required
              ></textarea>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Memproses..." : "Kirim Pengajuan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}