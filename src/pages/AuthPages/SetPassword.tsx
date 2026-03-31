import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import Alert from "../../components/ui/alert/Alert";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ show: boolean; variant: "success" | "error"; message: string }>({
    show: false, variant: "success", message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      setAlertInfo({ show: true, variant: "error", message: "Konfirmasi password tidak cocok!" });
      return;
    }

    setIsLoading(true);
    setAlertInfo({ show: false, variant: "success", message: "" });

    try {
      await authService.resetPassword({ email, token, password, password_confirmation: passwordConfirmation });
      setAlertInfo({ show: true, variant: "success", message: "Password berhasil disimpan! Mengalihkan ke halaman login..." });
      
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setAlertInfo({ 
        show: true, 
        variant: "error", 
        message: error.response?.data?.message || "Link kedaluwarsa atau terjadi kesalahan." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-dark">
          <h2 className="mb-2 text-xl font-bold text-error-500">Akses Ditolak</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Link tidak valid atau Anda tidak memiliki akses ke halaman ini.</p>
          <Link to="/signin" className="font-medium text-brand-600 hover:text-brand-700">Kembali ke halaman Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-dark sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white/90">Buat Password Baru</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Silakan buat password baru untuk akun <strong>{email}</strong>.</p>
        </div>

        {alertInfo.show && (
          <div className="mb-4">
            <Alert variant={alertInfo.variant} title={alertInfo.variant === 'success' ? 'Berhasil' : 'Gagal'} message={alertInfo.message} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Password Baru</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" minLength={8} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Konfirmasi Password Baru</label>
            <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} placeholder="Ketik ulang password baru" minLength={8} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white" required />
          </div>

          <button type="submit" disabled={isLoading} className="mt-4 w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50">
            {isLoading ? "Menyimpan..." : "Simpan Password & Login"}
          </button>
        </form>
      </div>
    </div>
  );
}