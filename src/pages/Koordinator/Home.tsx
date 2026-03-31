import PageMeta from "../../components/common/PageMeta";
import {
  KoordinatorMetrics,
  TrendPenempatanChart,
  StatusSiswa
} from "../../components/dashboard";

export default function KoordinatorHome() {
  return (
    <>
      <PageMeta
        title="Dashboard Koordinator | Sistem Manajemen PKL"
        description="Dashboard untuk mengelola penempatan dan memantau status PKL siswa."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        
        <div className="col-span-12">
          <KoordinatorMetrics />
        </div>

        <div className="col-span-12">
          <TrendPenempatanChart />
        </div>

        <div className="col-span-12">
          <StatusSiswa />
        </div>

      </div>
    </>
  );
}