import { useEffect } from "react";
import { useDashboardStore } from "../../../store/useDashboardStore";

export default function AdminStats() {
  const { stats, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Akun Siswa</p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">{stats.totalStudents}</h3>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Akun Guru</p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">{stats.totalTeachers}</h3>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-800/10 text-brand-800 dark:bg-brand-500/20 dark:text-brand-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Master Industri</p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">{stats.totalIndustries}</h3>
        </div>
      </div>

    </div>
  );
}