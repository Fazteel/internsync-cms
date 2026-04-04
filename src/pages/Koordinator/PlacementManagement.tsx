import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SearchInput, TableDataState, SelectInput, TableTopControls, TablePagination } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import DatePicker from "../../components/form/date-picker";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { usePlacementStore, StudentPlacement } from "../../store/Koordinator/usePlacementStore";
import { useMasterStore } from "../../store/Admin/useMasterStore";

type ExtendedStudent = StudentPlacement & {
  supervisor_id?: number | null;
  kelas?: string | null;
};

type FilterStatusType = "All" | "Belum Ditempatkan" | "Sudah Ditempatkan";
type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function PlacementManagement() {
  const { students, industries, isLoading, fetchPlacements, fetchIndustries, assignPlacement } = usePlacementStore();
  const { majors, fetchMajors, fetchClassrooms } = useMasterStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>("All");
  const [filterJurusan, setFilterJurusan] = useState("All");
  const [filterKelas, setFilterKelas] = useState("All");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ExtendedStudent | null>(null);

  const [industryId, setIndustryId] = useState<number | "">("");
  const [duration, setDuration] = useState<number | "custom" | "">("");
  const [customDurationValue, setCustomDurationValue] = useState<number | "">("");
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [isExtended, setIsExtended] = useState(false);
  const [extensionMonth, setExtensionMonth] = useState<number | "">("");

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPlacements();
    fetchIndustries();
    fetchMajors();
    fetchClassrooms();
  }, [fetchPlacements, fetchIndustries, fetchMajors, fetchClassrooms]);

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const handleOpenModal = (student: ExtendedStudent) => {
    setSelectedStudent(student);
    setIndustryId(student.industry_id || "");
    setDuration(student.duration || "");
    setStartDate(student.startDate || "");
    setIsExtended(student.is_extended || false);
    setExtensionMonth("");
    const oldDuration = student.duration;
    if (oldDuration && oldDuration !== 3 && oldDuration !== 6) {
      setDuration("custom");
      setCustomDurationValue(oldDuration);
      setIsCustomDuration(true);
    } else {
      setDuration(oldDuration || "");
      setIsCustomDuration(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) return;
    const isAlreadyPlaced = selectedStudent.status === "Sudah Ditempatkan";
    const finalDuration = isCustomDuration ? Number(customDurationValue) : Number(duration);

    if (!selectedStudent.status.includes("Sudah Ditempatkan") && !finalDuration) {
      setAlertInfo({ show: true, variant: "warning", title: "Peringatan", message: "Durasi magang harus diisi!" });
      return;
    }
    if (!isAlreadyPlaced && !startDate) {
      setAlertInfo({ show: true, variant: "warning", title: "Peringatan", message: "Silakan pilih tanggal mulai penempatan!" });
      return;
    }
    if (isExtended && (!extensionMonth || Number(extensionMonth) <= 0)) {
      setAlertInfo({ show: true, variant: "warning", title: "Peringatan", message: "Silakan isi durasi perpanjangan magang." });
      return;
    }

    setIsSubmitting(true);
    try {
      await assignPlacement({
        student_id: selectedStudent.id,
        industry_id: Number(industryId),
        duration: finalDuration,
        start_date: startDate,
        is_extended: isExtended,
        extension_month: isExtended ? Number(extensionMonth) : null
      });

      setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `Data penempatan ${selectedStudent.name} berhasil diperbarui.` });
      fetchPlacements();
      handleCloseModal();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: err.response?.data?.message || "Terjadi kesalahan sistem." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = (students as ExtendedStudent[]).filter((student) => {
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.nis.includes(searchTerm);
    const matchStatus = filterStatus === "All" ? true : student.status === filterStatus;
    const selectedMajorObj = majors.find(m => m.kode === filterJurusan);
    const matchJurusan = filterJurusan === "All" ? true : (student.major === selectedMajorObj?.kode || student.major === selectedMajorObj?.nama);
    const matchKelas = filterKelas === "All" ? true : student.kelas === filterKelas;
    return matchSearch && matchStatus && matchJurusan && matchKelas;
  });

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedData = filteredStudents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <PageMeta title="Kelola Penempatan | Sistem Manajemen PKL" description="Halaman untuk melakukan plotting penempatan siswa ke industri mitra." />

      <div className="space-y-6">
        {alertInfo.show && <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />}

        <PageHeader
          title="Kelola Penempatan Industri"
          description="Atur penempatan lokasi magang, durasi, dan perpanjangan waktu siswa."
        >
          <SearchInput
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }} placeholder="Cari Siswa / NIS..." />
          <SelectInput
            value={filterJurusan}
            onChange={(val) => {
              setFilterJurusan(val);
              setFilterKelas("All");
              setCurrentPage(1);
            }}>
            <option value="All">Semua Jurusan</option>
            {majors.map(m => <option key={m.id} value={m.kode}>{m.kode} - {m.nama}</option>)}
          </SelectInput>

          <SelectInput
            value={filterStatus}
            onChange={(val) => {
              setFilterStatus(val as FilterStatusType);
              setCurrentPage(1);
            }}>
            <option value="All">Semua Status</option>
            <option value="Belum Ditempatkan">Belum Ditempatkan</option>
            <option value="Sudah Ditempatkan">Sudah Ditempatkan</option>
          </SelectInput>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">

          <TableTopControls
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalData={filteredStudents.length}
            setCurrentPage={setCurrentPage}
          />

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs">Nama Siswa</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs">Jurusan</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs">Info Penempatan</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs">Status</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState isLoading={isLoading} isEmpty={paginatedData.length === 0} colSpan={5}>
                  {paginatedData.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 whitespace-nowrap">
                        <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{student.name}</p>
                        <span className="text-gray-500 text-theme-xs">{student.nis}</span>
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm text-gray-600 dark:text-gray-300">
                        <p className="font-medium text-gray-800 dark:text-white/90">{student.major}</p>
                        <span className="text-gray-500 text-theme-xs">{student.kelas || "-"}</span>
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm whitespace-nowrap">
                        {student.industry ? (
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white/90">{student.industry}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-gray-500 text-theme-xs">{student.duration} Bln</span>
                              {student.is_extended && <Badge color="info">Extended</Badge>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Belum ada penempatan</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 whitespace-nowrap">
                        <Badge color={student.status === "Sudah Ditempatkan" ? "success" : student.status === "Sudah Diplot" ? "warning" : "error"}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <button
                          disabled={!student.supervisor_id}
                          onClick={() => handleOpenModal(student)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${!student.supervisor_id ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-brand-500 text-white hover:bg-brand-600 shadow-sm"}`}
                        >
                          {student.status === "Sudah Ditempatkan" ? "Edit" : "Plotting"}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableDataState>
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-[700px] p-0 overflow-hidden" showCloseButton={false}>
        <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50 px-6 py-4 dark:border-brand-800/30 dark:bg-brand-900/10">
          <h3 className="text-lg font-bold text-brand-800 dark:text-brand-400">
            {selectedStudent?.status === "Sudah Ditempatkan" ? "Manajemen Perpanjangan PKL" : "Plotting Penempatan Industri"}
          </h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Siswa</span>
                <p className="font-bold text-gray-800 dark:text-white/90">{selectedStudent?.name}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Status Saat Ini</span>
                <p><Badge color={selectedStudent?.status === "Sudah Ditempatkan" ? "success" : "warning"}>{selectedStudent?.status}</Badge></p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 space-y-5">
            {selectedStudent?.status === "Sudah Ditempatkan" ? (
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Industri Penempatan</span>
                  <p className="font-bold text-brand-600">{selectedStudent.industry}</p>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Durasi Awal</span>
                  <p className="font-bold text-gray-800 dark:text-white">{selectedStudent.duration} Bulan</p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">Pilih Industri Mitra <span className="text-error-500">*</span></label>
                  <SelectInput value={industryId} onChange={(val) => setIndustryId(val === "" ? "" : Number(val))} required>
                    <option value="" disabled>Pilih Perusahaan</option>
                    {industries.map(ind => <option key={ind.id} value={ind.id}>{ind.name} (Sisa: {ind.sisa_kuota})</option>)}
                  </SelectInput>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">Durasi Magang <span className="text-error-500">*</span></label>
                    <SelectInput
                      value={duration}
                      onChange={(val) => {
                        if (val === "custom") {
                          setIsCustomDuration(true);
                          setDuration("custom");
                        } else {
                          setIsCustomDuration(false);
                          setDuration(Number(val));
                        }
                      }}
                      required>
                      <option value="" disabled>Pilih Durasi</option>
                      <option value="3">3 Bulan</option>
                      <option value="6">6 Bulan</option>
                      <option value="custom">Custom(Isi Manual)</option>
                    </SelectInput>
                    {isCustomDuration && (
                      <div className="mt-3 animate-fade-in relative">
                        <input
                          type="number"
                          min="1"
                          placeholder="E.g. 5"
                          value={customDurationValue}
                          onChange={(e) => setCustomDurationValue(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full rounded-lg border border-brand-300 bg-white px-4 py-2.5 pr-16 text-sm text-gray-800 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                          required
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                          <span className="text-sm font-semibold text-gray-500">Bulan</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <DatePicker
                    id="date-picker-start"
                    label={<>Tanggal Mulai <span className="text-error-500">*</span></>}
                    defaultDate={startDate}
                    onChange={(_, str) => setStartDate(str)}
                  />
                </div>
              </>
            )}

            {selectedStudent?.status === "Sudah Ditempatkan" && (
              <div className="pt-2">
                <div className="flex items-center gap-3 p-4 bg-brand-50/50 rounded-xl border border-brand-100 dark:bg-brand-900/10 dark:border-brand-800">
                  <input
                    type="checkbox"
                    id="extend-check"
                    checked={isExtended}
                    onChange={(e) => setIsExtended(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <label htmlFor="extend-check" className="cursor-pointer">
                    <span className="text-sm font-bold text-gray-800 dark:text-white">Tambah Perpanjangan Magang (Extend)?</span>
                    <p className="text-[11px] text-gray-500 leading-tight">Gunakan fitur ini jika siswa ingin menambah durasi di luar kontrak awal.</p>
                  </label>
                </div>

                {isExtended && (
                  <div className="mt-4 pl-8 animate-fade-in">
                    <label className="mb-1.5 block text-xs font-bold text-brand-600 uppercase">Jumlah Bulan Perpanjangan <span className="text-error-500">*</span></label>
                    <div className="relative max-w-[200px]">
                      <input
                        type="number"
                        min="1"
                        value={extensionMonth}
                        onChange={(e) => setExtensionMonth(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full rounded-lg border border-brand-300 bg-white px-4 py-2.5 pr-16 text-sm text-gray-800 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                        placeholder="Misal: 1"
                        required={isExtended}
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-sm font-bold text-gray-500">Bulan</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={handleCloseModal} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300">Batal</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600 shadow-md disabled:opacity-50">
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}