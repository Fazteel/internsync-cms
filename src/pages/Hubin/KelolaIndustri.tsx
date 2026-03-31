import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useIndustryStore, Industry } from "../../store/useIndustryStore";
import { IndustryPayload } from "../../services/industryService";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function KelolaIndustri() {
  const { industries, isLoading, fetchIndustries, addIndustry, editIndustry, removeIndustry } = useIndustryStore();
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [hrName, setHrName] = useState("");
  const [hrPhone, setHrPhone] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [kuota, setKuota] = useState<number | "">("");
  const [status, setStatus] = useState<"Aktif" | "Tidak Aktif">("Aktif");
  const [mouFile, setMouFile] = useState<File | null>(null);

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchIndustries(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchIndustries]);

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const resetForm = () => {
    setName("");
    setAddress("");
    setHrName("");
    setHrPhone("");
    setHrEmail("");
    setKuota("");
    setStatus("Aktif");
    setMouFile(null);
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedIndustry(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (industry: Industry) => {
    setModalMode("edit");
    setSelectedIndustry(industry);
    setName(industry.name);
    setAddress(industry.address || "");
    setHrName(industry.hr_name);
    setHrPhone(industry.hr_phone || "");
    setHrEmail(industry.hr_email || "");
    setKuota(industry.kuota_siswa);
    setStatus(industry.is_active ? "Aktif" : "Tidak Aktif");
    setMouFile(null); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kuota || Number(kuota) < 1) {
       setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Kuota siswa minimal 1." });
       return;
    }

    const payload: IndustryPayload = {
      name,
      address,
      hr_name: hrName,
      hr_phone: hrPhone,
      hr_email: hrEmail,
      kuota_siswa: Number(kuota),
      is_active: status === "Aktif",
      mou_file: mouFile
    };

    try {
      if (modalMode === "add") {
        await addIndustry(payload);
        setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `Data industri "${name}" berhasil ditambahkan.` });
      } else if (selectedIndustry) {
        await editIndustry(selectedIndustry.id, payload);
        setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `Data industri "${name}" berhasil diperbarui.` });
      }
      fetchIndustries(searchTerm);
      handleCloseModal();
    } catch (err: unknown) {
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Gagal",
        message: (err as {
          response?: { data?: { message?: string } }
        }).response?.data?.message || "Terjadi kesalahan pada server."
      });
    }
  };

  const handleDeleteClick = (industry: Industry) => {
    setSelectedIndustry(industry);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedIndustry) return;
    try {
      await removeIndustry(selectedIndustry.id);
      setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `Data industri berhasil dihapus.` });
      fetchIndustries(searchTerm);
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Data gagal dihapus." });
    } finally {
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <PageMeta title="Kelola Industri | Sistem Manajemen PKL" description="Kelola daftar perusahaan mitra yang menjadi lokasi Praktik Kerja Lapangan." />

      <div className="space-y-6">
        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Kelola Mitra Industri</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Daftar perusahaan yang bekerja sama untuk program magang (PKL).</p>
          </div>
          <div>
            <button 
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-center font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Tambah Mitra Baru
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="mb-4 flex sm:w-80">
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                placeholder="Cari nama perusahaan atau kontak..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Nama Perusahaan</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Alamat Lengkap</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Kontak HR</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs whitespace-nowrap">Kuota</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs whitespace-nowrap">Dokumen</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs whitespace-nowrap">Status</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs whitespace-nowrap">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <TableRow><td className="py-8 text-center text-gray-500" colSpan={7}>Memuat data industri...</td></TableRow>
                ) : industries.length === 0 ? (
                  <TableRow><td className="py-8 text-center text-gray-500" colSpan={7}>Mitra industri tidak ditemukan.</td></TableRow>
                ) : (
                  industries.map((ind) => (
                    <TableRow key={ind.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                          </div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{ind.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        <p className="truncate max-w-[250px]">{ind.address || "-"}</p>
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm whitespace-nowrap">
                        <p className="font-medium text-gray-800 dark:text-white/90">{ind.hr_name}</p>
                        <p className="text-gray-500 mt-0.5 text-xs">{ind.hr_phone || "-"}</p>
                      </TableCell>
                      <TableCell className="py-4 text-center text-theme-sm text-gray-800 dark:text-white/90 whitespace-nowrap">
                        <span className="bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 px-2.5 py-1 rounded-full">{ind.kuota_siswa} Siswa</span>
                      </TableCell>
                      <TableCell className="py-4 text-center whitespace-nowrap">
                        {ind.mou_file ? (
                          <a href={`http://localhost:8000/storage/${ind.mou_file}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-accent-600 hover:text-accent-700 bg-accent-50 hover:bg-accent-100 px-2.5 py-1 rounded-full transition-colors dark:bg-accent-500/10 dark:text-accent-400 dark:hover:bg-accent-500/20">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                            Lihat MoU
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Tidak ada file</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-center whitespace-nowrap">
                        <Badge color={ind.is_active ? "success" : "error"}>{ind.is_active ? "Aktif" : "Tidak Aktif"}</Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenEditModal(ind)} className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors" title="Edit Data">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                          <button onClick={() => handleDeleteClick(ind)} className="p-1.5 text-gray-400 hover:text-error-500 transition-colors" title="Hapus Data">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
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

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-2xl overflow-hidden" showCloseButton={false}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
            {modalMode === "add" ? "Tambah Mitra Baru" : "Edit Data Mitra"}
          </h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nama Perusahaan <span className="text-error-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: PT. Teknologi Bangsa" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
            </div>
            
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Alamat Lengkap</label>
              <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Masukkan alamat lengkap..." className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white"></textarea>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nama HRD / Kontak <span className="text-error-500">*</span></label>
              <input type="text" value={hrName} onChange={(e) => setHrName(e.target.value)}placeholder="Nama lengkap PIC" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Email HRD</label>
              <input type="email" value={hrEmail} onChange={(e) => setHrEmail(e.target.value)} placeholder="email@perusahaan.com" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">No. Telepon/WA</label>
              <input type="text" value={hrPhone} onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setHrPhone(value);
              }} placeholder="Contoh: 0812..." className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Kuota Siswa PKL <span className="text-error-500">*</span></label>
              <input type="number" min="1" value={kuota} onChange={(e) => setKuota(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Jumlah Maksimal" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Upload Dokumen MoU (.pdf/.doc)</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setMouFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 dark:file:bg-brand-500/10 dark:file:text-brand-400 border border-gray-300 rounded-lg dark:border-gray-700" />
              {modalMode === "edit" && selectedIndustry?.mou_file && !mouFile && (
                <p className="mt-1 text-xs text-gray-500">Abaikan jika tidak ingin mengubah dokumen MoU saat ini.</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Status Kemitraan <span className="text-error-500">*</span></label>
              <div className="relative">
                <select value={status} onChange={(e) => setStatus(e.target.value as "Aktif" | "Tidak Aktif")} className="appearance-none w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white cursor-pointer" required>
                  <option value="Aktif" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Aktif (Menerima Peserta)</option>
                  <option value="Tidak Aktif" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Tidak Aktif (Penuh/Tutup)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={handleCloseModal} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Batal</button>
            <button type="submit" disabled={isLoading} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} className="max-w-[400px] p-6 text-center" showCloseButton={false}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white/90">Hapus Data Industri?</h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Apakah Anda yakin ingin menghapus <strong>{selectedIndustry?.name}</strong>? Data yang dihapus tidak dapat dikembalikan.
        </p>
        <div className="flex w-full items-center gap-3">
          <button onClick={() => setIsConfirmOpen(false)} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Batal</button>
          <button onClick={confirmDelete} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition-colors bg-error-500 hover:bg-error-600">Ya, Hapus</button>
        </div>
      </Modal>
    </>
  );
}