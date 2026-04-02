import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../../icons";
import { useDashboardStore } from "../../../store/useDashboardStore";

export default function TrendPenempatanChart() {
  const { koordinatorChart } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);

  const options: ApexOptions = {
    colors: ["#006837"],
    chart: { fontFamily: "Outfit, sans-serif", type: "bar", height: 250, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: "39%", borderRadius: 5, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"], axisBorder: { show: false }, axisTicks: { show: false } },
    legend: { show: false },
    yaxis: { title: { text: "Jumlah Siswa", style: { fontSize: "12px", fontWeight: 500 } } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val: number) => `${val} Siswa` } },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Tren Keberangkatan Siswa PKL</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Statistik jumlah siswa yang diterjunkan ke industri per bulan</p>
        </div>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
            <MoreDotIcon className="text-gray-400 hover:text-brand-500 transition-colors size-6" />
          </button>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem onItemClick={() => setIsOpen(false)} className="flex w-full font-normal text-left text-gray-600 rounded-lg hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-colors">
              Lihat Detail
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar mt-4">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={koordinatorChart} type="bar" height={250} />
        </div>
      </div>
    </div>
  );
}