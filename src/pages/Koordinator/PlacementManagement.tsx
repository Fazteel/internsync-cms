import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SearchInput, TableDataState, SelectInput } from "../../components/common/SharedUI";
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
  const { majors, classrooms, fetchMajors, fetchClassrooms } = useMasterStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>("All");
  const [filterJurusan, setFilterJurusan] = useState("All");
  const [filterKelas, setFilterKelas] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ExtendedStudent | null>(null);

  const [industryId, setIndustryId] = useState<number | "">("");
  const [duration, setDuration] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");

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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate) {
      setAlertInfo({ show: true, variant: "warning", title: "Peringatan", message: "Silakan pilih tanggal mulai penempatan!" });
      return;
    }
    if (!selectedStudent || !industryId || !duration) return;

    setIsSubmitting(true);
    try {
      await assignPlacement({
        student_id: selectedStudent.id,
        industry_id: Number(industryId),
        duration: Number(duration),
        start_date: startDate
      });

      setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: `Data penempatan untuk ${selectedStudent.name} berhasil disimpan.` });
      fetchPlacements();
      handleCloseModal();
    } catch (error: unknown) {
      console.error("Gagal nyimpen penempatan:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Gagal",
        message: err.response?.data?.message || "Sistem error."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = (students as ExtendedStudent[]).filter((student) => {
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.nis.includes(searchTerm);
    const matchStatus = filterStatus === "All" ? true : student.status === filterStatus;
    const selectedMajorObj = majors.find(m => m.kode === filterJurusan);
    const matchJurusan = filterJurusan === "All" 
      ? true 
      : (student.major === selectedMajorObj?.kode || student.major === selectedMajorObj?.nama);
    const matchKelas = filterKelas === "All" ? true : student.kelas === filterKelas;
    return matchSearch && matchStatus && matchJurusan && matchKelas;
  });

  return (
    <>
      <PageMeta title="Kelola Penempatan | Sistem Manajemen PKL" description="Halaman untuk melakukan plotting penempatan siswa ke industri mitra." />

      <div className="space-y-6">
        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <PageHeader 
          title="Kelola Penempatan Industri" 
          description="Atur penempatan lokasi magang, durasi, dan tanggal mulai siswa."
        />

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Cari Siswa / NIS..." />
          
          <SelectInput 
            value={filterJurusan} 
            onChange={(val) => { setFilterJurusan(val); setFilterKelas("All"); }}
          >
            <option value="All">Semua Jurusan</option>
            {majors.map(m => <option key={m.id} value={m.kode}>{m.kode} - {m.nama}</option>)}
          </SelectInput>

          <SelectInput 
            value={filterKelas} 
            onChange={setFilterKelas} 
            disabled={filterJurusan === "All"}
          >
            <option value="All">Semua Kelas</option>
            {classrooms.filter(c => majors.find(m => m.kode === filterJurusan)?.id === c.major_id).map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
          </SelectInput>

          <SelectInput 
            value={filterStatus} 
            onChange={(val) => setFilterStatus(val as FilterStatusType)}
          >
            <option value="All">Semua Status</option>
            <option value="Belum Ditempatkan">Belum Ditempatkan</option>
            <option value="Sudah Ditempatkan">Sudah Ditempatkan</option>
          </SelectInput>
        </div>

        {/* Tabel */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Nama & NIS</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Jurusan & Kelas</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Industri Tujuan</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Status</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState 
                  isLoading={isLoading} 
                  isEmpty={filteredStudents.length === 0} 
                  colSpan={5} 
                  loadingText="Memuat data siswa..."
                  emptyText="Data tidak ditemukan."
                >
                  {filteredStudents.map((student) => {
                    const matchedMajor = majors.find(m => m.kode === student.major || m.nama === student.major);
                    const tampilanJurusan = matchedMajor ? `${matchedMajor.kode} - ${matchedMajor.nama}` : student.major;

                    return (
                      <TableRow key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <TableCell className="py-4 whitespace-nowrap">
                          <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{student.name}</p>
                          <span className="text-gray-500 text-theme-xs dark:text-gray-400">{student.nis}</span>
                        </TableCell>
                        
                        <TableCell className="py-4 text-theme-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          <p className="font-medium text-gray-800 dark:text-white/90">{tampilanJurusan}</p>
                          <span className="text-gray-500 text-theme-xs">{student.kelas || "-"}</span>
                        </TableCell>

                        <TableCell className="py-4 text-theme-sm whitespace-nowrap">
                          {student.industry ? (
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white/90">{student.industry}</p>
                              <span className="text-gray-500 text-theme-xs dark:text-gray-400">{student.duration} Bulan (Mulai: {student.startDate})</span>
                            </div>
                          ) : (
                            <span className="text-error-500 bg-error-50 px-2 py-1 rounded-md text-xs font-medium dark:bg-error-500/10 dark:text-error-400">Belum ditentukan</span>
                          )}
                        </TableCell>
                        
                        <TableCell className="py-4 whitespace-nowrap">
                          <Badge 
                            color={student.status === "Sudah Ditempatkan" ? "success" : student.status === "Sudah Diplot" ? "warning" : "error"}
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="py-4 text-center whitespace-nowrap">
                          <button 
                            disabled={!student.supervisor_id}
                            onClick={() => handleOpenModal(student)}
                            title={!student.supervisor_id ? "Tugaskan pembimbing terlebih dahulu di menu Plotting!" : "Lakukan Plotting Industri"}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              !student.supervisor_id 
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600" 
                                : student.status === "Belum Ditempatkan"
                                  ? "bg-brand-500 text-white hover:bg-brand-600 shadow-[0_2px_8px_rgba(0,104,55,0.2)]" 
                                  : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                          >
                            {!student.supervisor_id ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            )}
                            {!student.supervisor_id ? "Butuh Pembimbing" : student.status === "Belum Ditempatkan" ? "Plotting" : "Edit"}
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableDataState>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-[700px] p-0 max-h-[90vh] overflow-y-auto custom-scrollbar" showCloseButton={false}>
        <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50 px-6 py-4 dark:border-brand-800/30 dark:bg-brand-900/10">
          <h3 className="text-lg font-bold text-brand-800 dark:text-brand-400">Plotting Penempatan Industri</h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 dark:border-gray-700 dark:bg-gray-800">
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Siswa yang di-plotting</span>
            <p className="font-bold text-gray-800 dark:text-white/90">{selectedStudent?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedStudent?.nis} - {selectedStudent?.major} ({selectedStudent?.kelas})</p>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">Pilih Industri Mitra <span className="text-error-500">*</span></label>
              <SelectInput value={industryId} onChange={(val) => setIndustryId(val === "" ? "" : Number(val))} required>
                <option value="" disabled>Pilih Perusahaan</option>
                {industries.map(ind => (
                  <option key={ind.id} value={ind.id}>{ind.name} (Kuota: {ind.sisa_kuota})</option>
                ))}
              </SelectInput>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">Durasi PKL <span className="text-error-500">*</span></label>
                <SelectInput value={duration} onChange={(val) => setDuration(val === "" ? "" : Number(val))} required>
                  <option value="" disabled>Pilih Durasi</option>
                  <option value="3">3 Bulan</option>
                  <option value="6">6 Bulan</option>
                </SelectInput>
              </div>

              <div>
                <DatePicker
                  key={selectedStudent ? selectedStudent.id : "new-date"} 
                  id="date-picker-start-date"
                  label={<>Tanggal Mulai <span className="text-error-500">*</span></>}
                  placeholder="Pilih tanggal mulai"
                  defaultDate={startDate}
                  onChange={(dates: Date[], currentDateString: string) => setStartDate(currentDateString)}
                />
                {selectedStudent?.startDate && !startDate && (
                  <p className="mt-1 text-xs text-gray-500">Tercatat: {selectedStudent.startDate}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={handleCloseModal}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors shadow-[0_4px_10px_rgba(0,104,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Memproses..." : "Simpan Penempatan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}