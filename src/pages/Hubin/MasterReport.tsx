import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Alert from "../../components/ui/alert/Alert";
import { PageHeader, TableDataState } from "../../components/common/SharedUI";
import { useReportStore } from "../../store/Hubin/useReportStore";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function MasterReport() {
  const { summary, distribution, isLoading, fetchMasterReport, downloadReport } = useReportStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });

  useEffect(() => {
    fetchMasterReport();
  }, [fetchMasterReport]);

  const handleExportGlobal = async (format: "excel" | "pdf") => {
    setAlertInfo({
      show: true,
      variant: "info",
      title: "Memproses Ekspor",
      message: `Menyiapkan file ${format.toUpperCase()}...`,
    });

    try {
      await downloadReport(format);
      setAlertInfo({
        show: true,
        variant: "success",
        title: "Export Berhasil",
        message: "Laporan berhasil diunduh.",
      });
    } catch {
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Export Gagal",
        message: "Terjadi kesalahan saat memproses laporan.",
      });
    }
  };

  const filteredData = distribution.filter(item =>
    item.industry_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.major_name.toLowerCase().includes(searchTerm.toLowerCase())
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

        <PageHeader
          title="Master Rekap PKL"
          description="Laporan daya serap industri dan evaluasi global."
        >
          <div className="flex items-center gap-3">
            <button onClick={() => handleExportGlobal("pdf")} className="inline-flex items-center gap-2 rounded-lg border border-error-200 bg-white px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 dark:bg-gray-800 transition-colors">
              Export PDF
            </button>
            <button onClick={() => handleExportGlobal("excel")} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-sm">
              Export Excel
            </button>
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Siswa PKL", val: summary?.total_students, color: "brand", desc: "Tahun Ajaran Ini" },
            { label: "Mitra Industri", val: summary?.active_industries, color: "accent", desc: "Aktif Menampung" },
            { label: "Selesai Magang", val: summary?.completed_internships, color: "gray", desc: "Telah Dinilai" },
            { label: "Sedang Berjalan", val: summary?.ongoing_internships, color: "gray", desc: "Masih di Lokasi" }
          ].map((stat, i) => (
            <div key={i} className={`rounded-2xl border border-${stat.color}-100 bg-${stat.color}-50 p-5 dark:bg-${stat.color}-900/10 dark:border-${stat.color}-800/30 shadow-sm`}>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">{stat.val ?? 0}</h3>
              <span className="mt-1 block text-xs text-gray-400">{stat.desc}</span>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold">Distribusi Penempatan Industri</h3>
            <input
              type="text"
              placeholder="Cari Industri..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 rounded-lg border border-gray-300 bg-transparent py-2 px-4 text-sm outline-none focus:border-brand-500"
            />
          </div>

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 px-4">Nama Industri</TableCell>
                  <TableCell isHeader className="py-3 px-4">Jurusan</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-center">Total Siswa</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-center">Selesai</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-center">Rata-rata Nilai</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y">
                <TableDataState isLoading={isLoading} isEmpty={filteredData.length === 0} colSpan={5}>
                  {filteredData.map((data, index) => (
                    <TableRow key={index} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4 px-4 text-center font-medium">{data.industry_name}</TableCell>
                      <TableCell className="py-4 px-4 text-center text-gray-500">{data.major_name}</TableCell>
                      <TableCell className="py-4 px-4 text-center font-bold">{data.total_students}</TableCell>
                      <TableCell className="py-4 px-4 text-center">{data.completed_count} / {data.total_students}</TableCell>
                      <TableCell className="py-4 px-4 text-center">
                        {data.avg_score ? (
                          <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-lg font-bold border border-brand-200">{data.avg_score}</span>
                        ) : <span className="text-gray-400 italic">-</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableDataState>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}