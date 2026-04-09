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

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function UserManagement() {
  const { users, isLoading, fetchUsers, addUser, editUser, removeUser, importExcel, resendActivationEmail } = useUserStore();
  const { majors, classrooms, academicYears, fetchMajors, fetchClassrooms, fetchAcademicYears } = useMasterStore();

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
  const [academicYearId, setAcademicYearId] = useState<string | number>("");
  const [signature, setSignature] = useState<File | null>(null);
  const [existingSignature, setExistingSignature] = useState<string | null>(null);

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(searchTerm, "All");
      fetchMajors();
      fetchClassrooms();
      fetchAcademicYears();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchUsers, fetchMajors, fetchClassrooms, fetchAcademicYears]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAlertInfo({ show: true, variant: "info", title: "Memproses...", message: `Sedang mengimpor data dari ${file.name}...` });

    try {
      const result = await importExcel(file);
      if (result.failed > 0) {
        setAlertInfo({
          show: true,
          variant: "warning",
          title: "Import Selesai dengan Catatan",
          message: `${result.success} data berhasil, ${result.failed} data gagal (cek format atau data master).`
        });
      } else {
        setAlertInfo({
          show: true,
          variant: "success",
          title: "Berhasil",
          message: `Semua data (${result.success}) dari ${file.name} berhasil diimpor.`
        });
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Gagal Import",
        message: error.response?.data?.message || "File tidak valid atau terjadi kesalahan server."
      });
    }
    e.target.value = "";
  };

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
    setAcademicYearId("");
    setSignature(null);
    setExistingSignature(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setModalMode("edit");
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setIdentifier(user.identifier);
    setRole(user.role);
    setStatus(user.status);
    setJurusan(user.jurusan || "");
    setKelas(user.kelas || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");
    setAcademicYearId(user.academic_year_id || "");
    setSignature(null);
    setExistingSignature(user.signature_url || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UserPayload = {
      name, email, identifier, role, status,
      jurusan, kelas, phone, address,
      academic_year_id: role === "Siswa" ? academicYearId : undefined,
      signature: role !== "Siswa" ? signature : undefined
    };

    try {
      if (modalMode === "add") {
        await addUser(payload);
        setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `Akun ${name} ditambahkan.` });
      } else if (selectedUser) {
        await editUser(selectedUser.profile_id, payload);
        setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `Data ${name} diperbarui.` });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const error = err as ApiError;
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: error.response?.data?.message || "Error sistem." });
    }
  };

  const handleResendEmail = async (user: UserAccount) => {
    setSendingEmailId(user.id);
    try {
      await resendActivationEmail(user.id);
      setAlertInfo({ show: true, variant: "success", title: "Email Terkirim", message: `Link aktivasi terkirim ke ${user.name}.` });
    } catch (err: unknown) {
      const error = err as ApiError;
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: error.response?.data?.message || "Gagal mengirim email." });
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleOpenConfirm = (user: UserAccount) => {
    setSelectedUser(user);
    setIsConfirmModalOpen(true);
  };

  const executeConfirmAction = async () => {
    if (!selectedUser) return;
    try {
      await removeUser(selectedUser.profile_id, selectedUser.role);
      setAlertInfo({ show: true, variant: "success", title: "Terhapus", message: `Akun ${selectedUser.name} dihapus.` });
      setIsConfirmModalOpen(false);
    } catch (err: unknown) {
      const error = err as ApiError;
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: error.response?.data?.message || "Error sistem saat menghapus." });
    }
  };

  const selectedMajorObj = majors.find(m => m.kode === jurusan);
  const filteredClassrooms = selectedMajorObj ? classrooms.filter(c => c.major_id === selectedMajorObj.id) : [];

  return (
    <>
      <PageMeta title="Kelola Pengguna | InternSync" description="Manajemen Siswa dan Guru." />

      <div className="space-y-6">
        {alertInfo.show && <div className="animate-fade-in"><Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} /></div>}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Manajemen Pengguna</h2>
            <p className="text-sm text-gray-500">Kelola data {activeTab === "siswa" ? "Siswa" : "Guru/Staff"} dan hak akses sistem.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors cursor-pointer">
              <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Import Excel
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={handleOpenAddModal} className="bg-brand-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600 transition-all shadow-sm">
              + Tambah {activeTab === "siswa" ? "Siswa" : "Guru/Staff"}
            </button>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b px-4 pt-2">
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("siswa")} className={`py-3.5 px-6 text-sm font-medium border-b-2 transition-all ${activeTab === "siswa" ? "border-brand-500 text-brand-700" : "border-transparent text-gray-500"}`}>Data Siswa</button>
              <button onClick={() => setActiveTab("guru")} className={`py-3.5 px-6 text-sm font-medium border-b-2 transition-all ${activeTab === "guru" ? "border-brand-500 text-brand-700" : "border-transparent text-gray-500"}`}>Data Guru & Staff</button>
            </div>
            <div className="relative w-full sm:w-[300px] mb-2 sm:mb-0">
              <input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-gray-200 py-2 pl-4 pr-4 text-sm outline-none focus:border-brand-500" />
            </div>
          </div>

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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-2xl overflow-hidden" showCloseButton={false} >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">
            {modalMode === "add" ? "Tambah Baru" : "Edit Data"}
          </h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700" >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar" >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">
                Nama Lengkap <span className="text-error-500">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Email <span className="text-error-500">*</span>
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {role === "Siswa" ? "NIS" : "NIP"} <span className="text-error-500">*</span>
              </label>
              <input type="text" value={identifier}  onChange={(e) => setIdentifier(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Role Akses <span className="text-error-500">*</span>
              </label>
              <SelectInput value={role} onChange={(val) => setRole(val)}>
                {activeTab === "siswa" ? (
                  <option value="Siswa">Siswa</option>
                ) : (
                  <>
                    <option value="Pembimbing">Pembimbing</option>
                    <option value="Koordinator">Koordinator</option>
                    <option value="Hubin">Hubin</option>
                  </>
                )}
              </SelectInput>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                No. Telepon
              </label>
              <input   type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
            </div>

            {role === "Siswa" && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Jurusan <span className="text-error-500">*</span>
                  </label>
                  <SelectInput value={jurusan}  onChange={(val) => { setJurusan(val); setKelas(""); }}
                    required
                  >
                    <option value="">Pilih Jurusan</option>
                    {majors.map(m => (
                      <option key={m.id} value={m.kode}>{m.kode}</option>
                    ))}
                  </SelectInput>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Kelas <span className="text-error-500">*</span>
                  </label>
                  <SelectInput value={kelas} onChange={(val) => setKelas(val)} disabled={!jurusan}
                    required
                  >
                    <option value="">Pilih Kelas</option>
                    {filteredClassrooms.map(c => (
                      <option key={c.id} value={c.nama}>{c.nama}</option>
                    ))}
                  </SelectInput>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">
                    Tahun Ajaran <span className="text-error-500">*</span>
                  </label>
                  <SelectInput value={academicYearId} onChange={(val) => setAcademicYearId(val)}
                    required
                  >
                    <option value="">Pilih Tahun Ajaran</option>
                    {academicYears.map(y => (
                      <option key={y.id} value={y.id}>
                        {y.tahun} - {y.semester}
                      </option>
                    ))}
                  </SelectInput>
                </div>
              </>
            )}

            {role !== "Siswa" && (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Tanda Tangan Digital (Opsional)
                </label>

                {modalMode === "edit" && existingSignature && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Tanda Tangan Saat Ini:</p>
                    <div className="p-2 border border-gray-200 rounded-lg bg-gray-50 inline-block shadow-sm">
                      <img 
                        src={existingSignature} 
                        alt="TTD Guru" 
                        className="h-16 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                      />
                    </div>
                  </div>
                )}

                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={(e) => setSignature(e.target.files?.[0] || null)} 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-600 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
                />
                <p className="mt-1.5 text-[11px] text-gray-400">
                  Format: JPG, PNG. {modalMode === 'edit' ? 'Biarkan kosong jika tidak ingin mengubah tanda tangan lama.' : ''}
                </p>
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">
                Alamat Lengkap
              </label>
              <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">
                Status Akun
              </label>
              <SelectInput value={status} onChange={(val) => setStatus(val)}>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </SelectInput>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={handleCloseModal}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              Batal
            </button>

            <button type="submit" className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 shadow-sm"
            >
              Simpan Perubahan
            </button>
          </div>

        </form>
      </Modal>

      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} className="max-w-[400px] p-6 text-center">
        <h3 className="text-lg font-bold mb-4 text-error-600">Hapus Akun?</h3>
        <p className="text-sm text-gray-500 mb-6">Yakin ingin menghapus {selectedUser?.name}? Semua data terkait (Student/Teacher) akan ikut terhapus.</p>
        <div className="flex gap-3">
          <button onClick={() => setIsConfirmModalOpen(false)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
          <button onClick={executeConfirmAction} className="flex-1 bg-error-500 text-white py-2 rounded-lg hover:bg-error-600 transition-colors shadow-sm">Ya, Hapus</button>
        </div>
      </Modal>
    </>
  );
}