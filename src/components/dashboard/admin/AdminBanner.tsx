import { useAuthStore } from "../../../store/useAuthStore";

export default function AdminBanner() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "Admin";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-6 dark:border-brand-900/50 dark:bg-brand-900/20 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Selamat datang kembali, <span className="text-brand-600 dark:text-brand-400">{firstName}</span>! 
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Berikut adalah ringkasan sistem manajemen PKL dan aktivitas terbaru hari ini.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-success-500"></span>
        </span>
        <span className="text-sm font-medium text-brand-900 dark:text-brand-100">Sistem Berjalan Normal</span>
      </div>
    </div>
  );
}