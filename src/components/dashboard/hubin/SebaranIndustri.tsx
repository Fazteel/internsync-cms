import { useState } from "react";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../../icons";
import SebaranWilayahChart from "../SebaranWilayahChart";

export default function SebaranIndustri() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Sebaran Industri Mitra
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Lokasi perusahaan tempat siswa PKL
          </p>
        </div>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-brand-500 transition-colors size-6" />
          </button>
          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
            <DropdownItem onItemClick={closeDropdown} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-colors">
              Lihat Detail Kota
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="px-4 py-4 my-4 flex justify-center border border-gray-100 rounded-2xl bg-gray-50/50 dark:border-gray-800/50 dark:bg-gray-900/20 sm:px-6">
        <SebaranWilayahChart />
      </div>

      <div className="space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">Kab. Karawang</p>
              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">25 Perusahaan</span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2.5 w-full max-w-[100px] rounded-full bg-brand-100 dark:bg-gray-700">
              <div className="absolute left-0 top-0 flex h-full w-[60%] rounded-full bg-brand-500 shadow-[0_0_8px_rgba(0,104,55,0.4)]"></div>
            </div>
            <p className="font-medium text-gray-800 text-theme-sm dark:text-gray-300">60%</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">Kab. Bekasi</p>
              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">12 Perusahaan</span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2.5 w-full max-w-[100px] rounded-full bg-brand-100 dark:bg-gray-700">
              <div className="absolute left-0 top-0 flex h-full w-[28%] rounded-full bg-accent-500 shadow-[0_0_8px_rgba(247,181,0,0.4)]"></div>
            </div>
            <p className="font-medium text-gray-800 text-theme-sm dark:text-gray-300">28%</p>
          </div>
        </div>

      </div>
    </div>
  );
}