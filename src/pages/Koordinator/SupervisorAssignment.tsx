import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SearchInput, TableDataState, SelectInput, TableTopControls, TablePagination } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useAssignmentStore, PlottingStudent } from "../../store/Koordinator/useSupervisorAssignmentStore";
import { useMasterStore } from "../../store/Admin/useMasterStore";

type ExtendedStudent = PlottingStudent & { 
  supervisor_id?: number | null; 
  supervisor_name?: string | null; 
};

type FilterStatusType = "All" | "Belum Diplot" | "Sudah Diplot";
type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function SupervisorAssignment() {
  const { plottingStudents, teachers, isLoading, fetchPlottingStudents, fetchTeachers, assignTeacher } = useAssignmentStore();
  const { majors, fetchMajors } = useMasterStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>("All");
  const [filterJurusan, setFilterJurusan] = useState("All");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ExtendedStudent | null>(null);

  const [selectedTeacherId, setSelectedTeacherId] = useState<number | "">("");
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPlottingStudents();
    fetchTeachers();
    fetchMajors();
  }, [fetchPlottingStudents, fetchTeachers, fetchMajors]);

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const handleOpenModal = (student: ExtendedStudent) => {
    setSelectedStudent(student);
    setSelectedTeacherId(student.supervisor_id || ""); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setSelectedTeacherId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !selectedStudent) {
      setAlertInfo({ show: true, variant: "warning", title: "Perhatian", message: "Silakan pilih guru pembimbing terlebih dahulu." });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await assignTeacher(selectedStudent.id, Number(selectedTeacherId));
      setAlertInfo({ show: true, variant: "success", title: "Berhasil Diplot", message: `Pembimbing berhasil ditetapkan untuk ${selectedStudent.name}.` });
      fetchPlottingStudents();
    } catch (err: unknown) {
      console.error("Kesalahan saat menetapkan pembimbing:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Gagal Memproses",
        message: error.response?.data?.message || "Terjadi kesalahan sistem saat menyimpan data."
      });
    } finally {
      handleCloseModal();
      setIsSubmitting(false);
    }
  };

  const filteredStudents = (plottingStudents as ExtendedStudent[]).filter((student) => {
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.nis.includes(searchTerm);
    const plotStatus = student.supervisor_id ? "Sudah Diplot" : "Belum Diplot";
    const matchStatus = filterStatus === "All" ? true : plotStatus === filterStatus;
    
    const selectedMajorObj = majors.find(m => m.kode === filterJurusan);
    const matchJurusan = filterJurusan === "All" 
      ? true 
      : (student.major === selectedMajorObj?.kode || student.major === selectedMajorObj?.nama);

    return matchSearch && matchStatus && matchJurusan;
  });

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedData = filteredStudents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <PageMeta title="Plotting Pembimbing | Sistem Manajemen PKL" description="Halaman untuk menugaskan Guru Pembimbing kepada siswa PKL." />

      <div className="space-y-6">

        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <PageHeader 
          title="Plotting Guru Pembimbing" 
          description="Tugaskan guru pembimbing untuk memonitor siswa di lokasi industri."
        >
          <SearchInput
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }} placeholder="Cari Siswa atau NIS..." />
          
          <SelectInput 
            value={filterJurusan} 
            onChange={(val) => { setFilterJurusan(val); setCurrentPage(1); }}
          >
            <option value="All">Semua Jurusan</option>
            {majors.map(m => <option key={m.id} value={m.kode}>{m.kode} - {m.nama}</option>)}
          </SelectInput>

          <SelectInput 
            value={filterStatus} 
            onChange={(val) => {
              setFilterStatus(val as FilterStatusType);
              setCurrentPage(1);
            }}
          >
            <option value="All">Semua Status</option>
            <option value="Belum Diplot">Belum Diplot</option>
            <option value="Sudah Diplot">Sudah Diplot</option>
          </SelectInput>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <div className="mb-4">
             <p className="text-sm text-gray-500 dark:text-gray-400">Pastikan semua siswa mendapatkan pembimbing sebelum dilempar ke penempatan industri.</p>
          </div>

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
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs min-w-[200px] whitespace-nowrap">Nama & NIS</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs min-w-[200px] whitespace-nowrap">Jurusan</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs min-w-[250px] whitespace-nowrap">Guru Pembimbing</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs min-w-[150px] whitespace-nowrap">Status</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs min-w-[100px] whitespace-nowrap">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState 
                  isLoading={isLoading} 
                  isEmpty={paginatedData.length === 0} 
                  colSpan={5} 
                  loadingText="Memuat data siswa..."
                  emptyText="Data tidak ditemukan."
                >
                  {paginatedData.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 whitespace-nowrap">
                        <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{student.name}</p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">{student.nis}</span>
                      </TableCell>
                      
                      <TableCell className="py-4 text-theme-sm text-gray-800 dark:text-white/90 font-medium whitespace-nowrap">
                        {student.major}
                      </TableCell>
                      
                      <TableCell className="py-4 text-theme-sm whitespace-nowrap">
                        {student.supervisor_name ? (
                          <div className="flex items-center gap-2">
                             <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 text-xs font-bold border border-accent-200 dark:border-accent-800/50 shadow-sm">
                               {student.supervisor_name.charAt(0)}
                             </div>
                             <span className="font-medium text-gray-800 dark:text-white/90">{student.supervisor_name}</span>
                          </div>
                        ) : (
                          <span className="text-error-500 bg-error-50 px-2 py-1 rounded-md text-xs font-medium dark:bg-error-500/10 dark:text-error-400">Belum ada pembimbing</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="py-4 whitespace-nowrap">
                        <div className="flex items-start mt-1">
                          <Badge color={student.supervisor_id ? "success" : "warning"}>
                            {student.supervisor_id ? "Sudah Diplot" : "Belum Diplot"}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 text-center whitespace-nowrap">
                        <button 
                          onClick={() => handleOpenModal(student)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            !student.supervisor_id 
                              ? "bg-accent-500 text-white hover:bg-accent-600 shadow-[0_2px_8px_rgba(247,181,0,0.3)]" 
                              : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          {!student.supervisor_id ? "Pilih Guru" : "Ubah Guru"}
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-lg p-0 max-h-[90vh] overflow-y-auto custom-scrollbar" showCloseButton={false}>
        <div className="flex items-center justify-between border-b border-accent-100 bg-accent-50 px-6 py-4 dark:border-accent-800/30 dark:bg-accent-900/10">
          <h3 className="text-lg font-bold text-accent-800 dark:text-accent-400">
            Plotting Guru Pembimbing
          </h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 dark:border-gray-700 dark:bg-gray-800 grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Nama Siswa</span>
              <p className="font-bold text-gray-800 dark:text-white/90">{selectedStudent?.name}</p>
              <p className="text-xs text-gray-500">{selectedStudent?.nis}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Jurusan</span>
              <p className="font-bold text-brand-600 dark:text-brand-400">{selectedStudent?.major}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
            <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
              Guru Pembimbing <span className="text-error-500">*</span>
            </label>
            <SelectInput 
              value={selectedTeacherId} 
              onChange={(val) => setSelectedTeacherId(val === "" ? "" : Number(val))} 
              required
            >
              <option value="" disabled>Pilih Guru Pembimbing</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </SelectInput>
            <p className="mt-1.5 text-xs text-gray-500">Guru yang dipilih akan bertanggung jawab memverifikasi logbook harian siswa ini.</p>
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
              className="rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-600 transition-colors shadow-[0_4px_10px_rgba(247,181,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Memproses..." : "Simpan Plotting"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}