import React from "react";
import { TableRow, TableCell } from "../ui/table";

export function PageHeader({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">{title}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      {children && <div className="flex flex-col sm:flex-row items-center gap-3">{children}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Cari..." }: { value: string; onChange: (val: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:w-[250px]">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 transition-colors"
      />
    </div>
  );
}

export function TableDataState({ isLoading, isEmpty, colSpan, loadingText = "Memuat data...", emptyText = "Data tidak ditemukan.", children }: { isLoading: boolean; isEmpty: boolean; colSpan: number; loadingText?: string; emptyText?: string; children: React.ReactNode }) {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="py-8 text-center text-sm font-bold text-gray-500">{loadingText}</TableCell>
      </TableRow>
    );
  }
  if (isEmpty) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="py-8 text-center text-sm text-gray-500">{emptyText}</TableCell>
      </TableRow>
    );
  }
  return <>{children}</>;
}

export function SelectInput({
  value,
  onChange,
  disabled = false,
  required = false,
  className = "",
  children
}: {
  value: string | number;
  onChange: (val: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative w-full min-w-[100px] md:w-auto ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className="appearance-none w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 cursor-pointer"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  min,
  max
}: {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {label} {required && <span className="text-error-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white"
        required={required}
      />
    </div>
  );
}

// Komponen buat ngatur limit data & total
export const TableTopControls = ({
  rowsPerPage,
  setRowsPerPage,
  totalData,
  setCurrentPage
}: {
  rowsPerPage: number;
  setRowsPerPage: (val: number) => void;
  totalData: number;
  setCurrentPage: (val: number) => void;
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Tampilkan:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
        >
          {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <p className="text-sm text-gray-500 font-medium">Total: {totalData} data</p>
    </div>
  );
};

// Komponen buat Prev, Next, sama info Halaman
export const TablePagination = ({
  currentPage,
  totalPages,
  setCurrentPage
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(p => p - 1)}
        className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      >
        Prev
      </button>
      <span className="text-sm font-bold text-gray-800 dark:text-white">
        {currentPage} / {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(p => p + 1)}
        className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      >
        Next
      </button>
    </div>
  );
};