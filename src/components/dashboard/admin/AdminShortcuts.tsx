import { Link } from "react-router-dom";

export default function AdminShortcuts() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-4">Aksi Cepat (Shortcut)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/admin/kelola-pengguna" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-brand-50 hover:border-brand-200 transition-colors dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-brand-900/20 dark:hover:border-brand-500/50 group">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700 dark:text-gray-300 dark:group-hover:text-brand-300">Tambah Akun Baru</span>
        </Link>
        <Link to="/admin/kelola-pengguna" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-brand-50 hover:border-brand-200 transition-colors dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-brand-900/20 dark:hover:border-brand-500/50 group">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700 dark:text-gray-300 dark:group-hover:text-brand-300">Import Data Excel</span>
        </Link>
        <Link to="/admin/pengaturan" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-brand-50 hover:border-brand-200 transition-colors dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-brand-900/20 dark:hover:border-brand-500/50 group">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700 dark:text-gray-300 dark:group-hover:text-brand-300">Pengaturan Sistem</span>
        </Link>
        <Link to="/admin/pengaturan" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-brand-50 hover:border-brand-200 transition-colors dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-brand-900/20 dark:hover:border-brand-500/50 group">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700 dark:text-gray-300 dark:group-hover:text-brand-300">Backup Database</span>
        </Link>
      </div>
    </div>
  );
}