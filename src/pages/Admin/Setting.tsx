import React, { useState, useEffect, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE OLD ---
  const [appName, setAppName] = useState("Sistem Manajemen PKL (InternSync)");
  const [schoolName, setSchoolName] = useState("SMK PGRI Telagasari");
  const [supportEmail, setSupportEmail] = useState("admin@smkpgritelagasari.sch.id");
  const [registrationStatus, setRegistrationStatus] = useState<"Buka" | "Tutup">("Buka");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);

  // --- STATE BARU (KOP & INFO SEKOLAH) ---
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [yayasanName, setYayasanName] = useState("");
  const [npsn, setNpsn] = useState("");
  const [nss, setNss] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolWebsite, setSchoolWebsite] = useState("");
  const [accreditation, setAccreditation] = useState("");

  // --- STATE UI ---
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [pendingMaintenanceState, setPendingMaintenanceState] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });
  const [isInitialized, setIsInitialized] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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

      setSchoolLogo(settings.school_logo || null);
      setLogoPreview(settings.school_logo || null); 
      setYayasanName(settings.yayasan_name || "");
      setNpsn(settings.npsn || "");
      setNss(settings.nss || "");
      setSchoolAddress(settings.school_address || "");
      setSchoolPhone(settings.school_phone || "");
      setSchoolWebsite(settings.school_website || "");
      setAccreditation(settings.accreditation || "");

      setIsInitialized(true);
    }
  }, [settings, isInitialized]);

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAlertInfo({ show: true, variant: "error", title: "File Tidak Valid", message: "Gunakan file gambar (PNG, JPG, JPEG)." });
      if (fileInputRef.current) fileInputRef.current.value = ""; 
      return;
    }

    if (file.size > 1024 * 1024) {
      setAlertInfo({ show: true, variant: "error", title: "File Terlalu Besar", message: "Ukuran logo maksimal 1MB." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSchoolLogo(base64String); 
      setLogoPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSchoolLogo("")
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMaintenanceToggle = (checked: boolean) => {
    if (checked) {
      setPendingMaintenanceState(true);
      setIsMaintenanceModalOpen(true);
    } else {
      setMaintenanceMode(false);
      setAlertInfo({ show: true, variant: "info", title: "Maintenance Dinonaktifkan", message: "Sistem telah kembali beroperasi secara normal." });
    }
  };

  const confirmMaintenanceToggle = () => {
    setMaintenanceMode(pendingMaintenanceState);
    setIsMaintenanceModalOpen(false);
    setAlertInfo({ show: true, variant: "warning", title: "Mode Maintenance Aktif", message: "Hanya Admin yang dapat mengakses sistem saat ini." });
  };

  const cancelMaintenanceToggle = () => setIsMaintenanceModalOpen(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        app_name: appName,
        school_name: schoolName,
        support_email: supportEmail, 
        school_logo: schoolLogo || "",
        yayasan_name: yayasanName,
        npsn: npsn,
        nss: nss,
        school_address: schoolAddress,
        school_phone: schoolPhone,
        school_website: schoolWebsite,
        accreditation: accreditation,
        pkl_registration_status: registrationStatus,
        pkl_start_date: startDate,
        pkl_end_date: endDate,
        maintenance_mode: maintenanceMode ? "true" : "false",
        enable_notifications: enableNotifications ? "true" : "false",
      };

      await saveSettings(payload);

      setAlertInfo({ show: true, variant: "success", title: "Pengaturan Disimpan", message: "Seluruh konfigurasi sistem berhasil diperbarui." });
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Terjadi kesalahan saat menyimpan pengaturan." });
    }
  };

  return (
    <>
      <PageMeta title="Pengaturan Sistem | Admin PKL" description="Konfigurasi global aplikasi dan data sekolah." />

      <div className="space-y-6">
        {alertInfo.show && <div className="animate-fade-in"><Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} /></div>}

        <PageHeader
          title="Pengaturan Global Sistem"
          description="Atur identitas sekolah untuk KOP Surat, aplikasi, dan mode sistem."
        />

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* --- SECTION 1: INFORMASI SEKOLAH & KOP (BANYAK TAMBAHAN) --- */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <div className="border-b border-gray-200 bg-brand-50 px-6 py-4 dark:border-gray-800 dark:bg-brand-900/20">
              <h3 className="text-lg font-bold text-brand-800 dark:text-brand-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Identitas Sekolah & KOP Surat
              </h3>
            </div>
            <div className="p-6 space-y-6">
              
              {/* Logika Tampilan Logo */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center justify-center w-24 h-24 border-2 border-gray-200 border-dashed rounded-xl bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 overflow-hidden flex-shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Sekolah" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Logo Sekolah (KOP)</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      Pilih Gambar
                    </button>
                    {logoPreview && (
                      <button type="button" onClick={handleRemoveLogo} className="text-xs font-semibold text-error-600 hover:text-error-700 dark:text-error-400">Hapus</button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Maksimal 1MB. Format: PNG, JPG.</p>
                  <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="sr-only" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {/* Input Fields */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nama Aplikasi</label>
                  <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
                </div>
                
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nama Yayasan</label>
                  <input type="text" value={yayasanName} onChange={(e) => setYayasanName(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" placeholder="Masukan nama yayasan jika ada" />
                </div>
                
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nama Sekolah</label>
                  <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">NPSN</label>
                        <input type="text" value={npsn} onChange={(e) => setNpsn(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">NSS</label>
                        <input type="text" value={nss} onChange={(e) => setNss(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" />
                    </div>
                    {/* INPUT AKREDITASI */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Akreditasi</label>
                        <input type="text" value={accreditation} onChange={(e) => setAccreditation(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" placeholder="Misal: A" />
                    </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nomor Telepon</label>
                  <input type="text" value={schoolPhone} onChange={(e) => setSchoolPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Alamat Lengkap Sekolah (Untuk KOP)</label>
                  <textarea value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" placeholder="Jl. Raya... Kec... Kab..."></textarea>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Website Sekolah</label>
                  <input type="text" value={schoolWebsite} onChange={(e) => setSchoolWebsite(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" placeholder="www.sekolah.sch.id" />
                </div>
                
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Email (Bantuan & KOP)</label>
                  <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
                </div>
              </div>
            </div>
          </div>

          {/* --- SECTION 2: NOTIFIKASI --- */}
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
                  Kelola pengiriman notifikasi otomatis untuk setiap aktivitas pengguna.
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" className="sr-only peer" checked={enableNotifications} onChange={(e) => setEnableNotifications(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className={`ml-3 text-sm font-bold ${enableNotifications ? "text-blue-600" : "text-gray-500"}`}>{enableNotifications ? "AKTIF" : "NONAKTIF"}</span>
              </label>
            </div>
          </div>

          {/* --- SECTION 3: DANGER ZONE --- */}
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
                  Aktifkan ini jika Anda sedang melakukan perbaikan server. Pengguna selain Admin akan diblokir.
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" className="sr-only peer" checked={maintenanceMode} onChange={(e) => handleMaintenanceToggle(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-error-300 dark:peer-focus:ring-error-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-error-600"></div>
                <span className={`ml-3 text-sm font-bold ${maintenanceMode ? "text-error-600" : "text-gray-500"}`}>{maintenanceMode ? "AKTIF" : "NONAKTIF"}</span>
              </label>
            </div>
          </div>

          {/* Tombol Submit */}
          <div className="flex justify-end border-t border-gray-200 dark:border-gray-800 pt-6">
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-8 py-3 text-sm font-bold text-white shadow-theme-md hover:bg-brand-600 transition-colors focus:ring-4 focus:ring-brand-200 dark:focus:ring-brand-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Simpan Semua Pengaturan
            </button>
          </div>
        </form>
      </div>

      {/* Modal Maintenance */}
      <Modal isOpen={isMaintenanceModalOpen} onClose={cancelMaintenanceToggle} className="max-w-[400px] p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white/90">Aktifkan Maintenance Mode?</h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Anda akan memblokir akses login bagi semua pengguna selain Admin. Apakah Anda yakin?</p>
        <div className="flex w-full items-center gap-3">
          <button onClick={cancelMaintenanceToggle} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Batal</button>
          <button onClick={confirmMaintenanceToggle} className="flex-1 rounded-lg bg-error-600 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-error-700 transition-colors">Ya, Aktifkan</button>
        </div>
      </Modal>
    </>
  );
}