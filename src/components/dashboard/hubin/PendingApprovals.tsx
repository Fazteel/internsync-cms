import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import { Modal } from "../../ui/modal/index";
import Alert from "../../ui/alert/Alert";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

interface ApprovalRequest {
  id: number;
  requester: string;
  role: string;
  type: string;
  date: string;
}

const tableData: ApprovalRequest[] = [
  { id: 1, requester: "Ahmad Yani, S.Kom", role: "Koordinator", type: "Pemberangkatan PKL (Gelombang 1)", date: "22 Okt 2026" },
  { id: 2, requester: "Budi Santoso, M.T", role: "Pembimbing", type: "Perjalanan Dinas (Monitoring PT Telkom)", date: "24 Okt 2026" },
];

export default function PendingApprovals() {
  const [selectedReq, setSelectedReq] = useState<ApprovalRequest | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });

  const handleApprove = (req: ApprovalRequest) => {
    setSelectedReq(req);
    setIsApproveOpen(true);
  };

  const handlePreview = (req: ApprovalRequest) => {
    setSelectedReq(req);
    setIsPreviewOpen(true);
  };

  const confirmApprove = () => {
    setAlertInfo({
      show: true,
      variant: "success",
      title: "Persetujuan Berhasil",
      message: `Pengajuan dari ${selectedReq?.requester} telah disetujui.`,
    });
    setIsApproveOpen(false);
    setSelectedReq(null);
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  return (
    <div className="space-y-4">
      {alertInfo.show && (
        <div className="animate-fade-in">
          <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Antrean Persetujuan (Approval)
          </h3>
          <p className="text-sm text-gray-500">Silakan tinjau dokumen pengajuan berikut.</p>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[200px]">Pengaju</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap min-w-[250px]">Jenis Pengajuan</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">Tanggal</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">Aksi</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tableData.map((req) => (
                <TableRow key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <TableCell className="py-3 whitespace-nowrap">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{req.requester}</p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">{req.role}</span>
                  </TableCell>
                  <TableCell className="py-3 text-gray-600 font-medium text-theme-sm whitespace-nowrap dark:text-gray-300">
                    {req.type}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm whitespace-nowrap">{req.date}</TableCell>
                  <TableCell className="py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 mt-1">
                      <button 
                        onClick={() => handlePreview(req)}
                        className="rounded bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20 transition-colors"
                      >
                        Lihat Dokumen
                      </button>
                      <button 
                        onClick={() => handleApprove(req)}
                        className="rounded bg-accent-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-accent-600 transition-colors shadow-theme-xs"
                      >
                        Setujui
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} className="max-w-[400px]" showCloseButton={false}>
        <div className="p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            Setujui Pengajuan
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            {selectedReq && (
              <>
                Anda akan menyetujui pengajuan <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedReq.type}</span> dari <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedReq.requester}</span>. Lanjutkan?
              </>
            )}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsApproveOpen(false)}
              className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={confirmApprove}
              className="rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-600 active:bg-accent-700 transition-colors shadow-theme-xs"
            >
              Ya, Setujui
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} className="max-w-3xl overflow-hidden" showCloseButton={false}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 overflow-hidden">
            <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">Dokumen Pengajuan {selectedReq?.requester}</span>
          </div>
          <button onClick={() => setIsPreviewOpen(false)} className="rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-black/50 p-6 min-h-[400px]">
          <div className="flex flex-col items-center justify-center opacity-50">
            <svg className="w-24 h-24 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p className="text-lg font-medium text-gray-500">Pratinjau Dokumen</p>
            <p className="text-sm text-gray-400 mt-2">Data asli akan dirender di area ini.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}