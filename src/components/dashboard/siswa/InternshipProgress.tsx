import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useDashboardStore } from "../../../store/useDashboardStore";

export default function InternshipProgress() {
  const { siswaProgress } = useDashboardStore();

  const series = [siswaProgress.percentage];

  const options: ApexOptions = {
    colors: ["#006837"],
    chart: { fontFamily: "Outfit, sans-serif", type: "radialBar", height: 330, sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -85, endAngle: 85, hollow: { size: "80%" },
        track: { background: "#E4E7EC", strokeWidth: "100%", margin: 5 },
        dataLabels: {
          name: { show: false },
          value: { fontSize: "36px", fontWeight: "700", offsetY: -40, color: "#1D2939", formatter: function (val) { return val + "%"; } },
        },
      },
    },
    fill: { type: "solid", colors: ["#006837"] },
    stroke: { lineCap: "round" },
    labels: ["Progres"],
  };

  return (
    <div className="rounded-2xl pb-3 border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
      <div className="px-5 pt-5 bg-white rounded-t-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Progres Pelaksanaan PKL</h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Durasi magang yang telah berjalan</p>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]">
            <Chart options={options} series={series} type="radialBar" height={330} />
          </div>

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-600 border border-success-100 dark:border-success-800/30 dark:bg-success-900/20 dark:text-success-400">
            {siswaProgress.percentage >= 100 ? "Selesai" : "Sedang Berjalan"}
          </span>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base leading-relaxed">
          {siswaProgress.percentage >= 100
            ? "Luar biasa! Anda telah menyelesaikan seluruh masa magang."
            : "Tetap semangat mengisi logbook harian dan menyelesaikan tugas PKL!"}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-4 sm:gap-8 sm:py-5 border-t border-gray-100 dark:border-gray-800/50 mt-4">
        <div>
          <p className="mb-1 text-center font-medium text-gray-500 text-theme-xs dark:text-gray-400 sm:text-xs uppercase tracking-wider">Durasi PKL</p>
          <p className="flex items-center justify-center gap-1 text-base font-bold text-gray-800 dark:text-white/90 sm:text-lg">{siswaProgress.total_days} Hari</p>
        </div>
        <div className="w-px bg-gray-200 h-8 dark:bg-gray-800"></div>
        <div>
          <p className="mb-1 text-center font-medium text-gray-500 text-theme-xs dark:text-gray-400 sm:text-xs uppercase tracking-wider">Logbook Diisi</p>
          <p className="flex items-center justify-center gap-1 text-base font-bold text-brand-600 dark:text-brand-400 sm:text-lg">{siswaProgress.days_passed} Catatan</p>
        </div>
        <div className="w-px bg-gray-200 h-8 dark:bg-gray-800"></div>
        <div>
          <p className="mb-1 text-center font-medium text-gray-500 text-theme-xs dark:text-gray-400 sm:text-xs uppercase tracking-wider">Sisa Waktu</p>
          <p className="flex items-center justify-center gap-1 text-base font-bold text-accent-500 sm:text-lg">{siswaProgress.days_remaining} Hari</p>
        </div>
      </div>
    </div>
  );
}