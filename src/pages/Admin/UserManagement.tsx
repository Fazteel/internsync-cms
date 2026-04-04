import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index"; 
import { useUserStore, UserAccount } from "../../store/Admin/useUserStore";
import { useMasterStore } from "../../store/Admin/useMasterStore";
import { UserPayload } from "../../services/Admin/userService";
import UserTable from "../../components/table/UserTable";
import { SelectInput } from "../../components/common/SharedUI";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

interface ImportResponse {
  success?: number;
  failed?: number;
  message?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function UserManagement() {
  const { users, isLoading, fetchUsers, addUser, editUser, removeUser, importExcel, resendActivationEmail } = useUserStore();
  const { majors, classrooms, fetchMajors, fetchClassrooms } = useMasterStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"siswa" | "guru">("siswa");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState("Siswa");
  const [status, setStatus] = useState("Aktif");
  const [jurusan, setJurusan] = useState("");
  const [kelas, setKelas] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(searchTerm, "All"); 
      fetchMajors();
      fetchClassrooms();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchUsers, fetchMajors, fetchClassrooms]);

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const displayedUsers = users.filter((user) => {
    if (activeTab === "siswa") return user.role === "Siswa";
    return user.role !== "Siswa";
  });

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedUser(null);
    setName("");
    setEmail("");
    setIdentifier("");
    setPhone("");
    setAddress("");
    setRole(activeTab === "siswa" ? "Siswa" : "Pembimbing"); 
    setStatus("Aktif");
    setJurusan("");
    setKelas("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setModalMode("edit");
    setSelectedUser(user);
    setName(user.name);
    setEmail((user as UserAccount & { email?: string }).email || "");
    setIdentifier(user.identifier || "");
    setRole(user.role);
    setStatus(user.status);
    setJurusan(user.jurusan || "");
    setKelas((user as UserAccount & { kelas?: string }).kelas || "");
    setPhone((user as UserAccount & { phone?: string }).phone || "");
    setAddress((user as UserAccount & { address?: string }).address || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, email, identifier, role, status, jurusan, kelas, phone, address } as unknown as UserPayload;

    try {
      if (modalMode === "add") {
        await addUser(payload);
        setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `Akun ${name} berhasil ditambahkan.` });
      } else if (selectedUser) {
        await editUser(selectedUser.id, payload);
        setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `Data akun ${name} berhasil diperbarui.` });
      }
      fetchUsers(searchTerm, "All");
    } catch (err: unknown) {
      const error = err as ApiError;
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: error.response?.data?.message || "Terjadi kesalahan pada server." });
    } finally {
      handleCloseModal();
    }
  };

  const handleOpenConfirm = (user: UserAccount) => {
    setSelectedUser(user);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirm = () => setIsConfirmModalOpen(false);

  const executeConfirmAction = async () => {
    if (!selectedUser) return;
    try {
      await removeUser(selectedUser.id);
      setAlertInfo({ show: true, variant: "success", title: "Akun Dihapus", message: `Akun ${selectedUser.name} berhasil dihapus.` });
      fetchUsers(searchTerm, "All");
    } catch (err: unknown) {
      const error = err as ApiError;
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: error.response?.data?.message || "Aksi gagal diproses sistem." });
    } finally {
      handleCloseConfirm();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setAlertInfo({ show: true, variant: "info", title: "Memproses...", message: `Sedang mengimpor data dari ${file.name}...` });

      try {
        const response = (await importExcel(file)) as unknown as ImportResponse;
        const success = response?.success || 0;
        const failed = response?.failed || 0;

        if (failed > 0) {
          setAlertInfo({ show: true, variant: "warning", title: "Import Selesai dengan Catatan", message: `${success} data berhasil diimpor, ${failed} data gagal karena format salah atau data kelas/jurusan tidak sesuai.` });
        } else {
          setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `${success} data dari ${file.name} berhasil diimpor ke sistem.` });
        }
        fetchUsers(searchTerm, "All");
      } catch (err: unknown) {
        const error = err as ApiError;
        setAlertInfo({ show: true, variant: "error", title: "Gagal Import", message: error.response?.data?.message || "File gagal diproses, pastikan format sesuai." });
      }
      e.target.value = "";
  };

  const handleResendEmail = async (user: UserAccount) => {
    setSendingEmailId(user.id);
    try {
      if (resendActivationEmail) {
        await resendActivationEmail(user.id);
        setAlertInfo({ show: true, variant: "success", title: "Email Terkirim", message: `Link aktivasi baru berhasil dikirim ke email ${user.name}.` });
      } else {
        setAlertInfo({ show: true, variant: "error", title: "Error", message: "Fungsi resendActivationEmail belum ditambahin ke store!" });
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      setAlertInfo({ show: true, variant: "error", title: "Gagal Mengirim", message: error.response?.data?.message || "Gagal mengirim email aktivasi." });
    } finally {
      setSendingEmailId(null);
    }
  };

  const selectedMajorObj = majors.find(m => m.kode === jurusan);
  const filteredClassrooms = selectedMajorObj ? classrooms.filter(c => c.major_id === selectedMajorObj.id) : [];

  return (
    <>
      <PageMeta title="Kelola Pengguna | Sistem Manajemen PKL" description="Manajemen akun akses untuk Siswa, Guru, Koordinator, dan Hubin." />

      <div className="space-y-6">
        {alertInfo.show && <div className="animate-fade-in"><Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} /></div>}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Kelola Pengguna Sistem</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Atur hak akses, tambah akun baru, dan kelola pengguna.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
              <svg className="w-5 h-5 text-accent-500 group-hover:text-accent-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Import Excel
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={handleOpenAddModal} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Tambah Pengguna
            </button>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 px-4 pt-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("siswa")}
                className={`py-3.5 px-6 font-medium text-sm border-b-2 transition-colors focus:outline-none ${activeTab === "siswa" ? "border-brand-500 text-brand-700 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"}`}
              >
                Data Siswa
              </button>
              <button
                onClick={() => setActiveTab("guru")}
                className={`py-3.5 px-6 font-medium text-sm border-b-2 transition-colors focus:outline-none ${activeTab === "guru" ? "border-brand-500 text-brand-700 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"}`}
              >
                Data Guru & Staff
              </button>
            </div>

            <div className="relative w-full sm:w-[300px] mb-2 sm:mb-0">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Cari Nama, Email, NIS/NIP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800/50 dark:focus:bg-gray-900 dark:text-white transition-all" />
            </div>

          </div>

          <div className="px-0 sm:px-0"> 
            <UserTable 
              users={displayedUsers} 
              isLoading={isLoading} 
              sendingEmailId={sendingEmailId} 
              onResendEmail={handleResendEmail} 
              onEdit={handleOpenEditModal} 
              onDelete={handleOpenConfirm} 
            />
          </div>
          
        </div>

      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-[700px] p-6 lg:p-10">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-6">
          {modalMode === "add" ? "Tambah Pengguna Baru" : "Edit Data Pengguna"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nama Lengkap <span className="text-error-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama pengguna..." className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Email Valid (Buat Login) <span className="text-error-500">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">No. Telepon</label>
              <input type="text" value={phone} onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setPhone(value)
              }} placeholder="Contoh: 08123456789" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" />
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Kota/Kabupaten</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Contoh: Karawang, Jawa Barat" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">NIS / NIP / ID Khusus <span className="text-error-500">*</span></label>
              <input type="text" value={identifier} onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setIdentifier(value)
              }} placeholder="Masukkan NIS atau NIP..." className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Role Akses <span className="text-error-500">*</span></label>
              <div className="relative">
                <SelectInput
                  value={role}
                  onChange={(val) => setRole(val)}
                  required>
                  <option value="Siswa">Siswa</option>
                  <option value="Pembimbing">Pembimbing</option>
                  <option value="Koordinator">Koordinator</option>
                  <option value="Hubin">Hubin</option>
                </SelectInput>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
              </div>
            </div>

            {role === "Siswa" && (
              <>
                <div className="animate-fade-in">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Jurusan Siswa <span className="text-error-500">*</span></label>
                  <div className="relative">
                    <SelectInput
                      value={jurusan}
                      onChange={(val) => {
                        setJurusan(val);
                        setKelas("");
                      }} required>
                      <option value="" disabled> Pilih Jurusan </option>
                      {majors.map((item) => (<option key={item.id} value={item.kode}>{item.kode} - {item.nama}</option>))}
                    </SelectInput>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                  </div>
                </div>
                <div className="animate-fade-in">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Kelas <span className="text-error-500">*</span></label>
                  <div className="relative">
                    <SelectInput
                      value={kelas}
                      onChange={(val) => setKelas(val)}
                      disabled={!jurusan}
                      required>
                      <option value="" disabled>{!jurusan ? "Pilih Jurusan Terlebih Dahulu" : "Pilih Kelas"}</option>
                      {filteredClassrooms.map((item) => (<option key={item.id} value={item.nama}>{item.nama}</option>))}
                    </SelectInput>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                  </div>
                </div>
              </>
            )}

            {modalMode === "edit" && (
              <div className="animate-fade-in sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Status Akun <span className="text-error-500">*</span></label>
                <div className="relative">
                  <SelectInput
                    value={status}
                    onChange={(val) => setStatus(val)}
                    required>
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </SelectInput>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                </div>
              </div>
            )}
          </div>
          
          {modalMode === "add" && (
            <div className="mt-4 rounded-lg bg-accent-50 p-3 border border-accent-200 dark:bg-accent-500/10 dark:border-accent-500/20">
              <p className="text-xs text-accent-700 dark:text-accent-400"><strong>Informasi:</strong> Akun yang ditambahkan akan otomatis dikirimkan email aktivasi ke alamat yang terdaftar.</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={handleCloseModal} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Batal</button>
            <button type="submit" className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-theme-xs">Simpan Akun</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isConfirmModalOpen} onClose={handleCloseConfirm} className="max-w-[400px] p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white/90">Hapus Akun?</h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus akun {selectedUser?.name} secara permanen?
        </p>
        <div className="flex w-full items-center gap-3">
          <button onClick={handleCloseConfirm} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Batal</button>
          <button onClick={executeConfirmAction} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition-colors bg-error-500 hover:bg-error-600">Ya, Hapus</button>
        </div>
      </Modal>
    </>
  );
}