import React, { useState, useRef } from "react";
import { Modal } from "../ui/modal/index";
import { ImportResult } from "../../store/Admin/useUserStore";

interface MasterDataImportProps {
  onImport: (file: File) => Promise<ImportResult>;
  onImportSuccess?: () => void;
  label?: string;
  className?: string;
  accept?: string;
}

export const MasterDataImport: React.FC<MasterDataImportProps> = ({
  onImport,
  onImportSuccess,
  label = "Import Excel",
  className = "",
  accept = ".xlsx, .xls, .csv",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [failedCount, setFailedCount] = useState<number | null>(null);
  const [errorReportUrl, setErrorReportUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setSuccessCount(null);
    setFailedCount(null);
    setErrorReportUrl(null);
    setErrorMsg(null);

    try {
      const result = await onImport(file);

      if (result.summary) {
        const success = result.summary.successful_rows;
        const failed = result.summary.failed_rows;

        setSuccessCount(success);
        setFailedCount(failed);
        setErrorReportUrl(result.error_report_url || null);
      } else {
        // Fallback for endpoints without detailed summary
        setSuccessCount(1);
        setFailedCount(0);
      }

      setIsResultModalOpen(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error.response?.data?.message || "File gagal diproses, pastikan format sesuai.");
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    if (onImportSuccess) {
      onImportSuccess();
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      {/* Result Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={handleCloseResultModal}
        className="max-w-[480px] p-6 sm:p-8"
      >
        <div className="flex flex-col">
          {/* Modal Header */}
          <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
              Hasil Import Data Master
            </h3>
          </div>

          {/* Modal Body */}
          <div className="py-6 flex flex-col items-center justify-center">
            {failedCount === 0 ? (
              /* Case 1: 100% Success */
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-500 dark:bg-success-500/10 dark:text-success-400 mb-4 shadow-theme-xs">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-success-600 dark:text-success-400 mb-2">
                  Semua Data Berhasil Masuk!
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total: <span className="font-semibold text-gray-700 dark:text-gray-300">{successCount}</span> baris data
                </p>
              </div>
            ) : (
              /* Case 2: Partial/Failed Rows */
              <div className="flex flex-col items-center justify-center text-center w-full">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-50 text-warning-500 dark:bg-warning-500/10 dark:text-warning-400 mb-4 shadow-theme-xs">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                
                <h4 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-4">
                  Beberapa Data Gagal Validasi
                </h4>

                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-success-50/55 border border-success-100 dark:bg-success-500/5 dark:border-success-500/10 shadow-sm">
                    <span className="text-xs font-semibold text-success-600 dark:text-success-400 uppercase tracking-wider mb-1">
                      Data Sukses
                    </span>
                    <span className="text-2xl font-black text-success-700 dark:text-success-300">
                      {successCount}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-error-50/55 border border-error-100 dark:bg-error-500/5 dark:border-error-500/10 shadow-sm">
                    <span className="text-xs font-semibold text-error-600 dark:text-error-400 uppercase tracking-wider mb-1">
                      Data Gagal
                    </span>
                    <span className="text-2xl font-black text-error-700 dark:text-error-300">
                      {failedCount}
                    </span>
                  </div>
                </div>

                {errorReportUrl && (
                  <a
                    href={errorReportUrl}
                    download
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-brand-500 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 text-white py-3 px-4 text-sm font-semibold shadow-theme-xs transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Laporan Data Error (.xlsx)
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              onClick={handleCloseResultModal}
              className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-gray-100 dark:bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-theme-xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        className="max-w-[400px] p-6"
      >
        <div className="flex flex-col items-center text-center p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-50 text-error-500 dark:bg-error-500/10 dark:text-error-400 mb-4 shadow-theme-xs">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-2">Gagal Mengimpor Data</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {errorMsg}
          </p>
          <button
            onClick={() => setIsErrorModalOpen(false)}
            className="w-full inline-flex justify-center rounded-lg bg-gray-100 dark:bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-theme-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </Modal>

      {/* Button Trigger */}
      <label
        className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors ${
          isLoading
            ? "opacity-50 cursor-not-allowed select-none bg-gray-50 dark:bg-gray-900"
            : "cursor-pointer group"
        }`}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        )}
        <span>{isLoading ? "Mengimpor..." : label}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
      </label>
    </div>
  );
};

export default MasterDataImport;
