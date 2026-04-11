import { useState, useEffect, useMemo, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SearchInput, SelectInput, TableDataState, TablePagination, TableTopControls } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Alert from "../../components/ui/alert/Alert";
import { useLogbookMonitoringStore, StudentLogbook } from "../../store/Pembimbing/useLogbookMonitoringStore";
import api from "../../lib/axios";
import DatePicker, { DatePickerRef } from "../../components/form/date-picker";

export default function LogbookMonitoring() {
  const { logbooks, isLoading, fetchLogbooks } = useLogbookMonitoringStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("All");

  // STATE BARU: Bisa nangkep string tanggal "YYYY-MM-DD" atau rentang "YYYY-MM-DD to YYYY-MM-DD"
  const [filterDateRange, setFilterDateRange] = useState<string>("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [alertInfo, setAlertInfo] = useState({ show: false, variant: "success" as "success" | "error" | "info", title: "", message: "" });
  const [isExporting, setIsExporting] = useState(false);

  const datePickerRef = useRef<DatePickerRef>(null);

  useEffect(() => {
    fetchLogbooks();
  }, [fetchLogbooks]);

  const studentList = useMemo(() => {
    const map = new Map<string, number>();
    logbooks.forEach((log: StudentLogbook) => {
      if (log.studentName && log.student_id) {
        map.set(log.studentName, log.student_id);
      }
    });
    return Array.from(map.entries());
  }, [logbooks]);

  // LOGIKA FILTER RENTANG WAKTU SAKTI
  const filteredLogbooks = useMemo(() => {
    return logbooks.filter((log: StudentLogbook) => {
      const matchStudent = selectedStudent === "All" || log.student_id.toString() === selectedStudent;
      const matchSearch = log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || log.nis.includes(searchTerm);

      let matchDate = true;
      if (filterDateRange) {
        // Flatpickr misahin tanggal pake " to " kalo mode range
        const dateParts = filterDateRange.split(" to ");
        const logDate = new Date(log.created_at).getTime();

        if (dateParts.length === 2) {
          // Kalo user milih rentang tanggal (Start - End)
          const start = new Date(dateParts[0]).getTime();
          // Akhir hari (23:59:59) biar tanggal akhirnya ikut ke-include
          const end = new Date(dateParts[1] + "T23:59:59").getTime();
          matchDate = logDate >= start && logDate <= end;
        } else {
          // Kalo user milih 1 tanggal doang (diklik cepet)
          matchDate = log.created_at === dateParts[0];
        }
      }

      return matchStudent && matchSearch && matchDate;
    });
  }, [logbooks, selectedStudent, searchTerm, filterDateRange]);

  const totalPages = Math.ceil(filteredLogbooks.length / rowsPerPage);
  const paginatedData = filteredLogbooks.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleOpenPreview = (fileName: string, fileUrl: string | null) => {
    setPreviewFile(fileName);
    setPreviewUrl(fileUrl);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      setAlertInfo({ show: true, variant: "info", title: "Memproses", message: "Sedang menyiapkan dokumen PDF..." });

      const response = await api.get(`/api/v1/pembimbing/logbooks/export-pdf`, {
        params: { student_id: selectedStudent === "All" ? null : selectedStudent },
        responseType: 'blob'
      });

      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');

      setAlertInfo({ show: false, variant: "info", title: "", message: "" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: Blob } };
      let errorMsg = "Gagal mengunduh dokumen PDF dari server.";

      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const json = JSON.parse(text);
          errorMsg = json.message || errorMsg;
        } catch (e) {
          console.error("Gagal parse error blob", e);
        }
      }

      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: errorMsg });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  return (
    <>
      <PageMeta title="Pantau Logbook | Sistem Manajemen PKL" description="Pemeriksaan laporan harian siswa." />

      <div className="space-y-6">
        {alertInfo.show && <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />}

        <PageHeader title="Pantau Logbook Siswa" description="Lihat riwayat aktivitas harian siswa berdasarkan rentang tanggal input.">

          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Cari Nama/NIS..." />

          <SelectInput
            value={selectedStudent}
            onChange={(val) => {
              setSelectedStudent(val);
              setCurrentPage(1);
            }}>
            <option value="All">Semua Siswa</option>
            {studentList.map(([name, id]) => (
              <option key={id} value={id.toString()}>{name}</option>
            ))}
          </SelectInput>

          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="w-full sm:w-[240px]">
              {/* UBAH MODE JADI RANGE */}
              <DatePicker
                id="filter-date-logbook"
                ref={datePickerRef}
                mode="range"
                value={filterDateRange}
                onChange={(_, str) => {
                  setFilterDateRange(str as string);
                  setCurrentPage(1);
                }}
                placeholder="Pilih Rentang Tanggal..."
              />
            </div>

            {filterDateRange && (
              <button
                type="button"
                onClick={() => {
                  setFilterDateRange("");
                  setCurrentPage(1);
                  datePickerRef.current?.clear();
                }}
                className="flex items-center justify-center p-2.5 text-error-500 bg-error-50 border border-error-200 rounded-lg hover:bg-error-100 hover:text-error-700 transition-colors shrink-0"
                title="Hapus Filter Tanggal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            )}
          </div>

          <button
            onClick={handleExportPdf}
            disabled={isExporting || logbooks.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-bold text-white shadow-theme-xs hover:bg-gray-900 transition-colors disabled:opacity-50 h-[42px] shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            {isExporting ? "Menyiapkan PDF..." : "Export PDF"}
          </button>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <TableTopControls rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} totalData={filteredLogbooks.length} setCurrentPage={setCurrentPage} />

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50/50 dark:bg-gray-800/20">
                <TableRow>
                  <TableCell isHeader className="py-3 px-6 font-bold text-gray-500 text-start text-theme-xs uppercase tracking-wider whitespace-nowrap">Nama Siswa</TableCell>
                  <TableCell isHeader className="py-3 px-6 font-bold text-gray-500 text-start text-theme-xs uppercase tracking-wider whitespace-nowrap">Tgl Aktivitas</TableCell>
                  <TableCell isHeader className="py-3 px-6 font-bold text-gray-500 text-start text-theme-xs uppercase tracking-wider whitespace-nowrap">Aktivitas</TableCell>
                  <TableCell isHeader className="py-3 px-6 font-bold text-gray-500 text-center text-theme-xs uppercase tracking-wider whitespace-nowrap">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableDataState
                  isLoading={isLoading}
                  isEmpty={paginatedData.length === 0}
                  colSpan={4}
                  loadingText="Memuat riwayat logbook siswa..."
                  emptyText={filterDateRange ? `Tidak ada aktivitas pada rentang tanggal tersebut.` : (searchTerm ? "Siswa tidak ditemukan." : "Tidak ada data logbook.")}
                >
                  {paginatedData.map((log: StudentLogbook) => (
                    <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <TableCell className="py-4 px-6 whitespace-nowrap align-top">
                        <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">{log.studentName}</p>
                        <span className="text-gray-500 text-theme-xs">{log.industry}</span>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-800 font-bold text-theme-sm whitespace-nowrap align-top">
                        {log.date}
                        <br />
                        <span className="text-[10px] text-gray-400 font-medium">Diinput: {log.created_at}</span>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-theme-sm text-gray-600 align-top">
                        <p className="max-w-[350px] line-clamp-3 leading-relaxed">{log.activity}</p>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center whitespace-nowrap align-top">
                        <button
                          onClick={() => handleOpenPreview(log.attachment, log.attachment_url)}
                          className="bg-brand-50 text-brand-600 border border-brand-200 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-brand-100 transition shadow-sm"
                        >
                          Lihat File
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableDataState>
              </TableBody>
            </Table>
          </div>

          <TablePagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
      </div>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex flex-col h-[80vh]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <span className="text-sm font-bold text-gray-800">{previewFile}</span>
              <div className="flex items-center gap-2">
                <a href={previewUrl || "#"} target="_blank" rel="noreferrer" className="text-xs font-medium text-brand-600 hover:underline mr-2">Buka di Tab Baru</a>
                <button onClick={handleClosePreview} className="text-gray-400 hover:text-error-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 p-4 relative">
              {previewUrl ? (
                previewFile?.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={previewUrl} className="w-full h-full border-0 rounded" title="Preview PDF" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center overflow-auto"><img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded" /></div>
                )
              ) : (<div className="flex justify-center items-center h-full text-gray-500">File tidak dapat dimuat.</div>)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}