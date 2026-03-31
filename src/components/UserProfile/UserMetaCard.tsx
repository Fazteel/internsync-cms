import { useAuthStore } from "../../store/useAuthStore";

export default function UserMetaCard() {
  const { user } = useAuthStore();

  const roleName = user?.roles?.[0]?.name || "Pengguna";
  const isStudent = roleName === "Siswa";
  
  const roleDescription = isStudent 
    ? `Siswa PKL - ${user?.student?.jurusan || "Jurusan Belum Diatur"}`
    : roleName;

  // Hamba ubah URL API Avatar-nya menggunakan warna Hex Brand-500 tanpa tanda #
  const avatarUrl = `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=006837&color=fff&bold=true`;
  const isActive = user?.is_active !== false && user?.is_active !== 0;

  return (
    <div className="p-5 border border-brand-100 bg-brand-50/30 rounded-2xl dark:border-brand-900/30 dark:bg-brand-900/10 lg:p-6 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 overflow-hidden border-2 border-brand-200 rounded-full dark:border-brand-800 bg-white flex items-center justify-center shadow-theme-xs">
            <img src={avatarUrl} alt="Foto Profil" className="w-full h-full object-cover" />
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-1 text-xl font-bold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {user?.name || "Nama Pengguna"}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                {roleDescription}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.address || "-"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center xl:justify-end mt-4 xl:mt-0 flex-shrink-0">
          {isActive ? (
            <span className="inline-flex items-center rounded-full bg-success-500 px-4 py-1.5 text-sm font-bold text-white shadow-theme-xs whitespace-nowrap">
              Akun Aktif
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-error-500 px-4 py-1.5 text-sm font-bold text-white shadow-theme-xs whitespace-nowrap">
              Nonaktif
            </span>
          )}
        </div>
      </div>
    </div>
  );
}