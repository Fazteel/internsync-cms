import GridShape from "../../components/common/GridShape";
import { useAuthStore } from "../../store/useAuthStore";

export default function Maintenance() {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/signin";
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-gray-50 dark:bg-gray-900">
      <GridShape />
      <div className="mx-auto w-full max-w-[500px] text-center relative z-10">
        <div className="mb-8 flex justify-center">
          <img
            src="/images/error/maintenance.svg"
            alt="Maintenance"
            className="w-64 dark:hidden"
          />

          <img
            src="/images/error/maintenance-dark.svg"
            alt="Maintenance"
            className="hidden w-64 dark:block"
          />
        </div>

        <h1 className="mb-4 font-bold text-gray-800 text-3xl dark:text-white/90">
          Sistem Sedang Perbaikan
        </h1>

        <p className="mb-8 text-base text-gray-600 dark:text-gray-400">
          Mohon maaf, saat ini Sistem Manajemen PKL sedang dalam mode pemeliharaan rutin. Silakan kembali lagi beberapa saat kemudian.
        </p>

        <div className="inline-flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm w-full">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Hubungi Administrator</p>
          <p className="text-sm text-brand-500 dark:text-brand-400">admin@smkpgritelagasari.sch.id</p>
        </div>
              
        <button 
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-error-300 bg-white mt-6 px-6 py-3 text-sm font-medium text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-700 dark:bg-gray-800 dark:text-error-400 dark:hover:bg-error-900/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Keluar dari Sistem
        </button>
      </div>
    </div>
  );
}