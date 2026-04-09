import { useAuthStore } from "../../store/useAuthStore";

export default function UserInfoCard() {
  const { user } = useAuthStore();

  const fullName = user?.student?.name || user?.teacher?.name || "User Name";
  const phone = user?.student?.phone || user?.teacher?.phone || "Belum diatur";
  
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  
  const roleName = user?.roles?.[0]?.name || "Pengguna";

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-transparent">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-4 dark:border-gray-800">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
             <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
             Informasi Pribadi
          </h4>
          <span className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1 rounded-md dark:bg-gray-800">Data dikelola oleh Admin</span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Nama Depan</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
              {firstName}
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Nama Belakang</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
              {lastName || "-"}
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Alamat Email</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
              {user?.email || "-"}
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Nomor Telepon</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
              {phone}
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Hak Akses (Role)</p>
            <p className="text-sm font-bold text-brand-600 dark:text-brand-400 bg-brand-50 p-2.5 rounded-lg border border-brand-100 dark:bg-brand-900/20 dark:border-brand-800/50 w-fit">
              {roleName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}