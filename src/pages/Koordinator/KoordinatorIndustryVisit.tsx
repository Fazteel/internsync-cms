import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SelectInput, TableDataState, TablePagination, TableTopControls } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import DatePicker from "../../components/form/date-picker";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { useKoordinatorIndustryVisitStore, KoordinatorVisitRecord } from "../../store/Koordinator/useKoordinatorIndustryVisitStore";

type AlertVariant = "success" | "warning" | "info" | "error";
type FilterStatusType = "All" | "Approved" | "Pending" | "Rejected";

interface AlertInfo {
    show: boolean;
    variant: AlertVariant;
    title: string;
    message: string;
}

export default function KoordinatorIndustryVisit() {
    const {
        visits,
        formOptions,
        fetchVisits,
        fetchFormOptions,
        submitVisit,
        isLoading
    } = useKoordinatorIndustryVisitStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<KoordinatorVisitRecord | null>(null);

    const [pembimbingId, setPembimbingId] = useState("");
    const [industryId, setIndustryId] = useState("");
    const [date, setDate] = useState("");
    const [purpose, setPurpose] = useState("");

    const [filterStatus, setFilterStatus] = useState<FilterStatusType>("All");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [alertInfo, setAlertInfo] = useState<AlertInfo>({ show: false, variant: "success", title: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchVisits();
        fetchFormOptions();
    }, [fetchVisits, fetchFormOptions]);

    const handleOpenAddModal = () => {
        if (formOptions.industries.length === 0 || formOptions.pembimbings.length === 0) {
            setAlertInfo({ show: true, variant: "warning", title: "Data Tidak Lengkap", message: "Belum ada relasi penempatan siswa di wilayah Anda." });
            return;
        }
        setPembimbingId("");
        setIndustryId("");
        setDate("");
        setPurpose("");
        setIsModalOpen(true);
    };

    const handleOpenDetailModal = (visit: KoordinatorVisitRecord) => {
        setSelectedVisit(visit);
        setIsDetailModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDetailModalOpen(false);
        setSelectedVisit(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) {
            setAlertInfo({ show: true, variant: "warning", title: "Tanggal Kosong", message: "Silakan pilih tanggal kunjungan." });
            return;
        }

        setIsSubmitting(true);
        try {
            await submitVisit({
                pembimbing_id: pembimbingId,
                industry_id: industryId,
                planned_date: date,
                purpose
            });
            setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: "Pengajuan kunjungan dikirim ke Hubin." });
        } catch (err: unknown) {
            console.error("Error submitting form:", err);
            const errMsg = (err as {
                response?: { data?: { message?: string } }
            }).response?.data?.message || "Gagal mengirim pengajuan.";
            setAlertInfo({ show: true, variant: "error", title: "Gagal", message: errMsg });
        } finally {
            handleCloseModals();
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (alertInfo.show && alertInfo.variant !== "info") {
            const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
            return () => clearTimeout(timer);
        }
    }, [alertInfo.show, alertInfo.variant]);

    const filteredVisit = visits.filter((v) => {
        const matchStatus = filterStatus === "All" ? true : v.status === filterStatus;
        return matchStatus;
    });

    const totalPages = Math.ceil(filteredVisit.length / rowsPerPage);
    const paginatedData = filteredVisit.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <>
            <PageMeta title="Kelola Kunjungan | Sistem Manajemen PKL" description="Atur jadwal kunjungan monitoring ke industri." />

            <div className="space-y-6">
                {alertInfo.show && <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />}

                <PageHeader title="Kelola Kunjungan Industri" description="Ajukan dan atur jadwal penugasan monitoring Pembimbing ke industri mitra.">
                    <SelectInput
                        value={filterStatus}
                        onChange={(val) => {
                            setFilterStatus(val as FilterStatusType);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="All">Semua Status</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                    </SelectInput>
                    <button onClick={handleOpenAddModal} className="bg-brand-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-brand-600 transition shadow-sm flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Ajukan Kunjungan
                    </button>
                </PageHeader>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                    <TableTopControls rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} totalData={filteredVisit.length} setCurrentPage={setCurrentPage} />

                    <div className="max-w-full overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="py-3 px-4 text-theme-xs text-start w-[20%]">Pembimbing / Industri</TableCell>
                                    <TableCell isHeader className="py-3 px-4 text-theme-xs text-start w-[20%]">Tanggal Rencana</TableCell>
                                    <TableCell isHeader className="py-3 px-4 text-theme-xs text-start w-[20%]">Tujuan Kunjungan</TableCell>
                                    <TableCell isHeader className="py-3 px-4 text-theme-xs text-center w-[20%]">Status</TableCell>
                                    <TableCell isHeader className="py-3 px-4 text-theme-xs text-center w-[20%]">Aksi</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                <TableDataState isLoading={isLoading} isEmpty={visits.length === 0} colSpan={5} emptyText="Belum ada riwayat pengajuan kunjungan.">
                                    {paginatedData.map((visit) => (
                                        <TableRow key={visit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                            <TableCell className="py-4 px-4 text-start align-top whitespace-nowrap">
                                                <p className="font-bold text-gray-800 dark:text-white/90">{visit.pembimbing_name}</p>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{visit.industry}</span>
                                            </TableCell>
                                            <TableCell className="py-4 px-4 text-start text-sm text-gray-600 dark:text-gray-300 align-top">
                                                {visit.plannedDate}
                                            </TableCell>
                                            <TableCell className="py-4 px-4 text-theme-sm text-start text-gray-600 dark:text-gray-300 align-top">
                                                <p className="line-clamp-2 leading-relaxed" title={visit.purpose}>
                                                    {visit.purpose}
                                                </p>
                                            </TableCell>
                                            <TableCell className="py-4 px-4 text-center align-top">
                                                <Badge color={visit.status === "Approved" ? "success" : visit.status === "Pending" ? "warning" : "error"}>
                                                    {visit.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 px-4 text-center align-top whitespace-nowrap">
                                                <button
                                                    onClick={() => handleOpenDetailModal(visit)}
                                                    className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    Detail
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModals} className="max-w-lg p-0 overflow-hidden" showCloseButton={false}>
                <div className="bg-brand-50 border-b border-brand-100 px-6 py-4 dark:bg-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-brand-800 dark:text-white">Form Penugasan Kunjungan</h3>
                    <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 block mb-1.5">Pilih Guru Pembimbing</label>
                        <SelectInput value={pembimbingId} onChange={setPembimbingId} required>
                            <option value="" disabled>Pilih Pembimbing</option>
                            {formOptions.pembimbings.map(guru => <option key={guru.id} value={guru.id}>{guru.name}</option>)}
                        </SelectInput>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 block mb-1.5">Lokasi Industri</label>
                        <SelectInput value={industryId} onChange={setIndustryId} required>
                            <option value="" disabled>Pilih Industri</option>
                            {formOptions.industries.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
                        </SelectInput>
                    </div>
                    <DatePicker id="dp-visit-koordinator" label={<span className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Tanggal Rencana Kunjungan</span>} onChange={(_, str) => setDate(str)} />
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 block mb-1.5">Agenda / Tujuan</label>
                        <textarea rows={4} value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" required placeholder="Contoh: Monitoring rutin bulan ke-3, menjenguk siswa sakit, dll." />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                        <button type="button" onClick={handleCloseModals} className="px-5 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
                        <button type="submit" disabled={isSubmitting} className="bg-brand-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-theme-xs">
                            {isSubmitting ? "Mengirim..." : "Ajukan Penugasan"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL DETAIL */}
            <Modal isOpen={isDetailModalOpen} onClose={handleCloseModals} className="max-w-lg p-0 overflow-hidden" showCloseButton={false}>
                <div className={`px-6 py-4 border-b flex justify-between items-center ${selectedVisit?.status === "Rejected" ? "bg-error-50 border-error-100 dark:bg-error-900/20 dark:border-error-800/30" : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"}`}>
                    <h3 className={`text-lg font-bold ${selectedVisit?.status === "Rejected" ? "text-error-700 dark:text-error-500" : "text-gray-800 dark:text-white"}`}>
                        Detail Penugasan Kunjungan
                    </h3>
                    <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pembimbing</span>
                            <p className="font-bold text-gray-800 dark:text-white mt-1">{selectedVisit?.pembimbing_name}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Industri Tujuan</span>
                            <p className="font-bold text-gray-800 dark:text-white mt-1">{selectedVisit?.industry}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-700">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tanggal Rencana</span>
                            <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-1">{selectedVisit?.plannedDate}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-700">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Pengajuan</span>
                            <div className="mt-1">
                                <Badge color={selectedVisit?.status === "Approved" ? "success" : selectedVisit?.status === "Pending" ? "warning" : "error"}>
                                    {selectedVisit?.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            Agenda / Tujuan
                        </span>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{selectedVisit?.purpose}</p>
                    </div>

                    {selectedVisit?.status === "Rejected" && selectedVisit?.feedback && (
                        <div className="bg-error-50 p-4 rounded-xl border border-error-100 dark:bg-error-900/10 dark:border-error-800/30">
                            <span className="text-xs font-bold text-error-700 dark:text-error-500 uppercase tracking-wider flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
                                Alasan Penolakan Hubin
                            </span>
                            <p className="text-sm text-error-600 dark:text-error-400 italic mt-2 leading-relaxed">"{selectedVisit.feedback}"</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-6 pt-0 border-t border-gray-100 dark:border-gray-800 mt-4">
                    <button onClick={handleCloseModals} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 px-6 py-2 mt-4 rounded-lg font-bold transition-colors">Tutup</button>
                </div>
            </Modal>
        </>
    );
}