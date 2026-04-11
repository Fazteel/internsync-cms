import { useState, useEffect } from "react";
import { useInternshipStore, InternshipApplication, AppStudent } from "../../store/useInternshipStore";
import { useUserStore } from "../../store/Admin/useUserStore";
import { SelectInput, SearchInput } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Modal } from "../../components/ui/modal/index";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { CalenderIcon } from "../../icons";
import { useIndustryStore } from "../../store/Hubin/useIndustryStore";
import DatePicker from "./date-picker";

interface Props {
    initialData?: InternshipApplication | null;
    onBack: () => void;
    viewMode?: 'koordinator_pengajuan' | 'hubin_pengajuan' | 'koordinator_pengiriman' | 'hubin_pengiriman' | 'koordinator_riwayat';
}

interface RenderedStudent extends AppStudent {
    profile_id?: number;
    jurusan?: string;
    major?: string | { major_name: string };
}

export default function InternshipForm({ initialData, onBack, viewMode = 'koordinator_pengajuan' }: Props) {
    const { submitApplication, submitPlacement, processHubinApproval, extendInternship, withdrawStudent } = useInternshipStore();
    const { industries, fetchIndustries } = useIndustryStore();
    const { users, fetchUsers } = useUserStore();

    const [industryId, setIndustryId] = useState<number | string>(initialData?.industry_id || "");
    const [pembimbingId, setPembimbingId] = useState<number | string>(initialData?.pembimbing_id || "");
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>(
        initialData?.students?.map((s: AppStudent) => s.id) || []
    );

    const [departureDate, setDepartureDate] = useState(initialData?.departure_date || "");
    const [durationOption, setDurationOption] = useState(initialData?.duration_option || "");
    const [finalEndDate, setFinalEndDate] = useState(initialData?.final_end_date || "");

    const isApprovedPengajuan = ['pengajuan', 'menunggu_acc_pengiriman', 'pengiriman'].includes(initialData?.status || '');
    const isApprovedPengiriman = initialData?.status === 'pengiriman';

    const isReadOnly =
        viewMode.startsWith('hubin') ||
        viewMode === 'koordinator_riwayat' ||
        (viewMode === 'koordinator_pengajuan' && isApprovedPengajuan) ||
        (viewMode === 'koordinator_pengiriman' && isApprovedPengiriman);

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [studentSearchTerm, setStudentSearchTerm] = useState("");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [hubinActionType, setHubinActionType] = useState<'approve' | 'reject' | null>(null);

    const [alertInfo, setAlertInfo] = useState({ show: false, variant: "success" as "success" | "error" | "warning" | "info", title: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
    const [extendStudentId, setExtendStudentId] = useState<number | null>(null);
    const [extendDuration, setExtendDuration] = useState("");
    const [extendCustomDate, setExtendCustomDate] = useState("");

    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawStudentId, setWithdrawStudentId] = useState<number | null>(null);

    useEffect(() => {
        if (initialData) {
            setDepartureDate(initialData.departure_date || "");
            setDurationOption(initialData.duration_option || "");
            setFinalEndDate(initialData.final_end_date || "");
        }
    }, [initialData]);

    useEffect(() => {
        if (viewMode.startsWith('koordinator') && !isReadOnly) {
            fetchIndustries();
            fetchUsers("", "All");
        }
    }, [fetchIndustries, fetchUsers, viewMode, isReadOnly]);

    useEffect(() => {
        if (alertInfo.show && alertInfo.variant !== "info") {
            const timer = setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 5000);
            return () => clearTimeout(timer);
        }
    }, [alertInfo.show, alertInfo.variant]);

    const teachers = users.filter(u => u.role === "Pembimbing");
    const allStudents = users.filter(u => u.role === "Siswa" && !u.is_pkl);

    const availableStudents = allStudents.filter(s =>
        !selectedStudentIds.includes(s.profile_id) &&
        (s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) || s.identifier.includes(studentSearchTerm))
    );

    const studentsToRender = isReadOnly ? (initialData?.students || []) : allStudents.filter(s => selectedStudentIds.includes(s.profile_id));

    const handleKoordinatorAction = async (action: 'draft' | 'pengajuan' | 'batal') => {
        if (action === 'batal') return onBack();

        setIsSubmitting(true);
        try {
            const payload = { id: initialData?.id, industry_id: Number(industryId), pembimbing_id: Number(pembimbingId), student_ids: selectedStudentIds, action };
            await submitApplication(payload);
            onBack();
        } catch (error) {
            console.error("Gagal submit aplikasi:", error);
            setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Terjadi kesalahan saat menyimpan pengajuan." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePengirimanAction = async (action: 'batal' | 'simpan' | 'pengiriman') => {
        if (action === 'batal') return onBack();
        if (!initialData?.id) return;

        setIsSubmitting(true);
        try {
            const payload = { departure_date: departureDate, duration_option: durationOption, final_end_date: durationOption === 'custom' ? finalEndDate : null, action };
            await submitPlacement(initialData.id, payload);
            onBack();
        } catch (error) {
            console.error("Gagal submit pengiriman:", error);
            setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Terjadi kesalahan saat memproses data pengiriman." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleHubinAction = (action: 'approve' | 'reject') => {
        setHubinActionType(action);
        setIsConfirmModalOpen(true);
    };

    const executeHubinAction = async () => {
        if (hubinActionType && initialData?.id && processHubinApproval) {
            setIsSubmitting(true);
            try {
                const approvalType = viewMode.includes('pengiriman') ? 'pengiriman' : 'pengajuan';
                await processHubinApproval(initialData.id, hubinActionType, approvalType);
                setIsConfirmModalOpen(false);
                onBack();
            } catch (error) {
                console.error("Gagal proses approval hubin:", error);
                setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Terjadi kesalahan saat memproses dokumen." });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleDownloadLetter = (path?: string) => {
        if (!path) return;
        window.open(`http://localhost:8000/storage/${path}`, '_blank');
    };

    const addStudentToList = (profileId: number) => {
        if (!selectedStudentIds.includes(profileId)) setSelectedStudentIds([...selectedStudentIds, profileId]);
        setStudentSearchTerm("");
    };

    const removeStudentFromList = (profileId: number) => {
        setSelectedStudentIds(selectedStudentIds.filter(item => item !== profileId));
    };

    const openExtendModal = (id: number) => {
        setExtendStudentId(id);
        setExtendDuration("");
        setExtendCustomDate("");
        setIsExtendModalOpen(true);
    };

    const confirmExtendIndividual = async () => {
        if (!extendDuration || (extendDuration === 'custom' && !extendCustomDate)) {
            setAlertInfo({ show: true, variant: "warning", title: "Peringatan", message: "Pilih opsi durasi yang benar." });
            return;
        }
        setIsSubmitting(true);
        try {
            await extendInternship({ type: 'individual', id: extendStudentId as number, duration_option: extendDuration, custom_end_date: extendCustomDate });
            setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: "Perpanjangan berhasil." });
            setIsExtendModalOpen(false);
            onBack();
        } catch (error) {
            console.error("Gagal extend siswa:", error);
            setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Gagal memperpanjang masa PKL siswa." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openWithdrawModal = (id: number) => {
        setWithdrawStudentId(id);
        setIsWithdrawModalOpen(true);
    };

    const confirmWithdrawIndividual = async () => {
        setIsSubmitting(true);
        try {
            await withdrawStudent(withdrawStudentId as number);
            setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: "Siswa berhasil ditarik." });
            setIsWithdrawModalOpen(false);
            onBack();
        } catch (error) {
            console.error("Gagal withdraw siswa:", error);
            setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Terjadi kesalahan sistem saat menarik siswa." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getApplicationStatus = (status?: string): { color: 'gray' | 'warning' | 'success' | 'error', label: string } => {
        switch (status) {
            case 'draft': return { color: 'gray', label: 'Draft' };
            case 'menunggu_acc_pengajuan': return { color: 'warning', label: 'Menunggu' };
            case 'pengajuan': return { color: 'success', label: 'Disetujui' };
            case 'menunggu_acc_pengiriman': return { color: 'success', label: 'Disetujui' };
            case 'pengiriman': return { color: 'success', label: 'Disetujui' };
            case 'ditolak': return { color: 'error', label: 'Ditolak' };
            case 'batal': return { color: 'error', label: 'Dibatalkan' };
            default: return { color: 'gray', label: status || 'Draft' };
        }
    };

    const getPlacementsStatus = (status?: string): { color: 'gray' | 'warning' | 'success' | 'error', label: string } => {
        switch (status) {
            case 'pengajuan': return { color: 'gray', label: 'Draft Pengiriman' };
            case 'menunggu_acc_pengiriman': return { color: 'warning', label: 'Menunggu' };
            case 'pengiriman': return { color: 'success', label: 'Aktif' };
            case 'ditolak': return { color: 'error', label: 'Ditolak' };
            case 'batal': return { color: 'error', label: 'Dibatalkan' };
            default: return { color: 'gray', label: status || 'Draft' };
        }
    };

    const isPlacementView = viewMode.includes('pengiriman') || viewMode === 'koordinator_riwayat';
    const statusDisplay = isPlacementView ? getPlacementsStatus(initialData?.status) : getApplicationStatus(initialData?.status);

    let headerTitle = "Buat Pengajuan Baru";
    if (viewMode.includes('hubin')) headerTitle = "Evaluasi Dokumen PKL";
    else if (viewMode === 'koordinator_riwayat') headerTitle = "Riwayat Penempatan PKL";
    else if (viewMode === 'koordinator_pengiriman') headerTitle = "Proses Pengiriman PKL";
    else if (isApprovedPengajuan && viewMode === 'koordinator_pengajuan') headerTitle = "Detail Pengajuan PKL";
    else if (initialData) headerTitle = "Lanjut Edit Pengajuan";

    const getCustomDuration = (start?: string, end?: string) => {
        if (!start || !end) return "Custom Tanggal";
        const diffDays = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return "Tanggal Tidak Valid";
        if (diffDays >= 30) {
            const months = Math.floor(diffDays / 30);
            return `${months} Bulan ${diffDays % 30 > 0 ? `${diffDays % 30} Hari` : ''}`;
        }
        return `${diffDays} Hari`;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {alertInfo.show && <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">{headerTitle}</h2>
                        <p className="text-sm text-gray-500">No: {initialData?.application_number || "Otomatis oleh Sistem"}</p>
                    </div>
                </div>
                <Badge color={statusDisplay.color}>Status: {statusDisplay.label}</Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                    <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                            <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Tujuan Industri & Pembimbing</h3>
                    </div>
                    <div className="space-y-5">
                        {isReadOnly ? (
                            <>
                                <div>
                                    <span className="block text-xs font-semibold uppercase text-gray-500">Industri Tujuan PKL</span>
                                    <p className="font-bold text-gray-800 mt-1">{initialData?.industry?.name || '-'}</p>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold uppercase text-gray-500">Guru Pembimbing Sekolah</span>
                                    <p className="font-bold text-gray-800 mt-1">{initialData?.pembimbing?.teacher?.name || '-'}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Industri Tujuan PKL</label>
                                    <SelectInput value={industryId} onChange={(val) => setIndustryId(val)}>
                                        <option value="">Pilih Industri</option>
                                        {industries.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
                                    </SelectInput>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Guru Pembimbing Sekolah</label>
                                    <SelectInput value={pembimbingId} onChange={(val) => setPembimbingId(val)}>
                                        <option value="">Pilih Pembimbing</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </SelectInput>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                    <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-900/20">
                            <CalenderIcon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                            {viewMode.includes('pengiriman') || viewMode === 'koordinator_riwayat' ? 'Waktu Keberangkatan & Durasi' : 'Estimasi Waktu Pelaksanaan'}
                        </h3>
                    </div>

                    {viewMode.includes('pengajuan') && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Mulai (H+1)</span>
                                <p className="font-bold text-gray-800 dark:text-white/90 italic">{initialData?.suggested_start_date || "Otomatis Terbit"}</p>
                            </div>
                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tanggal Berakhir</span>
                                <p className="font-bold text-gray-800 dark:text-white/90">{initialData?.suggested_end_date || "Otomatis Terhitung"}</p>
                            </div>
                            <div className="col-span-2 p-4 bg-brand-50/50 rounded-xl border border-brand-100">
                                <p className="text-xs text-brand-700 leading-relaxed italic">* Periode ini adalah estimasi pengajuan (90 hari). Tanggal keberangkatan resmi ditentukan pada tahap "Pengiriman PKL".</p>
                            </div>
                        </div>
                    )}

                    {(viewMode.includes('pengiriman') || viewMode === 'koordinator_riwayat') && (
                        <div className="flex flex-col gap-4">
                            {isReadOnly ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                                        <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tgl Keberangkatan</span>
                                        <p className="font-bold text-gray-800 dark:text-white/90 italic">{initialData?.departure_date || "-"}</p>
                                    </div>
                                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                                        <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tanggal Selesai</span>
                                        <p className="font-bold text-gray-800 dark:text-white/90">{initialData?.final_end_date || "-"}</p>
                                    </div>
                                    <div className="col-span-2 p-4 bg-brand-50/50 rounded-xl border border-brand-100">
                                        <p className="text-xs text-brand-700 leading-relaxed italic">
                                            * Durasi Pelaksanaan: <b>{
                                                initialData?.duration_option === '3_bulan' ? '3 Bulan' :
                                                    initialData?.duration_option === '6_bulan' ? '6 Bulan' :
                                                        getCustomDuration(isReadOnly ? initialData?.departure_date : departureDate, isReadOnly ? initialData?.final_end_date : finalEndDate)
                                            }</b>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <DatePicker id="dp-departure" label={<span className="mb-1.5 block text-xs font-bold text-gray-500 uppercase">Tgl Keberangkatan</span>} onChange={(_, str) => setDepartureDate(str as string)} value={departureDate} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Opsi Durasi</label>
                                        <SelectInput value={durationOption} onChange={(val) => setDurationOption(val)}>
                                            <option value="">Pilih Durasi</option>
                                            <option value="3_bulan">3 Bulan</option>
                                            <option value="6_bulan">6 Bulan</option>
                                            <option value="custom">Custom Tanggal</option>
                                        </SelectInput>
                                    </div>
                                    {durationOption === 'custom' && (
                                        <div className="sm:col-span-2">
                                            <DatePicker id="dp-final-end" label={<span className="mb-1.5 block text-xs font-bold text-gray-500 uppercase">Tgl Selesai PKL</span>} onChange={(_, str) => setFinalEndDate(str as string)} value={finalEndDate} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 dark:bg-success-900/20">
                                <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Daftar Siswa Prakerin</h3>
                                <p className="text-xs text-gray-500">Daftar siswa yang akan dikirim ke lokasi industri</p>
                            </div>
                        </div>
                        {!isReadOnly && (
                            <button type="button" onClick={() => setIsSearchModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 transition-colors shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Tambah Siswa
                            </button>
                        )}
                    </div>

                    <div className="overflow-hidden border border-gray-100 rounded-xl">
                        <Table>
                            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/20">
                                <TableRow>
                                    <TableCell isHeader className="py-4 text-theme-xs text-center w-12">No</TableCell>
                                    <TableCell isHeader className="py-4 text-theme-xs">Nama Siswa</TableCell>
                                    <TableCell isHeader className="py-4 text-theme-xs">NIS</TableCell>
                                    <TableCell isHeader className="py-4 text-theme-xs">Kelas</TableCell>
                                    <TableCell isHeader className="py-4 text-theme-xs">Jurusan</TableCell>
                                    <TableCell isHeader className="py-4 text-theme-xs text-center w-60">Aksi</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentsToRender.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="py-10 text-center text-gray-400 italic">Belum ada siswa terpilih.</TableCell></TableRow>
                                ) : (
                                    studentsToRender.map((s: RenderedStudent, index: number) => {
                                        const studentId = s.profile_id || s.id;
                                        const studentNis = s.identifier || s.nis;
                                        const studentJurusan = s.jurusan || (typeof s.major === "object" ? s.major?.major_name : s.major);

                                        return (
                                            <TableRow key={studentId} className="hover:bg-gray-50/30 transition-colors">
                                                <TableCell className="py-4 text-center font-medium text-gray-500">{index + 1}</TableCell>
                                                <TableCell className="py-4 text-center font-bold text-gray-800 dark:text-white/90">{s.name}</TableCell>
                                                <TableCell className="py-4 text-center text-theme-sm text-gray-600">{studentNis}</TableCell>
                                                <TableCell className="py-4 text-center text-theme-sm text-gray-600">{s.kelas}</TableCell>
                                                <TableCell className="py-4 text-center">
                                                    <span className="text-theme-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100 uppercase">{studentJurusan}</span>
                                                </TableCell>
                                                <TableCell className="py-4 text-center whitespace-nowrap">
                                                    {!isReadOnly ? (
                                                        <button type="button" onClick={() => removeStudentFromList(studentId)} className="text-error-500 hover:text-error-700 p-2 hover:bg-error-50 rounded-lg transition-colors">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        </button>
                                                    ) : viewMode === 'koordinator_riwayat' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => openExtendModal(studentId)} className="bg-brand-50 text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-brand-100 transition-colors shadow-sm">
                                                                Perpanjang
                                                            </button>
                                                            <button onClick={() => openWithdrawModal(studentId)} className="bg-error-50 text-error-600 border border-error-200 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-error-100 transition-colors shadow-sm w-20">
                                                                Tarik
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {viewMode === 'hubin_pengajuan' && initialData?.status === 'menunggu_acc_pengajuan' ? (
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-200">
                    <button onClick={() => handleHubinAction('reject')} className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-error-700 bg-error-50 border border-error-200 rounded-xl hover:bg-error-100 transition-colors">
                        Tolak Pengajuan
                    </button>
                    <button onClick={() => handleHubinAction('approve')} className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-success-600 rounded-xl hover:bg-success-700 shadow-md transition-colors">
                        Setujui & Terbitkan Surat
                    </button>
                </div>
            ) : viewMode === 'hubin_pengiriman' && initialData?.status === 'menunggu_acc_pengiriman' ? (
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-200">
                    <button onClick={() => handleHubinAction('reject')} className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-error-700 bg-error-50 border border-error-200 rounded-xl hover:bg-error-100 transition-colors">
                        Tolak Pengiriman
                    </button>
                    <button onClick={() => handleHubinAction('approve')} className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-success-600 rounded-xl hover:bg-success-700 shadow-md transition-colors">
                        Setujui Pengiriman
                    </button>
                </div>
            ) : viewMode === 'koordinator_riwayat' ? (
                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900/30 dark:bg-brand-900/10 sm:p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-brand-800 dark:text-brand-300 flex items-center gap-2">
                                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                Dokumen Penempatan PKL Lengkap
                            </h3>
                            <p className="mt-1.5 text-sm text-brand-700/80 dark:text-brand-400/80 max-w-2xl leading-relaxed">
                                Siswa telah resmi disetujui untuk diberangkatkan PKL ke industri. Silakan unduh dokumen pengiriman dan berita acara di bawah ini.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            {initialData?.application_letter_path && (
                                <button
                                    onClick={() => handleDownloadLetter(initialData.application_letter_path)}
                                    className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-white border border-brand-200 px-5 py-2.5 text-sm font-bold text-brand-700 shadow-sm hover:bg-brand-50 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Surat Pengajuan
                                </button>
                            )}
                            {initialData?.placement_letter_path && (
                                <button
                                    onClick={() => handleDownloadLetter(initialData.placement_letter_path)}
                                    className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Surat Pengiriman
                                </button>
                            )}
                            {initialData?.ba_path && (
                                <button
                                    onClick={() => handleDownloadLetter(initialData.ba_path)}
                                    className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-white border border-brand-200 px-5 py-2.5 text-sm font-bold text-brand-700 shadow-sm hover:bg-brand-50 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Berita Acara
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : viewMode === 'koordinator_pengiriman' && !isApprovedPengiriman ? (
                <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
                    <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900/30 dark:bg-brand-900/10 sm:p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-brand-800 dark:text-brand-300 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Dokumen Pengajuan PKL
                                </h3>
                                <p className="mt-1.5 text-sm text-brand-700/80 dark:text-brand-400/80 max-w-2xl leading-relaxed">
                                    Dokumen permohonan prakerin yang telah disetujui Hubin. Anda dapat melihatnya untuk acuan kelengkapan data pengiriman.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                {initialData?.application_letter_path ? (
                                    <button
                                        onClick={() => handleDownloadLetter(initialData.application_letter_path)}
                                        className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-white border border-brand-200 px-5 py-2.5 text-sm font-bold text-brand-700 shadow-sm hover:bg-brand-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        Lihat Surat Pengajuan
                                    </button>
                                ) : (
                                    <span className="text-sm font-medium text-gray-500 italic">Surat belum tersedia</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full">
                        <button onClick={() => handlePengirimanAction('batal')} className="w-full sm:w-auto px-10 py-3 text-sm font-bold text-white bg-error-600 hover:bg-error-700 shadow-lg shadow-error-200 rounded-xl transition-all">
                            Batal & Kembali
                        </button>
                        <button
                            onClick={() => handlePengirimanAction('simpan')}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
                        >
                            Simpan Sementara
                        </button>
                        <button
                            onClick={() => handlePengirimanAction('pengiriman')}
                            disabled={selectedStudentIds.length === 0 || !industryId || !pembimbingId || !departureDate || !durationOption || (durationOption === 'custom' && !finalEndDate) || isSubmitting}
                            className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Kirim Data Pengiriman
                        </button>
                    </div>
                </div>
            ) : viewMode === 'koordinator_pengajuan' && !isApprovedPengajuan ? (
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={() => handleKoordinatorAction('batal')} className="w-full sm:w-auto px-10 py-3 text-sm font-bold text-white bg-error-600 hover:bg-error-700 shadow-lg shadow-error-200 rounded-xl transition-all">
                        Batal & Kembali
                    </button>
                    <button
                        onClick={() => handleKoordinatorAction('draft')}
                        disabled={selectedStudentIds.length === 0 || isSubmitting}
                        className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
                    >
                        Simpan Sementara
                    </button>
                    <button
                        onClick={() => handleKoordinatorAction('pengajuan')}
                        disabled={selectedStudentIds.length === 0 || !industryId || !pembimbingId || isSubmitting}
                        className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Kirim Pengajuan Resmi
                    </button>
                </div>
            ) : (
                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900/30 dark:bg-brand-900/10 sm:p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-brand-800 dark:text-brand-300 flex items-center gap-2">
                                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                {initialData?.status === 'menunggu_acc_pengajuan' ? 'Pengajuan Sedang Dievaluasi' : 'Surat Pengantar Industri Telah Terbit'}
                            </h3>
                            <p className="mt-1.5 text-sm text-brand-700/80 dark:text-brand-400/80 max-w-2xl leading-relaxed">
                                {initialData?.status === 'menunggu_acc_pengajuan'
                                    ? 'Dokumen pengajuan sedang diverifikasi oleh staf Hubin. Silakan tunggu persetujuan sebelum dapat mengunduh berkas.'
                                    : 'Dokumen resmi permohonan prakerin dari Hubin SMK PGRI Telagasari telah berhasil diterbitkan. Silakan unduh untuk diserahkan ke pihak industri terkait.'}
                            </p>
                        </div>
                        <button
                            onClick={() => handleDownloadLetter(initialData?.application_letter_path)}
                            disabled={!initialData?.application_letter_path}
                            className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-theme-xs hover:bg-brand-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            {initialData?.application_letter_path ? "Unduh Surat Pengajuan" : "File Belum Tersedia"}
                        </button>
                    </div>
                </div>
            )}

            {!isReadOnly && (
                <Modal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} className="max-w-xl p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Pencarian Siswa Prakerin</h3>
                        <SearchInput
                            value={studentSearchTerm}
                            onChange={(val) => setStudentSearchTerm(val)}
                            placeholder="Ketik Nama atau NIS siswa..."
                        />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                        {availableStudents.length === 0 ? (
                            <div className="py-10 text-center text-gray-400">
                                {studentSearchTerm ? "Siswa tidak ditemukan atau telah terdaftar." : "Silakan masukkan nama siswa untuk memulai pencarian."}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {availableStudents.map(student => (
                                    <button
                                        key={student.id}
                                        onClick={() => addStudentToList(student.profile_id)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-brand-50 group transition-all"
                                    >
                                        <div className="text-left">
                                            <p className="font-bold text-gray-800 group-hover:text-brand-700">{student.name}</p>
                                            <p className="text-xs text-gray-500">{student.identifier} — {student.kelas}</p>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-300 group-hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end">
                        <button onClick={() => setIsSearchModalOpen(false)} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Tutup</button>
                    </div>
                </Modal>
            )}

            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} className="max-w-md p-6">
                <div className="text-center">
                    <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-4 ${hubinActionType === 'approve' ? 'bg-success-100 text-success-600' : 'bg-error-100 text-error-600'
                        }`}>
                        {hubinActionType === 'approve' ? (
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {hubinActionType === 'approve' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 px-2 leading-relaxed">
                        {hubinActionType === 'approve'
                            ? 'Apakah Anda yakin ingin menyetujui dokumen ini? Sistem akan memproses dan mengunci data secara otomatis.'
                            : 'Apakah Anda yakin ingin menolak dokumen ini? Berkas akan dikembalikan dan status akan diperbarui menjadi ditolak.'}
                    </p>

                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={executeHubinAction}
                            disabled={isSubmitting}
                            className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-colors disabled:opacity-50 ${hubinActionType === 'approve' ? 'bg-success-600 hover:bg-success-700' : 'bg-error-600 hover:bg-error-700'
                                }`}
                        >
                            {isSubmitting ? "Memproses..." : (hubinActionType === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak')}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isExtendModalOpen} onClose={() => setIsExtendModalOpen(false)} className="max-w-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Perpanjang PKL Siswa</h3>
                <p className="text-sm text-gray-500 mb-5">Pilih durasi tambahan khusus untuk siswa ini.</p>
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Opsi Durasi</label>
                        <SelectInput value={extendDuration} onChange={setExtendDuration}>
                            <option value="">Pilih Tambahan Durasi</option>
                            <option value="3_bulan">3 Bulan</option>
                            <option value="6_bulan">6 Bulan</option>
                            <option value="custom">Custom Tanggal</option>
                        </SelectInput>
                    </div>
                    {extendDuration === 'custom' && (
                        <DatePicker id="dp-extend-indiv" label={<span className="mb-1.5 block text-xs font-bold text-gray-500 uppercase">Tgl Selesai Baru</span>} onChange={(_, str) => setExtendCustomDate(str as string)} value={extendCustomDate} />
                    )}
                </div>
                <div className="flex gap-3 justify-end mt-6">
                    <button onClick={() => setIsExtendModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Batal</button>
                    <button onClick={confirmExtendIndividual} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors disabled:opacity-50">
                        {isSubmitting ? "Memproses..." : "Simpan Perpanjangan"}
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} className="max-w-md p-6">
                <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-100 text-error-600 mb-4">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tarik Siswa dari Industri?</h3>
                    <p className="text-sm text-gray-500 mb-6 px-2 leading-relaxed">
                        Siswa akan ditarik secara paksa dari industri dan status PKL-nya akan direset. Aksi ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => setIsWithdrawModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Batal</button>
                        <button onClick={confirmWithdrawIndividual} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-error-600 hover:bg-error-700 rounded-xl shadow-sm transition-colors disabled:opacity-50">
                            {isSubmitting ? "Menarik..." : "Ya, Tarik Siswa"}
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
}