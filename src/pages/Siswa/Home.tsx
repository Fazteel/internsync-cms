import PageMeta from "../../components/common/PageMeta";
import {
  SiswaMetrics,
  LogbookTerbaru,
  ProgresPKL
} from "../../components/dashboard";

export default function DashboardSiswa() {
  return (
    <>
      <PageMeta
        title="Dashboard Siswa | Sistem Manajemen PKL"
        description="Dashboard utama untuk memantau progres kegiatan PKL Siswa"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        
        <div className="col-span-12 xl:col-span-7 flex flex-col gap-4 md:gap-6">
          <SiswaMetrics />
          <LogbookTerbaru />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <ProgresPKL />
        </div>

      </div>
    </>
  );
}