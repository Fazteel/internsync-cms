import PageMeta from "../../components/common/PageMeta";
import {
  HubinMetrics,
  PendingApprovals,
  SebaranIndustri
} from "../../components/dashboard";

export default function HubinHome() {
  return (
    <>
      <PageMeta
        title="Dashboard Hubin | Sistem Manajemen PKL"
        description="Dashboard eksekutif untuk mengelola relasi industri dan persetujuan kegiatan."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        
        <div className="col-span-12 xl:col-span-7 space-y-6">
          <HubinMetrics />
          <PendingApprovals />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <SebaranIndustri />
        </div>

      </div>
    </>
  );
}