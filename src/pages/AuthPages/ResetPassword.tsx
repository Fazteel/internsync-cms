import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import Alert from "../../components/ui/alert/Alert";
import { authService } from "../../services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, variant: "success" as "success" | "error" | "warning", title: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !email) {
      setAlertInfo({ show: true, variant: "error", title: "Akses Ditolak", message: "Link reset password tidak valid atau sudah rusak." });
      return;
    }
    if (password !== confirmPassword) {
      setAlertInfo({ show: true, variant: "error", title: "Gagal", message: "Password dan Konfirmasi Password tidak cocok!" });
      return;
    }
    if (password.length < 8) {
      setAlertInfo({ show: true, variant: "warning", title: "Perhatian", message: "Password minimal harus 8 karakter." });
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        email: email,
        token: token,
        password: password,
        password_confirmation: confirmPassword
      });

      setAlertInfo({ show: true, variant: "success", title: "Berhasil", message: "Password Anda telah berhasil direset. Mengalihkan ke halaman login..." });
      
      setTimeout(() => navigate("/signin"), 2000);
      
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setAlertInfo({ 
        show: true, 
        variant: "error", 
        title: "Gagal", 
        message: error.response?.data?.message || "Terjadi kesalahan saat mereset password. Silakan minta link baru." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Reset Password | Sistem Manajemen PKL" description="Ubah password akun Anda yang lupa." />
      
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {email ? `Silakan masukkan password baru untuk ${email}.` : "Silakan masukkan password baru Anda."}
            </p>
          </div>

          {alertInfo.show && (
            <div className="animate-fade-in">
              <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/50 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Password Baru</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" 
                    placeholder="••••••••"
                    required 
                    disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white" 
                    placeholder="••••••••"
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full rounded-lg bg-brand-500 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600 focus:ring-4 focus:ring-brand-200 dark:focus:ring-brand-800 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Memproses..." : "Simpan & Ubah Password"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link to="/signin" className="font-medium text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Kembali ke Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}