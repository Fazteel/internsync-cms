import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SelectInput, TableDataState, TablePagination, TableTopControls } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index"; // Pastiin path modal bener
import { usePermissionStore } from "../../store/Siswa/usePermissionStore";

type FilterType = "All" | "pending" | "approved" | "rejected";

export default function SupervisorPermission() {
    const { permissions, isLoading, fetchPermissions, verifyPermission } = usePermissionStore();

    const [filterStatus, setFilterStatus] = useState<FilterType>("All");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [alertInfo, setAlertInfo] = useState({ show: false, variant: "success" as "success" | "error" | "warning", title: "", message: "" });

    // --- STATE MODAL KONFIRMASI ---
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ id: number, status: string, name: string } | null>(null);

    useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

    const filteredData = permissions.filter(p => filterStatus === "All" ? true : p.status.toLowerCase() === filterStatus);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // Buka modal alih-alih window.confirm
    const openConfirmModal = (id: number, status: string, name: string) => {
        setPendingAction({ id, status, name });
        setIsConfirmModalOpen(true);
    };

    const handleExecuteAction = async () => {
        if (!pendingAction) return;

        setIsSubmittingAction(true);
        try {
            await verifyPermission(pendingAction.id, pendingAction.status);
            setAlertInfo({ 
                show: true, 
                variant: pendingAction.status === 'approved' ? 'success' : 'error', 
                title: "Berhasil", 
                message: `Izin ${pendingAction.name} telah ${pendingAction.status === 'approved' ? 'disetujui' : 'ditolak'}.` 
            });
        } catch {
            setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Gagal memproses verifikasi." });
        } finally {
            setIsSubmittingAction(false);
            setIsConfirmModalOpen(false);
            setPendingAction(null);
        }
    };

    return (
        <>
            <PageMeta title="Verifikasi Izin | InternSync" description="Halaman verifikasi izin dan sakit siswa bimbingan." />

            <div className="space-y-6">
                {alertInfo.show && (
                    <div className="animate-fade-in"><Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} /></div>
                )}

                <PageHeader title="Verifikasi Izin & Sakit" description="Periksa bukti dan berikan persetujuan untuk ketidakhadiran siswa bimbingan Anda.">
                    <SelectInput value={filterStatus} onChange={(val) => setFilterStatus(val as FilterType)}>
                        <option value="All">Semua Status</option>
                        <option value="pending">Menunggu Verifikasi</option>
                        <option value="approved">Disetujui</option>
                        <option value="rejected">Ditolak</option>
                    </SelectInput>
                </PageHeader>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
                    <TableTopControls rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} totalData={filteredData.length} setCurrentPage={setCurrentPage} />
                    <div className="max-w-full overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                <TableRow>
                                    <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-start text-theme-xs">Siswa</TableCell>
                                    <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-start text-theme-xs min-w-[150px]">Periode Izin</TableCell>
                                    <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-start text-theme-xs">Bukti</TableCell>
                                    <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-start text-theme-xs">Status</TableCell>
                                    <TableCell isHeader className="py-3 px-4 font-semibold text-gray-500 text-center text-theme-xs">Aksi</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                <TableDataState isLoading={isLoading} isEmpty={paginatedData.length === 0} colSpan={5}>
                                    {paginatedData.map((p) => (
                                        <TableRow key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                            <TableCell className="py-4 px-4">
                                                <p className="font-bold text-gray-800 dark:text-white/90 text-theme-sm">{p.studentName}</p>
                                            </TableCell>
                                            <TableCell className="py-4 px-4 text-theme-sm whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <p className="font-bold text-gray-800 dark:text-white/90">
                                                        {p.start_date === p.end_date ? p.start_date : `${p.start_date} - ${p.end_date}`}
                                                    </p>
                                                    <span className={`text-[10px] font-bold uppercase ${p.type === 'Sakit' ? 'text-error-600' : 'text-warning-600'}`}>
                                                        {p.type} {p.start_date !== p.end_date && " (Multi-day)"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <a href={p.attachment} target="_blank" rel="noreferrer" className="text-brand-600 text-xs font-bold hover:underline flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                    Lihat Bukti
                                                </a>
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <Badge color={p.status === "Approved" ? "success" : p.status === "Pending" ? "warning" : "error"}>{p.status}</Badge>
                                            </TableCell>
                                            <TableCell className="py-4 px-4 text-center">
                                                {p.status === "Pending" ? (
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => openConfirmModal(p.id, "approved", p.studentName)} className="bg-success-500 text-white p-1.5 rounded-md hover:bg-success-600 shadow-sm transition-all active:scale-95">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                        </button>
                                                        <button onClick={() => openConfirmModal(p.id, "rejected", p.studentName)} className="bg-error-500 text-white p-1.5 rounded-md hover:bg-error-600 shadow-sm transition-all active:scale-95">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                        </button>
                                                    </div>
                                                ) : <span className="text-gray-400 italic text-xs">Selesai diproses</span>}
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

            {/* MODAL KONFIRMASI AKSI */}
            <Modal isOpen={isConfirmModalOpen} onClose={() => !isSubmittingAction && setIsConfirmModalOpen(false)} className="max-w-md p-0 overflow-hidden" showCloseButton={false}>
                <div className="p-6">
                    <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${pendingAction?.status === 'approved' ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'}`}>
                        {pendingAction?.status === 'approved' ? (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        )}
                    </div>
                    <h3 className="mb-2 text-center text-lg font-bold text-gray-800 dark:text-white">
                        Konfirmasi {pendingAction?.status === 'approved' ? 'Persetujuan' : 'Penolakan'}
                    </h3>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Apakah Anda yakin ingin <strong>{pendingAction?.status === 'approved' ? 'menyetujui' : 'menolak'}</strong> pengajuan izin dari <strong>{pendingAction?.name}</strong>? Tindakan ini akan mengirimkan notifikasi ke siswa.
                    </p>

                    <div className="mt-6 flex gap-3">
                        <button 
                            disabled={isSubmittingAction}
                            onClick={() => setIsConfirmModalOpen(false)} 
                            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            Batal
                        </button>
                        <button 
                            disabled={isSubmittingAction}
                            onClick={handleExecuteAction}
                            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all ${pendingAction?.status === 'approved' ? 'bg-success-600 hover:bg-success-700' : 'bg-error-600 hover:bg-error-700'}`}
                        >
                            {isSubmittingAction ? "Memproses..." : "Ya, Lanjutkan"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}