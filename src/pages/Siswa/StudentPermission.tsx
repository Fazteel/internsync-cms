import React, { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useStudentPlacementStore } from "../../store/Siswa/useStudentPlacementStore";
import { usePermissionStore } from "../../store/Siswa/usePermissionStore";
import { useLogbookStore } from "../../store/Siswa/useLogbookStore";
import { PageHeader, SelectInput, TableDataState, TablePagination, TableTopControls } from "../../components/common/SharedUI";

const getLocalYYYYMMDD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatTanggalLokal = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function StudentPermission() {
    const { penempatanData, fetchMyPlacement } = useStudentPlacementStore();
    const { permissions, isLoading, fetchPermissions, submitPermission } = usePermissionStore();
    const { logbookEntries, fetchLogbooks } = useLogbookStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [type, setType] = useState("sick");
    const [reason, setReason] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [filterStatus, setFilterStatus] = useState("All");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [alertInfo, setAlertInfo] = useState({ show: false, variant: "success" as "success" | "error" | "warning", title: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMyPlacement();
        fetchPermissions();
        fetchLogbooks();
    }, [fetchMyPlacement, fetchLogbooks, fetchPermissions]);

    const validDates = useMemo(() => {
        if (!penempatanData?.raw_start_date) return [];

        const lastLogDate = logbookEntries.length > 0
            ? new Date(Math.max(...logbookEntries.map(e => new Date(e.date).getTime())))
            : new Date(penempatanData.raw_start_date);

        const startSearch = new Date(lastLogDate);
        startSearch.setDate(startSearch.getDate() + 1);

        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() + 7);

        const dates = [];
        const curr = new Date(startSearch);
        while (curr <= limitDate) {
            if (curr.getDay() !== 0) {
                dates.push(getLocalYYYYMMDD(curr));
            }
            curr.setDate(curr.getDate() + 1);
        }
        return dates;
    }, [penempatanData, logbookEntries]);

    const filteredData = permissions.filter(p => filterStatus === "All" ? true : p.status.toLowerCase() === filterStatus.toLowerCase());
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleOpenModal = () => {
        if (validDates.length === 0) {
            setAlertInfo({ show: true, variant: "warning", title: "Info", message: "Belum ada slot tanggal tersedia untuk izin." });
            return;
        }
        setStartDate(validDates[0]);
        setEndDate(validDates[0]);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsSubmitting(true);
        const data = new FormData();
        data.append("start_date", startDate);
        data.append("end_date", endDate);
        data.append("type", type);
        data.append("reason", reason);
        data.append("attachment", file);

        try {
            await submitPermission(data);
            setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: "Pengajuan izin berhasil dikirim." });
            setFile(null);
        } catch {
            setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Gagal mengajukan izin." });
        } finally {
            setIsModalOpen(false);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <PageMeta title="Izin & Sakit | InternSync" description="Halaman pengajuan izin dan sakit." />

            <div className="space-y-6">
                {alertInfo.show && <div className="animate-fade-in"><Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} /></div>}

                <PageHeader title="Izin & Sakit" description="Ajukan izin atau sakit jika berhalangan PKL.">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <SelectInput value={filterStatus} onChange={(val) => setFilterStatus(val)}>
                            <option value="All">Semua</option>
                            <option value="Pending">Menunggu</option>
                            <option value="Approved">Disetujui</option>
                            <option value="Rejected">Ditolak</option>
                        </SelectInput>
                        <button onClick={handleOpenModal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 font-bold text-white hover:bg-brand-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Ajukan Izin
                        </button>
                    </div>
                </PageHeader>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
                    <TableTopControls rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} totalData={filteredData.length} setCurrentPage={setCurrentPage} />
                    <div className="max-w-full overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                <TableRow>
                                    <TableCell isHeader className="py-3 px-4 text-theme-xs">Rentang Tanggal</TableCell>
                                    <TableCell isHeader className="py-3 px-4 text-theme-xs">Tipe</TableCell>
                                    <TableCell isHeader className="py-3 px-4 text-theme-xs">Alasan</TableCell>
                                    <TableCell isHeader className="py-3 px-4 text-theme-xs">Status</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                <TableDataState isLoading={isLoading} isEmpty={paginatedData.length === 0} colSpan={4}>
                                    {paginatedData.map((p) => (
                                        <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="py-4 px-4 text-theme-sm text-center font-medium">
                                                {p.start_date === p.end_date ? formatTanggalLokal(p.start_date) : `${formatTanggalLokal(p.start_date)} - ${formatTanggalLokal(p.end_date)}`}
                                            </TableCell>
                                            <TableCell className="py-4 px-4 text-theme-sm text-center font-bold text-brand-600">{p.type}</TableCell>
                                            <TableCell className="py-4 px-4 text-theme-sm text-center max-w-xs truncate text-gray-500">{p.reason}</TableCell>
                                            <TableCell className="py-4 px-4">
                                                <Badge color={p.status === "Approved" ? "success" : p.status === "Pending" ? "warning" : "error"}>{p.status}</Badge>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[650px] p-0 overflow-hidden" showCloseButton={false}>
                <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50 px-6 py-4 dark:bg-gray-800">
                    <h3 className="text-lg font-bold text-brand-800 dark:text-white">Form Pengajuan Izin</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold">Mulai Izin <span className="text-error-500">*</span></label>
                                <SelectInput value={startDate} onChange={(val) => { setStartDate(val); if (new Date(val) > new Date(endDate)) setEndDate(val); }}>
                                    {validDates.map(d => <option key={d} value={d}>{formatTanggalLokal(d)}</option>)}
                                </SelectInput>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold">Sampai <span className="text-error-500">*</span></label>
                                <SelectInput value={endDate} onChange={(val) => setEndDate(val)}>
                                    {validDates.filter(d => new Date(d) >= new Date(startDate)).map(d => (
                                        <option key={d} value={d}>{formatTanggalLokal(d)}</option>
                                    ))}
                                </SelectInput>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold">Tipe <span className="text-error-500">*</span></label>
                            <SelectInput value={type} onChange={(val) => setType(val)}>
                                <option value="sick">Sakit</option>
                                <option value="leave">Izin</option>
                            </SelectInput>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold">Alasan <span className="text-error-500">*</span></label>
                            <textarea rows={3} className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-brand-500" placeholder="Jelaskan alasan detail..." onChange={(e) => setReason(e.target.value)} required />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Bukti Lampiran (png/jpg/jpeg) <span className="text-error-500">*</span></label>
                            <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white hover:bg-brand-50 transition-colors dark:bg-gray-900">
                                <div className="flex flex-col items-center justify-center pb-4 pt-4 text-center px-4">
                                    <div className="bg-brand-50 p-2 rounded-full mb-2 text-brand-500">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    </div>
                                    <p className="text-xs text-gray-500">{file ? `File: ${file.name}` : "Klik untuk upload bukti (Max. 2MB)"}</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold">Batal</button>
                        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600 shadow-md">
                            {isSubmitting ? "Mengirim..." : "Kirim Izin"}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}