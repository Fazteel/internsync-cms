import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useUserStore, UserAccount } from "../../store/Admin/useUserStore";
import { useMasterStore } from "../../store/Admin/useMasterStore";
import { UserPayload } from "../../services/Admin/userService";
import MasterDataImport from "../../components/common/MasterDataImport";
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
  const { users, isLoading, fetchUsers, addUser, editUser, removeUser, importExcel, sendResetPasswordEmail } = useUserStore();
  const { majors, classrooms, academicYears, fetchMajors, fetchClassrooms, fetchAcademicYears } = useMasterStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"siswa" | "guru">("siswa");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // States for filtering and pagination
  const [filterJurusan, setFilterJurusan] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset pagination on search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reset filters and pagination when active tab changes
  useEffect(() => {
    setCurrentPage(1);
    setFilterJurusan("");
    setFilterKelas("");
    setFilterRole("");
    setFilterStatus("");
  }, [activeTab]);

  const filteredUsers = users.filter((user) => {
    if (activeTab === "siswa") {
      if (user.role !== "Siswa") return false;
      if (filterJurusan && user.jurusan !== filterJurusan) return false;
      if (filterKelas && user.kelas !== filterKelas) return false;
    } else {
      if (user.role === "Siswa") return false;
      if (filterRole && user.role !== filterRole) return false;
    }

    if (filterStatus && user.status !== filterStatus) return false;

    return true;
  });

  const totalFilteredUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalFilteredUsers / rowsPerPage);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));

  const startIndex = (activePage - 1) * rowsPerPage;
  const endIndex = rowsPerPage === 999999 ? totalFilteredUsers : startIndex + rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);



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

  const handleSendResetPasswordEmail = async (user: UserAccount) => {
    setSendingEmailId(user.id);
    try {
      await sendResetPasswordEmail(user.id);
      setAlertInfo({ show: true, variant: "success", title: "Email Terkirim", message: `Link set password terkirim ke email ${user.name}.` });
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
            <a 
              href="/templates/template_users.xlsx" 
              download="template_users.xlsx"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors cursor-pointer group"
            >
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Template
            </a>
            <MasterDataImport
              onImport={importExcel}
              onImportSuccess={fetchUsers}
            />
            <button onClick={handleOpenAddModal} className="bg-brand-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600 transition-all shadow-sm">
              + Tambah {activeTab === "siswa" ? "Siswa" : "Guru/Staff"}
            </button>
          </div>
        </div>

        {/* Info Banner Default Password */}
        <div className="flex items-start sm:items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl dark:bg-blue-500/10 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm shadow-sm transition-all">
          <svg className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-relaxed">
            <strong>Informasi:</strong> Password default untuk semua data pengguna baru adalah <code className="bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded font-mono font-bold text-xs">12345678</code>
          </span>
        </div>

        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b px-4 pt-2">
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("siswa")} className={`py-3.5 px-6 text-sm font-medium border-b-2 transition-all ${activeTab === "siswa" ? "border-brand-500 text-brand-700" : "border-transparent text-gray-500"}`}>Data Siswa</button>
              <button onClick={() => setActiveTab("guru")} className={`py-3.5 px-6 text-sm font-medium border-b-2 transition-all ${activeTab === "guru" ? "border-brand-500 text-brand-700" : "border-transparent text-gray-500"}`}>Data Guru & Staff</button>
            </div>
            <div className="relative w-full sm:w-[300px] mb-2 sm:mb-0">
              <input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-gray-200 py-2 pl-4 pr-4 text-sm outline-none focus:border-brand-500 font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-white" />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 px-6 py-3.5 bg-gray-50/50 border-b border-gray-150 dark:bg-white/[0.01] dark:border-gray-850">
            {activeTab === "siswa" ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Jurusan:</span>
                  <select
                    value={filterJurusan}
                    onChange={(e) => {
                      setFilterJurusan(e.target.value);
                      setFilterKelas(""); // Reset kelas filter when jurusan changes
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <option value="">Semua Jurusan</option>
                    {majors.map(m => (
                      <option key={m.id} value={m.kode}>{m.kode}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Kelas:</span>
                  <select
                    value={filterKelas}
                    onChange={(e) => {
                      setFilterKelas(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <option value="">Semua Kelas</option>
                    {classrooms
                      .filter(c => !filterJurusan || c.major_id === majors.find(m => m.kode === filterJurusan)?.id)
                      .map(c => (
                        <option key={c.id} value={c.nama}>{c.nama}</option>
                      ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Role:</span>
                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <option value="">Semua Role</option>
                  <option value="Pembimbing">Pembimbing</option>
                  <option value="Koordinator">Koordinator</option>
                  <option value="Hubin">Hubin</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <UserTable
            users={paginatedUsers}
            isLoading={isLoading}
            sendingEmailId={sendingEmailId}
            onSendResetPassword={handleSendResetPasswordEmail}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenConfirm}
          />

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 px-6 py-4 bg-gray-50/50 dark:border-gray-800 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Tampilkan:</span>
              <select
                value={rowsPerPage === 999999 ? "all" : rowsPerPage.toString()}
                onChange={(e) => {
                  const val = e.target.value;
                  setRowsPerPage(val === "all" ? 999999 : Number(val));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="all">Semua</option>
              </select>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Menampilkan {totalFilteredUsers > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, totalFilteredUsers)} dari {totalFilteredUsers} data
              </span>
            </div>

            {rowsPerPage !== 999999 && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  Sebelumnya
                </button>
                <span className="text-xs font-bold text-gray-800 dark:text-white/90">
                  Halaman {activePage} dari {totalPages}
                </span>
                <button
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
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