import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { usePlacementStore, StudentPlacement } from "../../store/usePlacementStore";

type ExtendedStudent = StudentPlacement & { 
  supervisor_id?: number | null; 
  supervisor_name?: string | null; 
};

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function PlottingPembimbing() {
  const { students, teachers, isLoading, fetchPlottingStudents, fetchTeachers, assignTeacher } = usePlacementStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Belum Diplot" | "Sudah Diplot">("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ExtendedStudent | null>(null);

  const [selectedTeacherId, setSelectedTeacherId] = useState<number | "">("");
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPlottingStudents();
    fetchTeachers();
  }, [fetchPlottingStudents, fetchTeachers]);

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
      setAlertInfo({ show: true, variant: "warning", title: "Perhatian", message: "Pilih guru pembimbing dulu kocak!" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await assignTeacher(selectedStudent.id, Number(selectedTeacherId));
      setAlertInfo({ show: true, variant: "success", title: "Berhasil Diplot", message: `Pembimbing berhasil ditetapkan untuk ${selectedStudent.name}.` });
      fetchPlottingStudents();
      handleCloseModal();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Gagal",
        message: error.response?.data?.message || "Sistem error pas nyimpen data."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = (students as ExtendedStudent[]).filter((student) => {
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.nis.includes(searchTerm);
    const plotStatus = student.supervisor_id ? "Sudah Diplot" : "Belum Diplot";
    const matchStatus = filterStatus === "All" ? true : plotStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <PageMeta title="Plotting Pembimbing | Sistem Manajemen PKL" description="Halaman untuk menugaskan Guru Pembimbing kepada siswa PKL." />

      <div className="space-y-6">

        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Plotting Guru Pembimbing</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tugaskan guru pembimbing untuk memonitor siswa di lokasi industri.</p>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                placeholder="Cari Siswa atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:w-64 transition-colors"
              />
            </div>

            <div className="relative">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "All" | "Belum Diplot" | "Sudah Diplot")}
                className="appearance-none w-full sm:w-[170px] rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 cursor-pointer"
              >
                <option value="All" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Semua Status</option>
                <option value="Belum Diplot" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Belum Diplot</option>
                <option value="Sudah Diplot" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Sudah Diplot</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <div className="mb-4">
             <p className="text-sm text-gray-500 dark:text-gray-400">Pastikan semua siswa mendapatkan pembimbing sebelum dilempar ke penempatan industri.</p>
          </div>
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
                {isLoading ? (
                  <TableRow><td className="py-8 text-center text-gray-500" colSpan={5}>Memuat data...</td></TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow><td className="py-8 text-center text-sm text-gray-500" colSpan={5}>Data tidak ditemukan.</td></TableRow>
                ) : (
                  filteredStudents.map((student) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
            <div className="relative">
              <select 
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value === "" ? "" : Number(e.target.value))}
                className="appearance-none w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm font-medium outline-none transition-all focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white cursor-pointer"
                required
              >
                <option value="" disabled className="text-gray-500 dark:text-gray-400 dark:bg-gray-900">Pilih Guru Pembimbing</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id} className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">
                    {teacher.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
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