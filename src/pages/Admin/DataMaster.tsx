import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useMasterStore, Jurusan, TahunAjaran, Kelas } from "../../store/Admin/useMasterStore";
import { PageHeader, SelectInput, TablePagination, TableTopControls } from "../../components/common/SharedUI";

type AlertVariant = "success" | "warning" | "info" | "error";
interface AlertInfo { show: boolean; variant: AlertVariant; title: string; message: string; }
type TabType = "jurusan" | "tahun-ajaran";
type EntityType = "jurusan" | "tahun-ajaran" | "kelas";
type MasterData = Jurusan | TahunAjaran | Kelas;

export default function DataMaster() {
  const {
    majors, academicYears, classrooms,
    fetchMajors, fetchAcademicYears, fetchClassrooms,
    addMajor, editMajor, removeMajor,
    addAcademicYear, editAcademicYear, removeAcademicYear,
    addClassroom, editClassroom, removeClassroom, importExcel
  } = useMasterStore();

  const [activeTab, setActiveTab] = useState<TabType>("jurusan");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMajors, setExpandedMajors] = useState<number[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [entityType, setEntityType] = useState<EntityType>("jurusan");

  const [selectedData, setSelectedData] = useState<MasterData | null>(null);
  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState<{ id: number, type: EntityType, name: string } | null>(null);

  const [formInput1, setFormInput1] = useState("");
  const [formInput2, setFormInput2] = useState("");
  const [status, setStatus] = useState<"Aktif" | "Nonaktif">("Aktif");

  const [tingkatKelas, setTingkatKelas] = useState("X");
  const [kelompokKelas, setKelompokKelas] = useState("1");

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  useEffect(() => {
    fetchMajors();
    fetchAcademicYears();
    fetchClassrooms();
  }, [fetchMajors, fetchAcademicYears, fetchClassrooms]);

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const toggleExpand = (id: number) => {
    setExpandedMajors(prev => prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]);
  };

  const handleOpenModal = (mode: "add" | "edit", entity: EntityType, data: MasterData | null = null, parentId: number | null = null) => {
    setModalMode(mode);
    setEntityType(entity);
    setSelectedData(data);
    setSelectedMajorId(parentId);

    if (mode === "edit" && data) {
      if (entity === "jurusan") {
        const j = data as Jurusan; setFormInput1(j.kode); setFormInput2(j.nama);
      } else if (entity === "tahun-ajaran") {
        const t = data as TahunAjaran; setFormInput1(t.tahun); setFormInput2(t.semester);
      } else if (entity === "kelas") {
        const k = data as Kelas;
        const major = majors.find(m => m.id === k.major_id);
        const majorCode = major ? major.kode : "";
        let extTingkat = "X";
        let extKelompok = "1";

        if (majorCode && k.nama.includes(majorCode)) {
          const parts = k.nama.split(majorCode);
          extTingkat = parts[0].trim() || "X";
          extKelompok = parts[1].trim() || "1";
        } else {
          extKelompok = k.nama;
        }

        setTingkatKelas(extTingkat);
        setKelompokKelas(extKelompok);
        setSelectedMajorId(k.major_id);
      }
      setStatus(data.status);
    } else {
      const currentYear = new Date().getFullYear();
      setFormInput1(entity === "tahun-ajaran" ? `${currentYear}/${currentYear + 1}` : "");
      setFormInput2(entity === "tahun-ajaran" ? "Ganjil" : "");
      setTingkatKelas("X");
      setKelompokKelas("1");
      setStatus("Aktif");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenDelete = (id: number, type: EntityType, name: string) => {
    setDataToDelete({ id, type, name });
    setIsConfirmModalOpen(true);
  };

  const executeDelete = async () => {
    if (!dataToDelete) return;
    try {
      if (dataToDelete.type === "jurusan") {
        await removeMajor(dataToDelete.id);
        fetchMajors();
      } else if (dataToDelete.type === "tahun-ajaran") {
        await removeAcademicYear(dataToDelete.id);
        fetchAcademicYears();
      } else if (dataToDelete.type === "kelas") {
        await removeClassroom(dataToDelete.id);
        fetchClassrooms();
      }
      setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `Data ${dataToDelete.name} berhasil dihapus.` });
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Gagal menghapus data, pastikan tidak ada data yang terikat." });
    } finally {
      setIsConfirmModalOpen(false);
      setDataToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isActive = status === "Aktif";

    try {
      if (entityType === "jurusan") {
        if (modalMode === "add") await addMajor(formInput1, formInput2, isActive);
        else if (selectedData) await editMajor(selectedData.id, formInput1, formInput2, isActive);
        fetchMajors();
      } else if (entityType === "tahun-ajaran") {
        if (modalMode === "add") await addAcademicYear(formInput1, formInput2, isActive);
        else if (selectedData) await editAcademicYear(selectedData.id, formInput1, formInput2, isActive);
        fetchAcademicYears();
      } else if (entityType === "kelas" && selectedMajorId) {
        const major = majors.find(m => m.id === selectedMajorId);
        const majorCode = major ? major.kode : "";
        const finalClassName = `${tingkatKelas} ${majorCode} ${kelompokKelas}`.trim();

        if (modalMode === "add") {
          await addClassroom(selectedMajorId, finalClassName, isActive);
          if (!expandedMajors.includes(selectedMajorId)) toggleExpand(selectedMajorId);
        }
        else if (selectedData) await editClassroom(selectedData.id, selectedMajorId, finalClassName, isActive);
        fetchClassrooms();
      }

      setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `Data ${entityType} berhasil disimpan.` });
    } catch {
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Terjadi kesalahan pada server." });
    } finally {
      handleCloseModal();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAlertInfo({ show: true, variant: "info", title: "Memproses...", message: `Sedang mengimpor data dari ${file.name}...` });

    try {
      await importExcel(file);

      setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `Data dari ${file.name} sukses diimpor.` });

      fetchMajors();
      fetchAcademicYears();
      fetchClassrooms();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Gagal Import",
        message: error.response?.data?.message || "File gagal diproses, pastikan format sesuai."
      });
    }
    e.target.value = "";
  };

  const filteredJurusan = majors.filter(j => j.nama.toLowerCase().includes(searchTerm.toLowerCase()) || j.kode.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTahunAjaran = academicYears.filter(t => t.tahun.includes(searchTerm) || t.semester.toLowerCase().includes(searchTerm.toLowerCase()));
  const previewMajorCode = majors.find(m => m.id === selectedMajorId)?.kode || "???";
  const totalPages = Math.ceil(majors.length / rowsPerPage);
  const paginatedData = filteredJurusan.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <PageMeta title="Data Master | Sistem Manajemen PKL" description="Kelola data referensi dasar seperti Tahun Ajaran dan Jurusan." />
      <div className="space-y-6">
        {alertInfo.show && <div className="animate-fade-in"><Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} /></div>}

        <PageHeader
          title="Data Master Sekolah"
          description="Pusat pengelolaan data referensi yang digunakan oleh seluruh sistem."
        >
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
              <svg className="w-5 h-5 text-success-500 group-hover:text-success-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Import Excel
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
            </label>

            <button onClick={() => handleOpenModal("add", activeTab)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-center font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Tambah {activeTab === "jurusan" ? "Jurusan" : "Tahun Ajaran"}
            </button>
          </div>
        </PageHeader>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900 shadow-sm w-fit">
            <button onClick={() => { setActiveTab("jurusan"); setSearchTerm(""); }} className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "jurusan" ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>Master Jurusan</button>
            <button onClick={() => { setActiveTab("tahun-ajaran"); setSearchTerm(""); }} className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "tahun-ajaran" ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>Tahun Ajaran</button>
          </div>
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder={`Cari ${activeTab === "jurusan" ? "Jurusan" : "Tahun Ajaran"}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-900 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white shadow-sm" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">

          <TableTopControls
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalData={majors.length}
            setCurrentPage={setCurrentPage}
          />

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  {activeTab === "jurusan" ? (
                    <>
                      <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Kode Jurusan</TableCell>
                      <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Nama Kompetensi Keahlian</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Tahun Ajaran</TableCell>
                      <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[150px]">Semester</TableCell>
                    </>
                  )}
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">Status</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-theme-xs whitespace-nowrap pr-8">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {activeTab === "jurusan" && paginatedData.map((item) => {
                  const isExpanded = expandedMajors.includes(item.id);
                  const majorClasses = classrooms.filter(c => c.major_id === item.id);
                  return (
                    <React.Fragment key={`j-${item.id}`}>
                      <TableRow className={isExpanded ? "bg-brand-50/50 dark:bg-gray-800/20" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/20"}>
                        <TableCell className="py-4 font-bold text-gray-800 dark:text-white/90 text-theme-sm whitespace-nowrap flex items-center gap-3">
                          <button onClick={() => toggleExpand(item.id)} className="text-gray-400 hover:text-brand-500 transition-colors">
                            <svg className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90 text-brand-500" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                          </button>
                          {item.kode}
                        </TableCell>
                        <TableCell className="py-4 text-theme-sm text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{item.nama}</TableCell>
                        <TableCell className="py-4 whitespace-nowrap"><Badge color={item.status === "Aktif" ? "success" : "error"}>{item.status}</Badge></TableCell>
                        <TableCell className="py-4 text-end whitespace-nowrap pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenModal("add", "kelas", null, item.id)} className="p-1.5 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors" title="Tambah Kelas">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                            <button onClick={() => handleOpenModal("edit", "jurusan", item)} className="p-1.5 text-gray-400 hover:text-accent-500 transition-colors" title="Edit Jurusan">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <button onClick={() => handleOpenDelete(item.id, "jurusan", item.nama)} className="p-1.5 text-gray-400 hover:text-error-500 transition-colors" title="Hapus Jurusan">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={4} className="p-0 border-0">
                            <div className="bg-brand-50/30 px-12 py-4 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                              {majorClasses.length > 0 ? (
                                <div className="space-y-2">
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Daftar Kelas</h4>
                                  {majorClasses.map(cls => (
                                    <div key={`c-${cls.id}`} className="group flex items-center justify-between rounded-lg bg-white dark:bg-gray-800 p-3 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-brand-200 transition-colors">
                                      <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brand-700 dark:group-hover:text-brand-300">{cls.nama}</span>
                                        <Badge color={cls.status === "Aktif" ? "success" : "error"}>{cls.status}</Badge>
                                      </div>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:opacity-100">
                                        <button onClick={() => handleOpenModal("edit", "kelas", cls, item.id)} className="px-3 py-1.5 rounded-md text-xs font-semibold text-accent-600 bg-accent-50 hover:bg-accent-100 dark:text-accent-400 dark:bg-accent-500/10 dark:hover:bg-accent-500/20 transition-colors">Edit</button>
                                        <button onClick={() => handleOpenDelete(cls.id, "kelas", cls.nama)} className="px-3 py-1.5 rounded-md text-xs font-semibold text-error-600 bg-error-50 hover:bg-error-100 dark:text-error-400 dark:bg-error-500/10 dark:hover:bg-error-500/20 transition-colors">Hapus</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic py-2">Belum ada data kelas untuk jurusan ini.</p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}

                {activeTab === "tahun-ajaran" && filteredTahunAjaran.map((item) => (
                  <TableRow key={`t-${item.id}`} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                    <TableCell className="py-4 font-bold text-gray-800 dark:text-white/90 text-theme-sm whitespace-nowrap">{item.tahun}</TableCell>
                    <TableCell className="py-4 text-theme-sm text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{item.semester}</TableCell>
                    <TableCell className="py-4 whitespace-nowrap"><Badge color={item.status === "Aktif" ? "success" : "error"}>{item.status}</Badge></TableCell>
                    <TableCell className="py-4 text-end whitespace-nowrap pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal("edit", "tahun-ajaran", item)} className="p-1.5 text-gray-400 hover:text-accent-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button onClick={() => handleOpenDelete(item.id, "tahun-ajaran", `${item.tahun} ${item.semester}`)} className="p-1.5 text-gray-400 hover:text-error-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-6">{modalMode === "add" ? `Tambah Data ${entityType === "kelas" ? "Kelas" : ""}` : "Edit Data Master"}</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          {entityType === "jurusan" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Kode Jurusan <span className="text-error-500">*</span></label>
                <input type="text" value={formInput1} onChange={(e) => setFormInput1(e.target.value.toUpperCase())} placeholder="Contoh: RPL" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nama Kompetensi Keahlian <span className="text-error-500">*</span></label>
                <input type="text" value={formInput2} onChange={(e) => setFormInput2(e.target.value)} placeholder="Contoh: Rekayasa Perangkat Lunak" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
              </div>
            </>
          )}

          {entityType === "tahun-ajaran" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Tahun Ajaran <span className="text-error-500">*</span></label>
                <div className="relative">
                  <SelectInput
                    value={formInput1}
                    onChange={(val) => setFormInput1(val)}
                    required
                  >
                    <option value="" disabled>Pilih Tahun Ajaran</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      const academicYear = `${year}/${year + 1}`;
                      return (
                        <option key={academicYear} value={academicYear}>
                          {academicYear}
                        </option>
                      );
                    })}
                  </SelectInput>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Semester <span className="text-error-500">*</span></label>
                <div className="relative">
                  <SelectInput
                    value={formInput2}
                    onChange={(val) => setFormInput2(val)}
                    required
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </SelectInput>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                </div>
              </div>
            </>
          )}

          {entityType === "kelas" && (
            <>
              <div className="mb-4 p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20 flex flex-col items-center justify-center">
                <p className="text-xs text-brand-600 dark:text-brand-400 uppercase tracking-wider font-semibold mb-1">Pratinjau Format Kelas</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{tingkatKelas} {previewMajorCode} {kelompokKelas || "_"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Tingkat Kelas <span className="text-error-500">*</span></label>
                  <div className="relative">
                    <SelectInput
                      value={tingkatKelas}
                      onChange={(val) => setTingkatKelas(val)}
                      required>
                      <option value="X">X (Sepuluh)</option>
                      <option value="XI">XI (Sebelas)</option>
                      <option value="XII">XII (Dua Belas)</option>
                    </SelectInput>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Kelompok / Custom <span className="text-error-500">*</span></label>
                  <input type="text" list="kelompok-list" value={kelompokKelas} onChange={(e) => setKelompokKelas(e.target.value.toUpperCase())} placeholder="Contoh: 1, A, Industri" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" required />
                  <datalist id="kelompok-list">
                    <option value="1" /><option value="2" /><option value="3" /><option value="4" /><option value="5" /><option value="A" /><option value="B" /><option value="C" /><option value="Industri" />
                  </datalist>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Status <span className="text-error-500">*</span></label>
            <div className="relative">
              <SelectInput
                value={status}
                onChange={(val) => setStatus(val as "Aktif" | "Nonaktif")}
                required>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </SelectInput>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
            </div>
            {entityType === "tahun-ajaran" && status === "Aktif" && <p className="mt-1.5 text-xs text-accent-600 dark:text-accent-400">Jika diaktifkan, tahun ajaran yang lama akan otomatis dinonaktifkan.</p>}
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={handleCloseModal} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Batal</button>
            <button type="submit" className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 shadow-theme-xs">Simpan Data</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} className="max-w-[400px] p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white/90">Hapus Data?</h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus <strong>{dataToDelete?.name}</strong> secara permanen?
        </p>
        <div className="flex w-full items-center gap-3">
          <button onClick={() => setIsConfirmModalOpen(false)} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Batal</button>
          <button onClick={executeDelete} className="flex-1 rounded-lg bg-error-600 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-error-700 transition-colors">Ya, Hapus</button>
        </div>
      </Modal>
    </>
  );
}