import { useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";

interface StudentGuide {
  id: number;
  nis: string;
  name: string;
  major: string;
  industry: string;
  duration: number; 
  monthsCompleted: number; 
  status: "Aktif" | "Selesai" | "Bermasalah";
}

const mockStudents: StudentGuide[] = [
  { id: 1, nis: "3123512901", name: "Fahmi Andika Setiono", major: "Rekayasa Perangkat Lunak", industry: "PT. Telkom Indonesia (Witel Karawang)", duration: 6, monthsCompleted: 3, status: "Aktif" },
  { id: 2, nis: "3123512902", name: "Budi Santoso", major: "Teknik Komputer Jaringan", industry: "CV. Media Kreatif", duration: 3, monthsCompleted: 3, status: "Selesai" },
  { id: 3, nis: "3123512903", name: "Siti Aminah", major: "Multimedia", industry: "PT. Inovasi Teknologi", duration: 6, monthsCompleted: 1, status: "Aktif" },
  { id: 4, nis: "3123512904", name: "Ahmad Maulana", major: "Rekayasa Perangkat Lunak", industry: "PT. Global Data", duration: 3, monthsCompleted: 1.5, status: "Bermasalah" },
];

export default function DaftarBimbingan() {
  const [searchTerm, setSearchTerm] = useState("");

  const calculateProgress = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <>
      <PageMeta title="Daftar Bimbingan | Sistem Manajemen PKL" description="Halaman untuk memantau daftar siswa bimbingan dan progres PKL mereka." />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Daftar Siswa Bimbingan
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pantau lokasi penempatan dan progres waktu pelaksanaan PKL siswa Anda.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                placeholder="Cari nama atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:text-white sm:w-64 transition-colors"
              />
            </div>
          </div>
        </div>

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
                {mockStudents
                  .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm))
                  .map((student) => {
                    const progressPercent = calculateProgress(student.monthsCompleted, student.duration);
                    
                    let progressColor = "bg-brand-500";
                    if (progressPercent === 100) progressColor = "bg-success-500";
                    if (student.status === "Bermasalah") progressColor = "bg-error-500";

                    return (
                      <TableRow key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <TableCell className="py-4 whitespace-nowrap">
                          <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">
                            {student.name}
                          </p>
                          <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                            {student.nis} • {student.major}
                          </span>
                        </TableCell>

                        <TableCell className="py-4 text-theme-sm text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                          {student.industry}
                        </TableCell>

                        <TableCell className="py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5 w-full max-w-[150px]">
                            <div className="flex justify-between text-theme-xs font-semibold">
                              <span className="text-gray-500">{student.monthsCompleted} / {student.duration} Bln</span>
                              <span className="text-gray-800 dark:text-white/90">{progressPercent}%</span>
                            </div>
                            <div className="relative block h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className={`absolute left-0 top-0 flex h-full rounded-full ${progressColor} transition-all duration-500`}
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4 whitespace-nowrap">
                          <Badge
                            color={
                              student.status === "Aktif" ? "success"
                                : student.status === "Selesai" ? "primary"
                                : "error"
                            }
                          >
                            {student.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-4 text-center whitespace-nowrap">
                          <Link 
                            to={`/pembimbing/bimbingan/${student.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-100 hover:text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            Detail Siswa
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
            
            {mockStudents.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm)).length === 0 && (
              <div className="py-8 text-center text-sm text-gray-500">
                Data siswa tidak ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}