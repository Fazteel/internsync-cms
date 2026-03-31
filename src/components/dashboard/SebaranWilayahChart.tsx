import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useDashboardStore } from "../../store/useDashboardStore";

export default function SebaranWilayahChart() {
  const { hubinSebaran } = useDashboardStore();

  const chartLabels = hubinSebaran.length > 0 ? hubinSebaran.map(item => item.name) : ["Belum ada data"];
  const chartSeries = hubinSebaran.length > 0 ? hubinSebaran.map(item => item.count) : [0];

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
    },
    colors: ["#006837", "#F59E0B", "#3B82F6", "#DC2626", "#A855F7", "#64748B"],
    labels: chartLabels,
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              color: "#6B7280",
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 600,
              color: "#1F2937",
            },
            total: {
              show: true,
              showAlways: true,
              label: "Total Mitra",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return `${total}`;
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) => `${val} Perusahaan`,
      },
    },
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Chart options={options} series={chartSeries} type="donut" width={280} />
    </div>
  );
}