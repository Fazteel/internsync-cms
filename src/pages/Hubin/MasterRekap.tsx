import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Alert from "../../components/ui/alert/Alert";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

const summaryStats = {
  totalStudents: 124,
  activeIndustries: 15,
  completedInternships: 89,
  ongoingInternships: 35,
};

const mockMasterData = [
  { id: 1, industry: "PT. Telkom Indonesia", major: "Rekayasa Perangkat Lunak", totalStudents: 12, completed: 12, avgScore: 88.5, status: "Selesai" },
  { id: 2, industry: "CV. Media Kreatif", major: "Multimedia", totalStudents: 8, completed: 8, avgScore: 91.0, status: "Selesai" },
  { id: 3, industry: "PT. Inovasi Teknologi", major: "Teknik Komputer Jaringan", totalStudents: 5, completed: 0, avgScore: null, status: "Aktif Berjalan" },
  { id: 4, industry: "PT. Global Data Nusantara", major: "Rekayasa Perangkat Lunak", totalStudents: 10, completed: 5, avgScore: 85.0, status: "Aktif Berjalan" },
];

export default function MasterRekap() {
  const [searchTerm, setSearchTerm] = useState("");

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });

  const handleExportGlobal = (format: "excel" | "pdf") => {
    setAlertInfo({
      show: true,
      variant: "success",
      title: `Export ${format.toUpperCase()} Dimulai`,
      message: `Mengekspor Master Data PKL ke format ${format.toUpperCase()} untuk laporan...`,
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

  const filteredData = mockMasterData.filter(item => 
    item.industry.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.major.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta title="Master Rekap | Sistem Manajemen PKL" description="Laporan global dan rekapitulasi eksekutif pelaksanaan PKL untuk tim Hubungan Industri." />

      <div className="space-y-6">
        
        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Master Rekap PKL</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Laporan eksekutif daya serap industri dan evaluasi program magang secara global.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleExportGlobal("pdf")}
              className="inline-flex items-center gap-2 rounded-lg border border-error-200 bg-white px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 dark:border-error-800/30 dark:bg-gray-800 dark:hover:bg-error-900/20 transition-colors"
            >
              <svg className="w-4 h-4 text-error-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              Export PDF
            </button>
            <button 
              onClick={() => handleExportGlobal("excel")}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900/30 dark:bg-brand-900/10">
            <p className="text-sm font-medium text-brand-700 dark:text-brand-400">Total Siswa PKL</p>
            <h3 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">{summaryStats.totalStudents}</h3>
            <span className="mt-1 block text-xs text-brand-500">Tahun Ajaran Ini</span>
          </div>
          <div className="rounded-2xl border border-accent-100 bg-accent-50/50 p-5 dark:border-accent-900/30 dark:bg-accent-900/10">
            <p className="text-sm font-medium text-accent-800 dark:text-accent-400">Mitra Industri Aktif</p>
            <h3 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">{summaryStats.activeIndustries}</h3>
            <span className="mt-1 block text-xs text-accent-600">Perusahaan Menampung Siswa</span>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Magang Selesai</p>
            <h3 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">{summaryStats.completedInternships}</h3>
            <span className="mt-1 block text-xs text-gray-500">Siswa telah dinilai</span>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Magang Berjalan</p>
            <h3 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">{summaryStats.ongoingInternships}</h3>
            <span className="mt-1 block text-xs text-gray-400">Siswa masih di lokasi</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Distribusi Penempatan Industri</h3>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                placeholder="Cari Industri / Jurusan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 rounded-lg border border-gray-300 bg-transparent py-2 pl-10 pr-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Nama Industri</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Kompetensi Keahlian</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs whitespace-nowrap">Total Siswa</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs whitespace-nowrap">Selesai Dinilai</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs whitespace-nowrap">Rata-rata Nilai</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredData.map((data) => (
                  <TableRow key={data.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <TableCell className="py-4 font-medium text-gray-800 dark:text-white/90 text-theme-sm whitespace-nowrap">
                      {data.industry}
                    </TableCell>
                    <TableCell className="py-4 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {data.major}
                    </TableCell>
                    <TableCell className="py-4 text-center whitespace-nowrap">
                      <span className="font-bold text-gray-800 dark:text-white/90">{data.totalStudents}</span>
                    </TableCell>
                    <TableCell className="py-4 text-center text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {data.completed} / {data.totalStudents}
                    </TableCell>
                    <TableCell className="py-4 text-center whitespace-nowrap">
                      {data.avgScore ? (
                        <span className="inline-flex h-8 w-12 items-center justify-center rounded-lg bg-brand-50 font-bold text-brand-700 border border-brand-200 dark:bg-brand-900/30 dark:border-brand-800 dark:text-brand-300 text-sm">
                          {data.avgScore}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredData.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-500">Data laporan tidak ditemukan.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}