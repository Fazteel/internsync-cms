import React, { useState } from "react";
import { Modal } from "../../components/ui/modal/index";
import Alert from "../../components/ui/alert/Alert";

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  internshipId: number;
  studentName: string;
  onSubmit: (internshipId: number, score: number, notes: string) => Promise<void>;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  internshipId,
  studentName,
  onSubmit,
}) => {
  const [score, setScore] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setScore("");
      setNotes("");
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      setErrorMsg("Nilai harus berupa angka di antara 0 sampai 100.");
      return;
    }

    if (!notes.trim()) {
      setErrorMsg("Catatan evaluasi wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(internshipId, numericScore, notes);
      onClose();
    } catch (err: any) {
      const apiError = err.response?.data?.message || err.message || "Gagal menyimpan evaluasi.";
      setErrorMsg(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-0 overflow-hidden" showCloseButton={false}>
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Beri Penilaian Akhir</h3>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mt-1">{studentName}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="p-6 space-y-4 bg-white dark:bg-gray-900">
          {errorMsg && (
            <div className="animate-fade-in">
              <Alert variant="error" title="Gagal Menyimpan" message={errorMsg} />
            </div>
          )}

          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nilai Akhir PKL <span className="text-red-500">*</span>
            </label>
            <input
              id="score"
              type="number"
              min="0"
              max="100"
              step="0.01"
              required
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Masukkan nilai (0 - 100)"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Gunakan titik (.) untuk nilai desimal, misal: 85.50</p>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catatan Pembimbing / Evaluasi Sikap & Kinerja <span className="text-red-500">*</span>
            </label>
            <textarea
              id="notes"
              rows={4}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Berikan ulasan singkat mengenai kinerja, kedisiplinan, dan sikap siswa selama kegiatan magang..."
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-900"
            />
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 dark:border-gray-800 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg px-6 py-2 text-sm font-bold text-white hover:opacity-90 transition-all shadow-theme-xs disabled:opacity-50"
            style={{ backgroundColor: "#006837" }}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Penilaian"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
