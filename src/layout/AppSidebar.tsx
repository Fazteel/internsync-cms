/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom"; 
import { useAuthStore } from "../store/useAuthStore";

import {
  GridIcon,
  ListIcon,
  PageIcon,
  TableIcon,
  CalenderIcon,
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const siswaMenu: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: "/siswa/dashboard" },
  { name: "Data Penempatan", icon: <TableIcon />, path: "/siswa/placement" },
  { name: "Logbook Harian", icon: <ListIcon />, path: "/siswa/logbook" },
  { name: "Evaluasi & Nilai", icon: <PageIcon />, path: "/siswa/evaluation" },
];

const pembimbingMenu: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: "/pembimbing/dashboard" },
  { name: "Daftar Bimbingan", icon: <TableIcon />, path: "/pembimbing/supervisions" },
  { name: "Verifikasi Logbook", icon: <ListIcon />, path: "/pembimbing/logbook-approvals" },
  { name: "Evaluasi Siswa", icon: <PageIcon />, path: "/pembimbing/student-evaluations" },
  { name: "Perjalanan Dinas", icon: <CalenderIcon />, path: "/pembimbing/industry-visits" },
];

const koordinatorMenu: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: "/koordinator/dashboard" },
  { name: "Plotting Pembimbing", icon: <ListIcon />, path: "/koordinator/supervisor-assignments" },
  { name: "Kelola Penempatan", icon: <TableIcon />, path: "/koordinator/placements" },
  { name: "Rekapitulasi", icon: <PageIcon />, path: "/koordinator/summary-reports" },
];

const hubinMenu: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: "/hubin/dashboard" },
  { name: "Kelola Industri", icon: <TableIcon />, path: "/hubin/industries" },
  { name: "Approval Keberangkatan", icon: <ListIcon />, path: "/hubin/departure-approvals" },
  { name: "Approval Perjalanan Dinas", icon: <CalenderIcon />, path: "/hubin/industry-visit-approvals" },
  { name: "Master Rekap", icon: <PageIcon />, path: "/hubin/master-reports" },
];

const adminMenu: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: "/admin/dashboard" },
  { name: "Kelola Pengguna", icon: <ListIcon />, path: "/admin/users" },
  { name: "Data Master", icon: <TableIcon />, path: "/admin/master-data" },
  { name: "Activity Logs", icon: <ListIcon />, path: "/admin/activity-logs" },
  { name: "Pengaturan Sistem", icon: <PageIcon />, path: "/admin/system-setting" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { user } = useAuthStore();

  const userRole = user?.roles?.[0]?.name?.toLowerCase() || "siswa";

  let currentNavItems: NavItem[] = [];
  if (userRole === "siswa") currentNavItems = siswaMenu;
  else if (userRole === "pembimbing") currentNavItems = pembimbingMenu;
  else if (userRole === "koordinator") currentNavItems = koordinatorMenu;
  else if (userRole === "hubin") currentNavItems = hubinMenu;
  else if (userRole === "admin") currentNavItems = adminMenu; 

  const [openSubmenu, setOpenSubmenu] = useState<{ type: "main" | "others"; index: number; } | null>(null);
  const [, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  useEffect(() => {
    let submenuMatched = false;
    const items = currentNavItems; 
    items.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: "main", index });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, currentNavItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) return null;
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const isSubmenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
        return (
          <li key={nav.name}>
            {nav.subItems ? (
               <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group cursor-pointer ${
                  isSubmenuOpen
                    ? "bg-brand-800 text-white"
                    : "text-brand-100 hover:bg-white/10 hover:text-white"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span className={`menu-item-icon-size ${isSubmenuOpen ? "text-accent-500" : "text-brand-300 group-hover:text-brand-100"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      isSubmenuOpen ? "rotate-180 text-accent-500" : "text-brand-300 group-hover:text-brand-100"
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) 
                      ? "bg-brand-800 text-white" 
                      : "text-brand-100 hover:bg-white/10 hover:text-white"
                  } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                >
                  <span className={`menu-item-icon-size ${isActive(nav.path) ? "text-accent-500" : "text-brand-300 group-hover:text-brand-100"}`}>
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-brand-950 dark:bg-gray-900 border-brand-900 dark:border-gray-800 text-gray-100 h-screen transition-all duration-300 ease-in-out z-50 border-r 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        <div className={`py-8 flex overflow-hidden ${!isExpanded && !isHovered && !isMobileOpen ? "lg:justify-center" : "justify-start"}`}>
          <Link to="/" className="flex items-center overflow-hidden">
              {isExpanded || isHovered || isMobileOpen ? (
                <span className="text-2xl font-bold text-white whitespace-nowrap">
                  Intern<span className="text-accent-500">Sync</span>
                </span>
              ) : (
                <span className="text-2xl font-bold text-white whitespace-nowrap">
                  I<span className="text-accent-500">S</span>
                </span>
              )}
          </Link>
        </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-brand-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  `Menu ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}` 
                ) : (
                  <HorizontaLDots className="size-6 text-brand-400" />
                )}
              </h2>
              {renderMenuItems(currentNavItems, "main")} 
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;