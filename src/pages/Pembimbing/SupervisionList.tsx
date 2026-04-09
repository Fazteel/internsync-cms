import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { PageHeader, SearchInput, SelectInput, TableDataState, TablePagination, TableTopControls } from "../../components/common/SharedUI";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { useStudentMenteeStore } from "../../store/Pembimbing/useStudentMenteeStore";

type FilterStatusType = "All" | "Aktif" | "Menunggu" | "Selesai";

export default function SupervisionList() {
  const { students, isLoading, fetchStudents } = useStudentMenteeStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>("All");
  const [expandedIndustries, setExpandedIndustries] = useState<string[]>([]);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const toggleIndustry = (industryName: string) => {
    setExpandedIndustries((prev) =>
      prev.includes(industryName) ? prev.filter((i) => i !== industryName) : [...prev, industryName]
    );
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm);
    const matchStatus = filterStatus === "All" ? true : s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const groupedData = filteredStudents.reduce((acc: { [key: string]: typeof students }, student) => {
    const key = student.industry || "Tanpa Industri";
    if (!acc[key]) acc[key] = [];
    acc[key].push(student);
    return acc;
  }, {});

  const industryNames = Object.keys(groupedData);
  const totalPages = Math.ceil(industryNames.length / rowsPerPage);
  const paginatedIndustries = industryNames.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <PageMeta title="Daftar Bimbingan | InternSync" description="Pantau daftar siswa bimbingan per industri." />

      <div className="space-y-6">
        <PageHeader
          title="Daftar Siswa Bimbingan"
          description="Pantau penempatan dan progres PKL siswa yang dikelompokkan per lokasi industri."
        >
          <SearchInput
            value={searchTerm}
            onChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            placeholder="Cari nama atau NIS..." />
          <SelectInput
            value={filterStatus}
            onChange={(val) => { setFilterStatus(val as FilterStatusType); setCurrentPage(1); }}
          >
            <option value="All">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Selesai">Selesai</option>
          </SelectInput>
        </PageHeader>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
          <TableTopControls
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalData={industryNames.length}
            setCurrentPage={setCurrentPage}
          />

          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-800/20 border-y border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="py-3 px-4 text-start text-theme-xs font-bold uppercase text-gray-500 w-[35%]">Nama Industri</TableCell>
                  <TableCell isHeader className="py-3 text-start text-theme-xs font-bold uppercase text-gray-500 w-[30%]">Periode Penempatan</TableCell>
                  <TableCell isHeader className="py-3 text-center text-theme-xs font-bold uppercase text-gray-500 w-[15%]">Jumlah Siswa</TableCell>
                  <TableCell isHeader className="py-3 text-end text-theme-xs font-bold uppercase text-gray-500 pr-10 w-[15%]">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                <TableDataState
                  isLoading={isLoading}
                  isEmpty={industryNames.length === 0}
                  colSpan={5}
                  loadingText="Memuat data bimbingan..."
                >
                  {paginatedIndustries.map((industryName) => {
                    const isExpanded = expandedIndustries.includes(industryName);
                    const mentees = groupedData[industryName];
                    const sampleStudent = mentees[0];

                    return (
                      <React.Fragment key={industryName}>
                        <TableRow
                          className={`cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 ${isExpanded ? "bg-brand-50/30 dark:bg-brand-500/5" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/20"}`}
                          onClick={() => toggleIndustry(industryName)}
                        >
                          <TableCell className="py-4 px-4">
                            <p className="font-bold text-gray-800 dark:text-white/90 text-sm">{industryName}</p>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <CalenderIcon className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                    {sampleStudent.departure_date} - {sampleStudent.final_end_date}
                                </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                              {mentees.length} Siswa
                            </span>
                          </TableCell>
                          <TableCell className="py-4 pr-10">
                            <div className="flex justify-end">
                              <svg
                                className={`w-5 h-5 transition-transform ${
                                  isExpanded ? "rotate-90 text-brand-500" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                              </svg>
                            </div>
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={5} className="p-0 border-0">
                              <div className="bg-gray-50/30 px-8 py-4 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 animate-fade-in">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Daftar Siswa Bimbingan</h4>

                                <div className="space-y-2">
                                  {mentees.map((student) => {
                                    return (
                                      <div key={student.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-brand-200 transition-all group">
                                        <div className="flex items-center gap-4 w-[40%]">
                                          <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold text-xs uppercase dark:bg-gray-700 dark:text-gray-300">
                                                    {student.name.charAt(0)}
                                                </div>
                                                {student.is_flagged && (
                                                    <span className="absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-error-500 border-2 border-white dark:border-gray-800 animate-pulse"></span>
                                                )}
                                            </div>
                                            <div>
                                              <p className="font-bold text-gray-800 text-xs dark:text-white/90">{student.name}</p>
                                              <span className="text-[10px] text-gray-500">{student.nis} • {student.major}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-8 justify-end flex-1">
                                          <div className="hidden sm:flex flex-col gap-1 w-44">
                                            <div className="flex justify-between text-[9px] font-bold text-gray-500">
                                              <span>{student.passed_label} / {student.duration_label}</span>
                                              <span className={student.progress_percent >= 100 ? 'text-success-600' : 'text-brand-600'}>
                                                {student.progress_percent}%
                                              </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                                              <div
                                                className={`h-full rounded-full transition-all duration-700 ${student.progress_percent >= 100 ? 'bg-success-500' : 'bg-brand-500'}`}
                                                style={{ width: `${student.progress_percent}%` }}
                                              ></div>
                                            </div>
                                          </div>

                                          <Badge size="sm" color={student.status === "Aktif" ? "success" : student.status === "Selesai" ? "primary" : student.status === "Menunggu" ? "warning" : "error"}>
                                            {student.status}
                                          </Badge>

                                          <Link
                                            to={`/pembimbing/supervisions/${student.id}`}
                                            className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors"
                                          >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                          </Link>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableDataState>
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
}

function CalenderIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
    );
}