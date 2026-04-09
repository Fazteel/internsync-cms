import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, TableTopControls, TablePagination } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { InternshipApplication, useInternshipStore } from "../../store/useInternshipStore";
import InternshipForm from "../../components/form/InternshipForm";
import { SelectInput } from "../../components/common/SharedUI";

export default function InternshipApplicationList() {
  const { applications, fetchApplications } = useInternshipStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    fetchApplications('pengajuan');
  }, [fetchApplications]);

  const handleOpenForm = (app: InternshipApplication | null = null) => {
    setSelectedApp(app);
    setIsFormOpen(true);
  };

  if (isFormOpen) {
    return (
      <InternshipForm
        initialData={selectedApp}
        onBack={() => setIsFormOpen(false)}
        viewMode="koordinator_pengajuan"
      />
    );
  }

  const filteredApplications = applications.filter((app) => {
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    const matchDate = filterMonth === "" || (app.suggested_start_date && app.suggested_start_date.startsWith(filterMonth));
    return matchStatus && matchDate;
  });

  const totalPages = Math.ceil(filteredApplications.length / rowsPerPage);
  const paginatedData = filteredApplications.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge color="error">Draft</Badge>;
      case 'menunggu_acc_pengajuan':
        return <Badge color="warning">Menunggu</Badge>;
      case 'pengajuan':
        return <Badge color="success">Disetujui</Badge>;
      case 'menunggu_acc_pengiriman':
        return <Badge color="success">Disetujui</Badge>;
      case 'ditolak':
        return <Badge color="error">Ditolak</Badge>;
      case 'batal':
        return <Badge color="error">Dibatalkan</Badge>;
      default:
        return <Badge color="warning">{status}</Badge>;
    }
  };

  return (
    <>
      <PageMeta title="Pengajuan PKL | InternSync" description="Manajemen pengajuan praktik kerja lapangan." />

      <div className="space-y-6">
        <PageHeader
          title="Pengajuan PKL"
          description="Kelola draf dan pengajuan surat prakerin ke industri tujuan."
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex flex-col">
              <SelectInput
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val);
                  setCurrentPage(1);
                }}>
                <option value="all">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="menunggu_acc_pengajuan">Menunggu</option>
                <option value="pengajuan">Disetujui</option>
                <option value="ditolak">Ditolak</option>
                <option value="batal">Dibatalkan</option>
              </SelectInput>
            </div>

            <div className="flex flex-col">
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Buat Pengajuan
          </button>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <div className="px-4 py-4 sm:px-6 border-b border-gray-100 dark:border-gray-800">
          <TableTopControls
            rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
            totalData={filteredApplications.length} setCurrentPage={setCurrentPage}
          />
            <p className="text-sm text-gray-500">Daftar perusahaan tujuan magang beserta status pengajuan surat.</p>
          </div>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-800/20">
                <TableRow>
                  <TableCell isHeader className="py-3 px-8 text-start w-[25%]">Industri & Batch</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-start w-[20%]">Pembimbing</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-center w-[10%]">Siswa</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-start w-[20%]">Periode Pengajuan</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-start w-[10%]">Status</TableCell>
                  <TableCell isHeader className="py-3 px-4 text-center w-[15%]">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-gray-400 italic">
                      Tidak ada data yang ditampilkan.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((app) => (
                    <TableRow key={app.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 dark:border-gray-800">
                      <TableCell className="py-5 px-8 text-start">
                        <p className="font-bold text-gray-800 dark:text-white/90 text-sm">{app.industry?.name}</p>
                        <span className="text-[11px] font-medium text-gray-400">No: {app.application_number}</span>
                      </TableCell>
                      <TableCell className="py-5 px-4 text-start text-theme-sm font-medium text-gray-600 dark:text-gray-400">
                        {app.pembimbing?.teacher?.name || 'Belum diplot'}
                      </TableCell>
                      <TableCell className="py-5 px-4 text-center">
                        <div className="flex justify-center">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-success-50 text-success-700 text-xs font-extrabold border-2 border-success-200">
                            {app.students?.length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-4 text-start text-theme-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-1">
                          <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{app.suggested_start_date}</span>
                          <span className="text-gray-300">-</span>
                          <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{app.suggested_end_date}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-4 text-start">
                        {renderStatusBadge(app.status)}
                      </TableCell>
                      <TableCell className="py-5 px-4 text-center">
                        <button
                          onClick={() => handleOpenForm(app)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${app.status === 'draft'
                            ? "bg-brand-500 text-white hover:bg-brand-600"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                          {app.status === 'draft' ? 'Edit' : 'Detail'}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="px-4 py-4">
            <TablePagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
          </div>
        </div>
      </div>
    </>
  );
}