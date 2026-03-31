import { useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useDashboardStore } from "../../store/useDashboardStore";

export default function ActivityLogs() {
  const { logs, fetchLogs, isLoading } = useDashboardStore();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const groupedLogs = logs.reduce((acc: Record<string, typeof logs>, log) => {
    const dateObj = new Date(log.created_at);
    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    
    let label = dateStr;
    if (dateStr === today) label = `Hari Ini, ${dateStr}`;
    else if (dateStr === yesterday) label = `Kemarin, ${dateStr}`;

    if (!acc[label]) acc[label] = [];
    acc[label].push(log);
    return acc;
  }, {});

  const translateAction = (action: string) => {
    if (action === 'create') return 'Tambah Data';
    if (action === 'update') return 'Update Data';
    if (action === 'delete') return 'Hapus Data';
    return action;
  };

  const renderIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('user') || act.includes('akun') || act === 'create') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>;
    if (act.includes('data') || act.includes('jurusan') || act.includes('kelas') || act === 'update') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>;
    if (act.includes('hapus') || act === 'delete') return <svg className="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
  };

  return (
    <>
      <PageMeta title="Log Aktivitas | Admin PKL" description="Riwayat seluruh aktivitas sistem." />
      <PageBreadcrumb pageTitle="Riwayat Log Aktivitas" />

      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center p-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div></div>
        ) : Object.keys(groupedLogs).length === 0 ? (
          <div className="text-center p-10 text-gray-500">Belum ada riwayat aktivitas di sistem.</div>
        ) : (
          Object.entries(groupedLogs).map(([dateLabel, groupLogs]: [string, typeof logs], index) => (
            <div key={index} className="relative pt-2">
              <div className="sticky top-0 z-10 flex items-center justify-center mb-6">
                <span className="bg-brand-50 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-brand-200 dark:border-brand-800">
                  {dateLabel}
                </span>
                <div className="absolute w-full h-px bg-gray-200 dark:bg-gray-800 -z-10"></div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 space-y-5 shadow-sm">
                {groupLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 items-start group">
                    <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-brand-100 group-hover:text-brand-600 dark:group-hover:bg-brand-900/50 dark:group-hover:text-brand-400 transition-colors border border-gray-100 dark:border-gray-700">
                      {renderIcon(log.action)}
                    </div>
                    <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-5 last:border-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                        <p className="text-sm font-bold text-gray-800 dark:text-white/90 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
                          {translateAction(log.action)} <span className="font-normal text-gray-500">oleh</span> {log.user?.name || "Sistem"}
                        </p>
                        <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{log.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}