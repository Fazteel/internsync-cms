import { useAuthStore } from "../../store/useAuthStore";
import { useMasterStore } from "../../store/Admin/useMasterStore";

export default function UserAddressCard() {
  const { user } = useAuthStore();
  const { academicYears } = useMasterStore();

  const roleName = user?.roles?.[0]?.name;
  const isStudent = roleName === "Siswa";
  
  const identifierValue = isStudent ? user?.student?.nis : user?.nip;
  const identifierLabel = isStudent ? "Nomor Induk Siswa (NIS)" : "Nomor Induk Pegawai (NIP)";

  const activeAcademicYear = academicYears.find((year) => year.status === "Aktif");

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-transparent">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-4 dark:border-gray-800">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
            Identitas Akademik & Domisili
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {identifierLabel}
            </p>
            <p className="text-sm font-bold text-brand-600 dark:text-brand-400 bg-brand-50 p-2.5 rounded-lg border border-brand-100 dark:bg-brand-900/20 dark:border-brand-800/50">
              {identifierValue || "-"}
            </p>
          </div>

          {isStudent && (
            <>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Jurusan
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                  {user?.student?.jurusan || "-"}
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Kelas
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                  {user?.student?.kelas || "-"}
                </p>
              </div>
            </>
          )}

          {!isStudent && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tahun Ajaran Aktif
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                {activeAcademicYear ? activeAcademicYear.tahun : "-"} ({activeAcademicYear ? activeAcademicYear.semester : "-"})
              </p>
            </div>
          )}

          <div className="sm:col-span-2 lg:col-span-1">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Kota/Kabupaten
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
              {user?.address || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}