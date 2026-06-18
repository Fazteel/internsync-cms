import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Alert from "../../components/ui/alert/Alert";
import Badge from "../../components/ui/badge/Badge";
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
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchMasterReport();
  }, [fetchMasterReport]);

  const toggleRow = (industryName: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [industryName]: !prev[industryName]
    }));
  };

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
            <button
              onClick={() => handleExportGlobal("pdf")}
              className="inline-flex items-center gap-2 rounded-lg border border-error-200 bg-white px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 dark:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
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
                  <TableCell isHeader className="py-3 px-4 w-[35%]">Nama Industri</TableCell>
                  <TableCell isHeader className="py-3 px-4 w-[25%]">Jurusan</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-center w-[12%]">Total Siswa</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-center w-[13%]">Selesai</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-center w-[10%]">Rerata Nilai</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-center w-[5%]"></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y">
                <TableDataState isLoading={isLoading} isEmpty={filteredData.length === 0} colSpan={6}>
                  {filteredData.map((data, index) => {
                    const isExpanded = expandedRows[data.industry_name] || false;
                    return (
                      <React.Fragment key={index}>
                        <TableRow 
                          className={`cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 ${
                            isExpanded ? "bg-brand-50/30 dark:bg-brand-500/5" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/20"
                          }`}
                          onClick={() => toggleRow(data.industry_name)}
                        >
                          <TableCell className="py-4 px-4 font-semibold text-gray-800 dark:text-white/90">
                            {data.industry_name}
                          </TableCell>
                          <TableCell className="py-4 px-4 text-gray-500 text-sm">
                            {data.major_name}
                          </TableCell>
                          <TableCell className="py-4 px-4 text-center font-bold">
                            {data.total_students} Siswa
                          </TableCell>
                          <TableCell className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {data.completed_count} / {data.total_students} Selesai
                              </span>
                              <div className="h-1.5 w-20 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    data.completed_count === data.total_students ? 'bg-success-500' : 'bg-brand-500'
                                  }`}
                                  style={{ width: `${(data.completed_count / data.total_students) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-center">
                            {data.avg_score ? (
                              <span className="bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 px-3 py-1 rounded-lg font-bold border border-brand-200 dark:border-brand-800/50">
                                {data.avg_score}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-4 text-center">
                            <div className="flex justify-center">
                              <svg
                                className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90 text-brand-500" : "text-gray-400"}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                              </svg>
                            </div>
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={6} className="p-0 border-0">
                              <div className="bg-gray-50/30 px-8 py-4 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 animate-fade-in">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                                  Daftar Siswa di {data.industry_name}
                                </h4>
                                
                                {(!data.students || data.students.length === 0) ? (
                                  <p className="text-xs text-gray-500 italic">Tidak ada data siswa.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {data.students.map((student, sIndex) => (
                                      <div key={sIndex} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-brand-200 transition-all">
                                        <div className="flex items-center gap-3">
                                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold text-xs uppercase dark:bg-gray-700 dark:text-gray-300">
                                            {student.name.charAt(0)}
                                          </div>
                                          <div>
                                            <p className="font-bold text-gray-800 text-xs dark:text-white/90">{student.name}</p>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                              NIS: {student.nis} • {student.class_name} • {student.major_name}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                          <Badge size="sm" color={
                                            student.status === "selesai" ? "success" : 
                                            student.status === "aktif" ? "primary" : "warning"
                                          }>
                                            {student.status.toUpperCase()}
                                          </Badge>
                                          
                                          {student.score !== null ? (
                                            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded border border-brand-100 dark:border-brand-800/50">
                                              Nilai: {student.score}
                                            </span>
                                          ) : (
                                            <span className="text-[10px] text-gray-400 italic">Belum dinilai</span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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