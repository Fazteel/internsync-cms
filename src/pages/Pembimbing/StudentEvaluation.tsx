import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SearchInput, TableDataState, TextInput } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert"; 
import { Modal } from "../../components/ui/modal/index";
import { useEvaluationStore, studentEvaluation } from "../../store/Pembimbing/useEvaluationStore";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function StudentEvaluation() {
  const { evaluations, isLoading, fetchEvaluations, submitEvaluation } = useEvaluationStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<studentEvaluation | null>(null);
  
  const [score, setScore] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const handleOpenModal = (student: studentEvaluation) => {
    setSelectedStudent(student);
    setScore(student.evaluationScore !== null ? student.evaluationScore : "");
    setNotes(student.evaluationNotes || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === "" || score < 0 || score > 100) {
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Input Tidak Valid",
        message: "Silakan masukkan nilai angka yang valid, dengan rentang 0 hingga 100.",
      });
      return;
    }
    
    if (!selectedStudent) return;

    setIsSubmitting(true);
    try {
      await submitEvaluation({
        internship_id: selectedStudent.internship_id,
        score: Number(score),
        notes: notes
      });
      
      setAlertInfo({
        show: true,
        variant: "success",
        title: "Evaluasi Tersimpan",
        message: `Penilaian akhir untuk ${selectedStudent.name} berhasil disimpan di dalam sistem.`,
      });
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      setAlertInfo({ show: true, variant: "error", title: "Gagal Memproses", message: "Terjadi kesalahan pada server. Silakan coba kembali beberapa saat lagi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const filteredStudents = evaluations.filter(
    (s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm)
  );

  return (
    <>
      <PageMeta title="Evaluasi Siswa | Sistem Manajemen PKL" description="Halaman untuk memberikan penilaian akhir dan catatan evaluasi kepada siswa PKL." />

      <div className="space-y-6">
        
        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <PageHeader 
          title="Evaluasi & Penilaian Akhir" 
          description="Berikan nilai akhir dan catatan performa untuk siswa yang telah menyelesaikan PKL."
        >
          <div className="flex flex-col sm:flex-row justify-end gap-3 w-full sm:w-auto">
             <div className="w-full sm:w-[300px]">
               <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Cari nama atau NIS..." />
             </div>
          </div>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Nama & NIS</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Penempatan Industri</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap">Status PKL</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap">Nilai Akhir</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState 
                  isLoading={isLoading} 
                  isEmpty={filteredStudents.length === 0} 
                  colSpan={5} 
                  emptyText="Data siswa tidak ditemukan atau Anda belum memiliki siswa bimbingan."
                >
                  {filteredStudents.map((student) => (
                    <TableRow key={student.internship_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 whitespace-nowrap">
                        <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{student.name}</p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">{student.nis}</span>
                      </TableCell>
                      
                      <TableCell className="py-4 text-theme-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {student.industry}
                      </TableCell>
                      
                      <TableCell className="py-4 whitespace-nowrap">
                        <Badge color={student.pklStatus === "Selesai" ? "primary" : "success"}>
                          {student.pklStatus}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4 text-center whitespace-nowrap">
                        {student.evaluationScore !== null ? (
                          <span className="inline-flex h-8 w-10 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-600 border border-brand-200 dark:bg-brand-900/30 dark:text-brand-400">
                            {student.evaluationScore}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Belum dinilai</span>
                        )}
                      </TableCell>

                      <TableCell className="py-4 text-center whitespace-nowrap">
                        <button 
                          onClick={() => handleOpenModal(student)}
                          disabled={student.pklStatus === "Aktif"}
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            student.pklStatus === "Aktif"
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600" 
                              : student.evaluationScore !== null 
                                ? "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" 
                                : "bg-brand-500 text-white hover:bg-brand-600 shadow-theme-xs"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          {student.pklStatus === "Aktif" 
                            ? "Belum Selesai" 
                            : student.evaluationScore !== null 
                              ? "Edit Nilai" 
                              : "Beri Nilai"}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableDataState>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-lg overflow-hidden p-0" showCloseButton={false}>
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
            {selectedStudent?.evaluationScore !== null ? "Edit Penilaian" : "Input Penilaian Baru"}
          </h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Nama Siswa</span>
                <p className="font-bold text-gray-800 dark:text-white/90">{selectedStudent?.name}</p>
              </div>
              <div>
                <span className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Penempatan</span>
                <p className="font-bold text-brand-600 dark:text-brand-400">{selectedStudent?.industry}</p>
              </div>
            </div>
            {selectedStudent?.pklStatus === "Aktif" && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-warning-50 p-3 text-warning-700 border border-warning-100 dark:bg-warning-900/20 dark:border-warning-800/30">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-xs leading-relaxed">Siswa ini masih berstatus <b className="font-bold">Aktif</b> magang. Pastikan masa PKL telah selesai sebelum memberikan penilaian final.</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
            <div className="mb-4">
               <TextInput 
                 label="Nilai Angka"
                 type="number"
                 min="0"
                 max="100"
                 value={score}
                 onChange={(val) => setScore(val !== "" ? Number(val) : "")}
                 placeholder="Contoh: 85 (0 - 100)"
                 required
               />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                Catatan Evaluasi / Feedback <span className="text-error-500">*</span>
              </label>
              <textarea 
                rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Berikan umpan balik mengenai kinerja teknis dan sikap siswa selama di industri..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                required
              ></textarea>
              <p className="mt-1.5 text-xs text-gray-500">Catatan ini akan ditampilkan pada dashboard siswa sebagai bahan evaluasi.</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button 
              type="button" onClick={handleCloseModal}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors shadow-[0_4px_10px_rgba(0,104,55,0.2)] disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Evaluasi"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}