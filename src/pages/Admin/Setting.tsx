import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useSettingStore } from "../../store/Admin/useSettingStore";
import { PageHeader } from "../../components/common/SharedUI";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function Setting() {
  const { settings, saveSettings } = useSettingStore();

  const [appName, setAppName] = useState("Sistem Manajemen PKL (InternSync)");
  const [schoolName, setSchoolName] = useState("SMK PGRI Telagasari");
  const [supportEmail, setSupportEmail] = useState("admin@smkpgritelagasari.sch.id");

  const [registrationStatus, setRegistrationStatus] = useState<"Buka" | "Tutup">("Buka");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [pendingMaintenanceState, setPendingMaintenanceState] = useState(false);

  const [enableNotifications, setEnableNotifications] = useState(true);

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (Object.keys(settings).length > 0 && !isInitialized) {
      setAppName(settings.app_name || "Sistem Manajemen PKL (InternSync)");
      setSchoolName(settings.school_name || "SMK PGRI Telagasari");
      setSupportEmail(settings.support_email || "admin@smkpgritelagasari.sch.id");
      setRegistrationStatus((settings.pkl_registration_status as "Buka" | "Tutup") || "Buka");
      setStartDate(settings.pkl_start_date || "");
      setEndDate(settings.pkl_end_date || "");
      setMaintenanceMode(settings.maintenance_mode === "true");
      setEnableNotifications(settings.enable_notifications !== "false");
      setIsInitialized(true);
    }
  }, [settings, isInitialized]);

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const handleMaintenanceToggle = (checked: boolean) => {
    if (checked) {
      setPendingMaintenanceState(true);
      setIsMaintenanceModalOpen(true);
    } else {
      setMaintenanceMode(false);
      setAlertInfo({ show: true, variant: "info", title: "Maintenance Dinonaktifkan", message: "Sistem telah kembali beroperasi secara normal untuk semua pengguna." });
    }
  };

  const confirmMaintenanceToggle = () => {
    setMaintenanceMode(pendingMaintenanceState);
    setIsMaintenanceModalOpen(false);
    setAlertInfo({ show: true, variant: "warning", title: "Mode Maintenance Aktif", message: "Perhatian: Semua pengguna selain Admin tidak dapat mengakses sistem saat ini." });
  };

  const cancelMaintenanceToggle = () => setIsMaintenanceModalOpen(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registrationStatus === "Buka" && (!startDate || !endDate)) {
      setAlertInfo({ show: true, variant: "error", title: "Validasi Gagal", message: "Tanggal mulai dan batas akhir pendaftaran harus diisi jika status pendaftaran dibuka!" });
      return;
    }

    try {
      const payload = {
        app_name: appName,
        school_name: schoolName,
        support_email: supportEmail,
        pkl_registration_status: registrationStatus,
        pkl_start_date: startDate,
        pkl_end_date: endDate,
        maintenance_mode: maintenanceMode ? "true" : "false",
        enable_notifications: enableNotifications ? "true" : "false",
      };

      await saveSettings(payload);

      setAlertInfo({ show: true, variant: "success", title: "Pengaturan Disimpan", message: "Semua pengaturan global sistem berhasil diperbarui." });
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Terjadi kesalahan saat menyimpan pengaturan." });
    }
  };

  return (
    <>
      <PageMeta title="Pengaturan Sistem | Admin PKL" description="Konfigurasi global aplikasi, periode pendaftaran, dan status sistem." />

      <div className="space-y-6">
        {alertInfo.show && <div className="animate-fade-in"><Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} /></div>}

        <PageHeader
          title="Pengaturan Global Sistem"
          description="Atur konfigurasi aplikasi, periode pelaksanaan PKL, dan mode pemeliharaan."
        />

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <div className="border-b border-gray-200 bg-brand-50 px-6 py-4 dark:border-gray-800 dark:bg-brand-900/20">
              <h3 className="text-lg font-bold text-brand-800 dark:text-brand-300 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Informasi Sekolah & Aplikasi
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nama Aplikasi</label>
                <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nama Sekolah</label>
                <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Email Bantuan (Helpdesk)</label>
                <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full sm:w-1/2 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
                <p className="mt-1.5 text-xs text-gray-500">Email ini akan ditampilkan jika siswa/guru mengalami kendala lupa password.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <div className="border-b border-gray-200 bg-blue-50 px-6 py-4 dark:border-gray-800 dark:bg-blue-900/20">
              <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                Pengaturan Notifikasi
              </h3>
            </div>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white/90">Notifikasi Sistem Global</h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-xl">
                  Kelola pengiriman notifikasi otomatis untuk setiap aktivitas pengguna (misal: pendaftaran & progres laporan). Menonaktifkan fitur ini akan mematikan seluruh layanan notifikasi pada sistem secara menyeluruh.
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" className="sr-only peer" checked={enableNotifications} onChange={(e) => setEnableNotifications(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className={`ml-3 text-sm font-bold ${enableNotifications ? "text-blue-600" : "text-gray-500"}`}>{enableNotifications ? "AKTIF" : "NONAKTIF"}</span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-error-200 bg-white dark:border-error-800/30 dark:bg-white/[0.03] overflow-hidden">
            <div className="border-b border-error-100 bg-error-50 px-6 py-4 dark:border-error-800/30 dark:bg-error-900/10">
              <h3 className="text-lg font-bold text-error-800 dark:text-error-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Zona Bahaya (Danger Zone)
              </h3>
            </div>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white/90">Mode Pemeliharaan (Maintenance Mode)</h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-xl">
                  Aktifkan ini jika Anda sedang melakukan perbaikan server. Seluruh pengguna selain Admin akan diarahkan ke halaman "Sedang Perbaikan".
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" className="sr-only peer" checked={maintenanceMode} onChange={(e) => handleMaintenanceToggle(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-error-300 dark:peer-focus:ring-error-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-error-600"></div>
                <span className={`ml-3 text-sm font-bold ${maintenanceMode ? "text-error-600" : "text-gray-500"}`}>{maintenanceMode ? "AKTIF" : "NONAKTIF"}</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-200 dark:border-gray-800 pt-6">
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-8 py-3 text-sm font-bold text-white shadow-theme-md hover:bg-brand-600 transition-colors focus:ring-4 focus:ring-brand-200 dark:focus:ring-brand-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Simpan Semua Pengaturan
            </button>
          </div>
        </form>
      </div>

      <Modal isOpen={isMaintenanceModalOpen} onClose={cancelMaintenanceToggle} className="max-w-[400px] p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white/90">Aktifkan Maintenance Mode?</h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Anda akan memblokir akses login bagi semua pengguna (Siswa, Pembimbing, Koordinator, dan Hubin). Fitur ini hanya dikhususkan saat perbaikan server. Apakah Anda yakin?</p>
        <div className="flex w-full items-center gap-3">
          <button onClick={cancelMaintenanceToggle} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Batal</button>
          <button onClick={confirmMaintenanceToggle} className="flex-1 rounded-lg bg-error-600 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-error-700 transition-colors">Ya, Aktifkan</button>
        </div>
      </Modal>
    </>
  );
}