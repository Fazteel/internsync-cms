import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SearchInput, TableDataState } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { useStudentMenteeStore } from "../../store/Pembimbing/useStudentMenteeStore";

export default function SupervisionList() {
  const { students, isLoading, fetchStudents } = useStudentMenteeStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const calculateProgress = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const filteredStudents = students.filter(
    (s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm)
  );

  return (
    <>
      <PageMeta title="Daftar Bimbingan | Sistem Manajemen PKL" description="Halaman untuk memantau daftar siswa bimbingan dan progres PKL mereka." />

      <div className="space-y-6">
        <PageHeader 
          title="Daftar Siswa Bimbingan" 
          description="Pantau lokasi penempatan dan progres waktu pelaksanaan PKL siswa Anda."
        >
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Cari nama atau NIS..." />
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Nama & NIS</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Penempatan Industri</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[180px]">Progres Waktu PKL</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap">Status</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState 
                  isLoading={isLoading} 
                  isEmpty={filteredStudents.length === 0} 
                  colSpan={5} 
                  loadingText="Memuat data siswa bimbingan..."
                >
                  {filteredStudents.map((student) => {
                    const progressPercent = calculateProgress(student.monthsCompleted, student.duration);
                    
                    let progressColor = "bg-brand-500";
                    if (progressPercent >= 100) progressColor = "bg-success-500";
                    if (student.status === "Bermasalah") progressColor = "bg-error-500";
                    if (student.status === "Menunggu") progressColor = "bg-warning-400";

                    return (
                      <TableRow key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <TableCell className="py-4 whitespace-nowrap">
                          <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{student.name}</p>
                          <span className="text-gray-500 text-theme-xs dark:text-gray-400">{student.nis} • {student.major}</span>
                        </TableCell>
                        <TableCell className="py-4 text-theme-sm text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{student.industry}</TableCell>
                        <TableCell className="py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5 w-full max-w-[150px]">
                            <div className="flex justify-between text-theme-xs font-semibold">
                              <span className="text-gray-500">{student.monthsCompleted} / {student.duration} Bln</span>
                              <span className="text-gray-800 dark:text-white/90">{progressPercent}%</span>
                            </div>
                            <div className="relative block h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                              <div className={`absolute left-0 top-0 flex h-full rounded-full ${progressColor} transition-all duration-500`} style={{ width: `${progressPercent}%` }}></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 whitespace-nowrap">
                          <Badge color={student.status === "Aktif" ? "success" : student.status === "Selesai" ? "primary" : student.status === "Menunggu" ? "warning" : "error"}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-center whitespace-nowrap">
                          <Link to={`/pembimbing/bimbingan/${student.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-100 hover:text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            Detail Siswa
                          </Link>
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
    </>
  );
}