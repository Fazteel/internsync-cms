import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";

interface RekapitulasiSiswa {
  id: number;
  nis: string;
  name: string;
  major: string;
  industry: string;
  supervisor: string;
  status: "Aktif" | "Selesai" | "Bermasalah";
  finalScore: number | null;
}

const mockRekapitulasi: RekapitulasiSiswa[] = [
  {
    id: 1,
    nis: "3123512901",
    name: "Fahmi Andika Setiono",
    major: "Rekayasa Perangkat Lunak",
    industry: "PT. Telkom Indonesia",
    supervisor: "Mohammad Robihul Mufid",
    status: "Selesai",
    finalScore: 92,
  },
  {
    id: 2,
    nis: "3123512902",
    name: "Budi Santoso",
    major: "Teknik Komputer Jaringan",
    industry: "CV. Media Kreatif",
    supervisor: "Ahmad Yani",
    status: "Selesai",
    finalScore: 88,
  },
  {
    id: 3,
    nis: "3123512903",
    name: "Siti Aminah",
    major: "Multimedia",
    industry: "PT. Inovasi Teknologi",
    supervisor: "Budi Santoso",
    status: "Aktif",
    finalScore: null,
  },
  {
    id: 4,
    nis: "3123512904",
    name: "Ahmad Maulana",
    major: "Rekayasa Perangkat Lunak",
    industry: "PT. Global Data",
    supervisor: "Siti Aminah",
    status: "Bermasalah",
    finalScore: null,
  },
];

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function SummaryReport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Aktif" | "Selesai" | "Bermasalah">("All");
  const [filterMajor, setFilterMajor] = useState<"All" | "RPL" | "TKJ" | "MM">("All");
  
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });

  const handlePrintReport = (studentName: string) => {
    setAlertInfo({
      show: true,
      variant: "info",
      title: "Memproses Cetak Laporan",
      message: `Sedang menyiapkan dokumen Sertifikat dan Laporan PKL untuk ${studentName}...`,
    });
  };

  const handleExportExcel = () => {
    setAlertInfo({
      show: true,
      variant: "success",
      title: "Ekspor Dimulai",
      message: "Seluruh data rekapitulasi sedang diekspor ke format Excel (.xlsx).",
    });
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        setAlertInfo((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const filteredData = mockRekapitulasi.filter((student) => {
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.nis.includes(searchTerm);
    const matchStatus = filterStatus === "All" ? true : student.status === filterStatus;
    
    let matchMajor = true;
    if (filterMajor !== "All") {
      if (filterMajor === "RPL" && student.major !== "Rekayasa Perangkat Lunak") matchMajor = false;
      if (filterMajor === "TKJ" && student.major !== "Teknik Komputer Jaringan") matchMajor = false;
      if (filterMajor === "MM" && student.major !== "Multimedia") matchMajor = false;
    }

    return matchSearch && matchStatus && matchMajor;
  });

  return (
    <>
      <PageMeta title="Rekapitulasi PKL | Sistem Manajemen PKL" description="Laporan akhir, status, dan rekapitulasi nilai siswa PKL." />

      <div className="space-y-6">

        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Rekapitulasi & Status Akhir</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Pantau status terkini dan hasil akhir penilaian PKL seluruh siswa.</p>
          </div>
          <div>
            <button 
              onClick={handleExportExcel}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-center font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export Data (Excel)
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder="Cari Siswa / NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative w-full sm:w-[150px]">
              <select 
                value={filterMajor}
                onChange={(e) => setFilterMajor(e.target.value as "All" | "RPL" | "TKJ" | "MM")}
                className="appearance-none w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 cursor-pointer"
              >
                <option value="All" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Semua Jurusan</option>
                <option value="RPL" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">RPL</option>
                <option value="TKJ" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">TKJ</option>
                <option value="MM" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Multimedia</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="relative w-full sm:w-[160px]">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "All" | "Aktif" | "Selesai" | "Bermasalah")}
                className="appearance-none w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 cursor-pointer"
              >
                <option value="All" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Semua Status</option>
                <option value="Aktif" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Aktif Magang</option>
                <option value="Selesai" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Selesai</option>
                <option value="Bermasalah" className="text-gray-700 dark:text-gray-300 dark:bg-gray-900">Bermasalah</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Siswa & Jurusan</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Industri & Pembimbing</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-start text-theme-xs whitespace-nowrap">Status PKL</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap">Nilai Akhir</TableCell>
                  <TableCell isHeader className="py-3 font-semibold text-gray-500 text-center text-theme-xs whitespace-nowrap">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredData.map((student) => (
                  <TableRow key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <TableCell className="py-4 whitespace-nowrap">
                      <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{student.name}</p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">{student.nis} • {student.major}</span>
                    </TableCell>
                    
                    <TableCell className="py-4 text-theme-sm whitespace-nowrap">
                      <p className="font-medium text-gray-800 dark:text-white/90">{student.industry}</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-0.5">Guru: {student.supervisor}</p>
                    </TableCell>
                    
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="flex items-start mt-1">
                        <Badge color={student.status === "Selesai" ? "primary" : student.status === "Aktif" ? "success" : "error"}>
                          {student.status}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-center whitespace-nowrap">
                      {student.finalScore !== null ? (
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-100 bg-brand-50 text-sm font-bold text-brand-700 dark:border-brand-800/30 dark:bg-brand-900/20 dark:text-brand-300 shadow-sm">
                          {student.finalScore}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 italic block mt-1">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="py-4 text-center whitespace-nowrap">
                      <button 
                        onClick={() => handlePrintReport(student.name)}
                        disabled={student.status !== "Selesai"}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          student.status === "Selesai" 
                            ? "bg-brand-500 text-white hover:bg-brand-600 shadow-[0_2px_8px_rgba(0,104,55,0.2)] cursor-pointer" 
                            : "bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-600"
                        }`}
                        title={student.status !== "Selesai" ? "Hanya bisa dicetak jika status sudah Selesai" : "Cetak Sertifikat/Rapor"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Cetak Laporan
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredData.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-500">Data rekapitulasi tidak ditemukan.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}