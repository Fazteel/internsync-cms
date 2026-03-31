import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import DatePicker from "../../components/form/date-picker"; 
import Alert from "../../components/ui/alert/Alert"; 
import { Modal } from "../../components/ui/modal/index";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

interface TripRequest {
  id: number;
  industry: string;
  plannedDate: string;
  purpose: string;
  status: "Approved" | "Pending" | "Rejected";
  feedback?: string;
}

const mockTrips: TripRequest[] = [
  { id: 1, industry: "PT. Telkom Indonesia (Witel Karawang)", plannedDate: "24 Mar 2026", purpose: "Monitoring rutin bulan ke-3 dan evaluasi tengah periode dengan pembimbing lapangan.", status: "Pending" },
  { id: 2, industry: "CV. Media Kreatif", plannedDate: "15 Feb 2026", purpose: "Kunjungan pertama untuk penyerahan siswa dan pengecekan kesesuaian tempat magang.", status: "Approved" },
  { id: 3, industry: "PT. Inovasi Teknologi", plannedDate: "10 Jan 2026", purpose: "Penarikan siswa magang karena durasi PKL telah selesai.", status: "Rejected", feedback: "Tanggal bentrok dengan jadwal ujian sekolah, mohon ajukan ulang di minggu depannya." },
];

export default function PerjalananDinas() {
  const [tripData, setTripData] = useState<TripRequest[]>(mockTrips);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [industry, setIndustry] = useState("");
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  const handleOpenModal = () => {
    setIndustry("");
    setDate("");
    setPurpose("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setAlertInfo({
        show: true,
        variant: "warning",
        title: "Peringatan",
        message: "Silakan pilih tanggal rencana kunjungan pada kalender!",
      });
      return;
    }

    const newTrip: TripRequest = {
      id: tripData.length + 1,
      industry: industry,
      plannedDate: date, 
      purpose: purpose,
      status: "Pending",
    };
    
    setTripData([newTrip, ...tripData]);
    setAlertInfo({
      show: true,
      variant: "success",
      title: "Pengajuan Terkirim",
      message: "Pengajuan perjalanan dinas berhasil dikirim ke Hubin untuk direview.",
    });
    handleCloseModal();
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Pengajuan Perjalanan Dinas</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ajukan jadwal monitoring ke industri. Pengajuan akan ditinjau oleh tim Hubin.</p>
          </div>
          <div>
            <button 
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-center font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Ajukan Kunjungan
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Riwayat Pengajuan</h3>
          </div>

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Industri Tujuan</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Tanggal Rencana</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[300px]">Tujuan Kunjungan</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">Status</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {tripData.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{trip.industry}</p>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 text-theme-sm text-gray-800 dark:text-white/90 font-medium whitespace-nowrap">
                      {trip.plannedDate}
                    </TableCell>
                    
                    <TableCell className="py-4 text-theme-sm whitespace-nowrap">
                      <p className="text-gray-800 dark:text-white/90 truncate max-w-[300px]" title={trip.purpose}>
                        {trip.purpose}
                      </p>
                      {trip.status === "Rejected" && trip.feedback && (
                        <div className="mt-2 rounded-lg bg-error-50 p-2 border border-error-100 text-xs text-error-700 whitespace-normal">
                          <span className="font-semibold">Catatan Penolakan:</span> {trip.feedback}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-4 whitespace-nowrap">
                      <Badge color={trip.status === "Approved" ? "success" : trip.status === "Pending" ? "warning" : "error"}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {tripData.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-500">Belum ada riwayat pengajuan perjalanan dinas.</div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-6">
          Form Pengajuan Kunjungan
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Pilih Industri Tujuan <span className="text-error-500">*</span>
            </label>
            <div className="relative">
              <select 
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="appearance-none w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white cursor-pointer"
                required
              >
                <option value="" disabled className="text-gray-500 dark:text-gray-400 dark:bg-gray-900">Pilih Lokasi Industri</option>
                <option value="PT. Telkom Indonesia" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">PT. Telkom Indonesia</option>
                <option value="CV. Media Kreatif" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">CV. Media Kreatif</option>
                <option value="PT. Inovasi Teknologi" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">PT. Inovasi Teknologi</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">Hanya menampilkan industri tempat siswa bimbingan Anda berada.</p>
          </div>

          <div>
            <DatePicker
              id="date-picker-dinas"
              label="Tanggal Rencana Kunjungan *"
              placeholder="Pilih tanggal kunjungan"
              onChange={(dates: Date[], currentDateString: string) => {
                setDate(currentDateString);
              }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Tujuan & Agenda Kunjungan <span className="text-error-500">*</span>
            </label>
            <textarea 
              rows={4} 
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Misal: Monitoring rutin bulan ke-3, penarikan siswa, dll."
              className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white"
              required
            ></textarea>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={handleCloseModal}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-theme-xs"
            >
              Kirim Pengajuan
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}