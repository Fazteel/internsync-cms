import PageMeta from "../../components/common/PageMeta";
import {
  CoordinatorMetrics,
  PlacementTrendChart,
  StudentStats
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
          <CoordinatorMetrics />
        </div>

        <div className="col-span-12">
          <PlacementTrendChart />
        </div>

        <div className="col-span-12">
          <StudentStats />
        </div>

      </div>
    </>
  );
}