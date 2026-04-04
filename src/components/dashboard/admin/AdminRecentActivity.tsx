import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useDashboardStore } from "../../../store/useDashboardStore";

export default function AdminRecentActivities() {
  const { logs, fetchLogs } = useDashboardStore();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const recentLogs = logs.slice(0, 5);

  const translateAction = (action: string) => {
    if (action === 'create') return 'Tambah Data';
    if (action === 'update') return 'Update Data';
    if (action === 'delete') return 'Hapus Data';
    return action;
  };

  const getIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act === 'create' || act.includes('user') || act.includes('akun')) return "user-plus";
    if (act === 'update' || act.includes('data') || act.includes('jurusan') || act.includes('kelas')) return "database";
    if (act === 'delete' || act.includes('hapus')) return "trash";
    if (act.includes('password') || act.includes('login')) return "key";
    return "settings";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Aktivitas Sistem Terbaru</h3>
        <Link to="/admin/activity-logs" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Lihat Semua</Link>
      </div>
      
      <div className="space-y-4">
        {recentLogs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Belum ada aktivitas.</p>
        ) : (
          recentLogs.map((log) => {
            const icon = getIcon(log.action);
            return (
              <div key={log.id} className="flex gap-4">
                <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  {icon === "user-plus" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>}
                  {icon === "database" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>}
                  {icon === "key" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>}
                  {icon === "trash" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>}
                  {icon === "settings" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{translateAction(log.action)}</p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{log.description}</p>
                  <span className="mt-1 block text-xs font-medium text-brand-400/80">
                    {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB 
                    {" - "}{log.user?.name || "Sistem"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}