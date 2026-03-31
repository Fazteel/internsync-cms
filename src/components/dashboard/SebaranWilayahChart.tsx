import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function SebaranWilayahChart() {
  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
    },
    colors: ["#465FFF", "#10B981", "#F59E0B", "#64748B"], 
    labels: ["Kab. Karawang", "Kab. Bekasi", "Kab. Purwakarta", "Daerah Lainnya"],
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

  const series = [25, 12, 5, 3];

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Chart options={options} series={series} type="donut" width={280} />
    </div>
  );
}