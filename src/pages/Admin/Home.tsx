import PageMeta from "../../components/common/PageMeta";
import {
  AdminBanner,
  AdminStats,
  AdminShortcuts,
  AdminRecentActivities
} from "../../components/dashboard";

export default function AdminHome() {
  return (
    <>
      <PageMeta
        title="Dashboard Admin | Sistem Manajemen PKL"
        description="Pusat kendali dan ringkasan statistik sistem untuk Administrator."
      />

      <div className="space-y-6">
        <AdminBanner />
        <AdminStats />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AdminShortcuts />
          <AdminRecentActivities />
        </div>
      </div>
    </>
  );
}