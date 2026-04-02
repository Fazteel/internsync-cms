import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { UserAccount } from "../../store/Admin/useUserStore";

interface UserTableProps {
  users: UserAccount[];
  isLoading: boolean;
  sendingEmailId: number | null;
  onResendEmail: (user: UserAccount) => void;
  onEdit: (user: UserAccount) => void;
  onDelete: (user: UserAccount) => void;
}

export default function UserTable({ users, isLoading, sendingEmailId, onResendEmail, onEdit, onDelete }: UserTableProps) {
  const getRoleColor = (roleType: string) => {
    switch (roleType) {
      case "Siswa": return "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400";
      case "Pembimbing": return "bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400";
      case "Koordinator": return "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400";
      case "Hubin": return "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400";
      case "Admin": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className="w-full bg-white dark:bg-transparent">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 px-6 font-medium text-gray-500 text-start text-theme-xs min-w-[200px] whitespace-nowrap">Pengguna</TableCell>
              <TableCell isHeader className="py-3 px-6 font-medium text-gray-500 text-start text-theme-xs min-w-[150px] whitespace-nowrap">NIS / NIP</TableCell>
              <TableCell isHeader className="py-3 px-6 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">Role</TableCell>
              <TableCell isHeader className="py-3 px-6 font-medium text-gray-500 text-start text-theme-xs whitespace-nowrap">Status</TableCell>
              <TableCell isHeader className="py-3 px-6 font-medium text-gray-500 text-center text-theme-xs min-w-[140px] whitespace-nowrap">Aksi</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <TableRow><td className="py-8 text-center text-gray-500 px-4" colSpan={5}>Memuat data pengguna...</td></TableRow>
            ) : users.length === 0 ? (
              <TableRow><td className="py-8 text-center text-sm text-gray-500 px-4" colSpan={5}>Data pengguna tidak ditemukan.</td></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <TableCell className="py-4 px-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800 dark:text-white/90 text-theme-sm">{user.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{(user as UserAccount & { email?: string }).email || "Email tidak ada"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-theme-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{user.identifier || "-"}</TableCell>
                  <TableCell className="py-4 px-6 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getRoleColor(user.role)}`}>{user.role}</span>
                  </TableCell>
                  <TableCell className="py-4 px-6 whitespace-nowrap">
                    <Badge color={user.status === "Aktif" ? "success" : "error"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center whitespace-nowrap">
                    {user.role === "Admin" ? (
                       <span className="text-xs font-medium italic text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full dark:bg-gray-800 dark:text-gray-500">Akses Terkunci</span>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => onResendEmail(user)} 
                          disabled={sendingEmailId === user.id}
                          className="p-1.5 text-gray-400 hover:text-accent-500 transition-colors disabled:opacity-50" 
                          title="Kirim Ulang Email Aktivasi"
                        >
                          {sendingEmailId === user.id ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          )}
                        </button>
                        <button onClick={() => onEdit(user)} className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors" title="Edit Pengguna">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button onClick={() => onDelete(user)} className="p-1.5 text-gray-400 hover:text-error-500 transition-colors" title="Hapus Pengguna">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}