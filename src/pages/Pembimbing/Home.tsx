import PageMeta from "../../components/common/PageMeta";
import {
  PembimbingMetrics,
  AktivitasBimbinganChart,
  LogbookPending
} from "../../components/dashboard";

export default function DashboardPembimbing() {
  return (
    <>
      <PageMeta
        title="Dashboard Pembimbing | Sistem Manajemen PKL"
        description="Dashboard utama untuk memantau dan memverifikasi kegiatan PKL siswa bimbingan."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        
        <div className="col-span-12">
          <PembimbingMetrics />
        </div>

        <div className="col-span-12">
          <AktivitasBimbinganChart />
        </div>

        <div className="col-span-12">
          <LogbookPending />
        </div>

      </div>
    </>
  );
}