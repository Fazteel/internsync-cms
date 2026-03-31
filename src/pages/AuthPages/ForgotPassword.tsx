import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../services/authService";
import Alert from "../../components/ui/alert/Alert";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ show: boolean; variant: "success" | "error"; message: string }>({
    show: false, variant: "success", message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlertInfo({ show: false, variant: "success", message: "" });

    try {
      const res = await authService.forgotPassword({ identifier, email });
      setAlertInfo({ show: true, variant: "success", message: res.message || "Link reset password berhasil dikirim ke email Anda." });
      setIdentifier("");
      setEmail("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setAlertInfo({ 
        show: true, 
        variant: "error", 
        message: error.response?.data?.message || "Terjadi kesalahan. Pastikan data valid." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-dark sm:p-8">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white/90">Lupa Password?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Masukkan NIS/NIP dan Email yang terdaftar untuk menerima link reset password.</p>
        </div>

        {alertInfo.show && (
          <div className="mb-4">
            <Alert variant={alertInfo.variant} title={alertInfo.variant === 'success' ? 'Berhasil' : 'Gagal'} message={alertInfo.message} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">NIS / NIP</label>
            <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Masukkan NIS atau NIP Anda" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Alamat Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white" required />
          </div>

          <button type="submit" disabled={isLoading} className="mt-2 w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50">
            {isLoading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Ingat password Anda? <Link to="/signin" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Kembali ke Login</Link>
        </p>
      </div>
    </div>
  );
}