import React from "react";

export interface FilterState {
  search: string;
  status: string;
  startDate: string;
  endDate: string;
  industry: string;
  major: string;
}

interface DataFilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  
  showSearch?: boolean;
  showStatus?: boolean;
  showDateRange?: boolean;
  showIndustry?: boolean;
  showMajor?: boolean;

  statusOptions?: { value: string; label: string }[];
  industryOptions?: { id: string; name: string }[];
  majorOptions?: string[];
}

export default function DataFilter({
  filters,
  setFilters,
  showSearch = false,
  showStatus = false,
  showDateRange = false,
  showIndustry = false,
  showMajor = false,
  statusOptions = [{ value: "All", label: "Semua Status" }],
  industryOptions = [],
  majorOptions = [],
}: DataFilterProps) {

  const handleChange = (field: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
      
      {showSearch && (
        <div className="relative w-full sm:w-[220px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text" 
            placeholder="Cari data..." 
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>
      )}

      {showDateRange && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input 
            type="date" 
            value={filters.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          />
          <span className="text-gray-500">-</span>
          <input 
            type="date" 
            value={filters.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
            className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>
      )}

      {showIndustry && industryOptions.length > 0 && (
        <select 
          value={filters.industry}
          onChange={(e) => handleChange("industry", e.target.value)}
          className="appearance-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 w-full sm:w-auto"
        >
          <option value="All">Semua Industri</option>
          {industryOptions.map((ind) => (
            <option key={ind.id} value={ind.id}>{ind.name}</option>
          ))}
        </select>
      )}

      {showMajor && majorOptions.length > 0 && (
        <select 
          value={filters.major}
          onChange={(e) => handleChange("major", e.target.value)}
          className="appearance-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 w-full sm:w-auto"
        >
          <option value="All">Semua Jurusan</option>
          {majorOptions.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      )}

      {showStatus && (
        <select 
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
          className="appearance-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 w-full sm:w-[160px]"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

    </div>
  );
}