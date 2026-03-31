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
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400 shadow-sm border border-warning-200 dark:border-warning-800">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
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