import { useEffect } from "react";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { useStudentMenteeStore } from "../../store/Pembimbing/useStudentMenteeStore";

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const { studentDetail, isLoading, fetchStudentDetail } = useStudentMenteeStore();

  useEffect(() => {
    if (id) {
      fetchStudentDetail(id);
    }
  }, [id, fetchStudentDetail]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Memuat detail siswa...</div>;
  }

  if (!studentDetail) {
    return <div className="flex h-64 items-center justify-center text-error-500">Data siswa tidak ditemukan!</div>;
  }

  return (
    <>
      <PageMeta title="Detail Siswa Bimbingan" description="Informasi lengkap siswa bimbingan PKL." />
      
      <PageBreadcrumb pageTitle="Detail Profil Siswa" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 shadow-sm">
          <div className="space-y-6">
            
            <div className="p-5 border border-brand-100 bg-brand-50/50 rounded-2xl dark:border-brand-900/30 dark:bg-brand-900/10 lg:p-6 shadow-sm">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                  <div className="w-20 h-20 overflow-hidden border-2 border-white rounded-full dark:border-gray-800 flex items-center justify-center bg-brand-500 text-white text-3xl font-bold flex-shrink-0 shadow-theme-xs uppercase">
                    {studentDetail.name.charAt(0)}
                  </div>
                  <div className="order-3 xl:order-2">
                    <h4 className="mb-2 text-xl font-bold text-center text-gray-800 dark:text-white/90 xl:text-left">
                      {studentDetail.name}
                    </h4>
                    <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                      <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                        {studentDetail.major}
                      </p>
                      <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        NIS: <span className="font-bold text-gray-800 dark:text-gray-300">{studentDetail.nis}</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center xl:justify-end mt-4 xl:mt-0 flex-shrink-0">
                  <Badge color={studentDetail.status === "Aktif" ? "success" : studentDetail.status === "Selesai" ? "primary" : studentDetail.status === "Menunggu" ? "warning" : "error"}>
                    Status: {studentDetail.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-gray-50/30">
              <div className="flex flex-col gap-6">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-2 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  Informasi Penempatan & Kontak
                </h4>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Penempatan Industri
                    </p>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                        {studentDetail.industry}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{studentDetail.address}</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Alamat Email
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-white p-3 rounded-xl border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                      {studentDetail.email}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Nomor Telepon Siswa
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-white p-3 rounded-xl border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                      {studentDetail.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-gray-50/30">
              <div className="flex flex-col gap-6">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-2 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Progres Pelaksanaan PKL
                </h4>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm dark:bg-gray-800/80 dark:border-gray-700">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Tanggal Mulai
                    </p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white/90 mt-1">
                      {studentDetail.startDate}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm dark:bg-gray-800/80 dark:border-gray-700">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Tanggal Selesai
                    </p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white/90 mt-1">
                      {studentDetail.endDate}
                    </p>
                  </div>

                  <div className="bg-brand-50 rounded-xl p-4 border border-brand-100 shadow-sm dark:bg-brand-900/20 dark:border-brand-800/50">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      Durasi Program
                    </p>
                    <p className="text-sm font-bold text-brand-800 dark:text-brand-300 mt-1">
                      {studentDetail.duration} Bulan
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full mt-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm dark:bg-gray-800/50 dark:border-gray-700">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Progres Waktu Berjalan</span>
                    <span className="text-brand-600 dark:text-brand-400">{studentDetail.progressPercent}%</span>
                  </div>
                  <div className="relative block h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mt-1">
                    <div
                      className="absolute left-0 top-0 flex h-full rounded-full bg-brand-500 shadow-[0_0_8px_rgba(0,104,55,0.5)] transition-all duration-500"
                      style={{ width: `${studentDetail.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}