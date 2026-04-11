import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, TableTopControls, TablePagination } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { InternshipApplication, useInternshipStore } from "../../store/useInternshipStore";
import InternshipForm from "../../components/form/InternshipForm";

export default function HubinPlacementsList() {
    const { applications, fetchPendingApprovals } = useInternshipStore();
    const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [filterMonth, setFilterMonth] = useState("");

    useEffect(() => {
        fetchPendingApprovals('pengiriman');
    }, [fetchPendingApprovals]);

    if (selectedApp) {
        return (
            <InternshipForm
                initialData={selectedApp}
                onBack={() => setSelectedApp(null)}
                viewMode="hubin_pengiriman"
            />
        );
    }

    const filteredApplications = applications.filter((app) => {
        const matchDate = filterMonth === "" || (app.departure_date && app.departure_date.startsWith(filterMonth));
        return matchDate;
    });

    const totalPages = Math.ceil(filteredApplications.length / rowsPerPage);
    const paginatedData = filteredApplications.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const getStatusDisplay = (status: string): { color: 'gray' | 'warning' | 'success' | 'error', label: string } => {
        switch (status) {
            case 'menunggu_acc_pengiriman': return { color: 'warning', label: 'Menunggu' };
            default: return { color: 'gray', label: status };
        }
    };

    return (
        <>
            <PageMeta title="ACC Pengiriman | InternSync" description="Persetujuan pengiriman PKL oleh Hubin." />
            <div className="space-y-6">
                <PageHeader
                    title="Approval Pengiriman PKL"
                    description="Daftar antrian pengiriman siswa prakerin dari Koordinator yang menunggu persetujuan."
                >
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
                </PageHeader>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                    <div className="px-8 pt-6">
                        <TableTopControls rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} totalData={filteredApplications.length} setCurrentPage={setCurrentPage} />
                    </div>

                    <div className="max-w-full overflow-x-auto mt-4">
                        <Table>
                            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/20">
                                <TableRow>
                                    <TableCell isHeader className="py-3 px-8 text-start w-[25%]">Industri</TableCell>
                                    <TableCell isHeader className="py-3 px-4 text-start w-[20%]">Pembimbing</TableCell>
                                    <TableCell isHeader className="py-3 px-4 text-center w-[10%]">Siswa</TableCell>
                                    <TableCell isHeader className="py-3 px-4 text-start w-[20%]">Tgl Berangkat</TableCell>
                                    <TableCell isHeader className="py-3 px-4 text-start w-[12%]">Status</TableCell>
                                    <TableCell isHeader className="py-3 px-4 text-center w-[13%]">Aksi</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="py-10 text-center text-gray-500">Tidak ada antrian pengiriman.</TableCell></TableRow>
                                ) : paginatedData.map((app) => {
                                    const status = getStatusDisplay(app.status);
                                    return (
                                        <TableRow key={app.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 dark:border-gray-800">
                                            <TableCell className="py-5 px-8 text-start">
                                                <p className="font-bold text-gray-800 dark:text-white/90 text-sm">{app.industry?.name}</p>
                                                <span className="text-[11px] font-medium text-gray-400">No: {app.application_number}</span>
                                            </TableCell>
                                            <TableCell className="py-5 px-4 text-start text-theme-sm font-medium text-gray-600 dark:text-gray-400">
                                                {app.pembimbing?.teacher?.name || '-'}
                                            </TableCell>
                                            <TableCell className="py-5 px-4 text-center">
                                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-warning-50 text-warning-700 text-xs font-extrabold border-2 border-warning-200">
                                                    {app.students?.length || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-5 px-4 text-start text-theme-xs text-gray-500 font-medium">
                                                {app.departure_date || '-'}
                                            </TableCell>
                                            <TableCell className="py-5 px-4 text-start">
                                                <Badge color={status.color}>{status.label}</Badge>
                                            </TableCell>
                                            <TableCell className="py-5 px-4 text-center">
                                                <button
                                                    onClick={() => setSelectedApp(app)}
                                                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm bg-brand-500 text-white hover:bg-brand-600"
                                                >
                                                    Process
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="px-4 py-4"><TablePagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} /></div>
                </div>
            </div>
        </>
    );
}