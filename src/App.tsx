import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";

import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MaintenanceGuard from "./components/common/MaintenanceGuard";

import SignIn from "./pages/AuthPages/SignIn";
import SetPassword from "./pages/AuthPages/SetPassword";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";

import NotFound from "./temp/OtherPage/NotFound";
import Maintenance from "./temp/OtherPage/Maintenance"; 

import SiswaHome from "./pages/Siswa/Home";
import DataPenempatan from "./pages/Siswa/DataPenempatan";
import Logbook from "./pages/Siswa/Logbook";
import EvaluasiPKL from "./pages/Siswa/Evaluasi";

import PembimbingHome from "./pages/Pembimbing/Home";
import DaftarBimbingan from "./pages/Pembimbing/DaftarBimbingan";
import DetailSiswa from "./pages/Pembimbing/DetailSiswa";
import VerifikasiLogbook from "./pages/Pembimbing/VerifikasiLogbook";
import EvaluasiSiswa from "./pages/Pembimbing/EvaluasiSiswa";
import PerjalananDinas from "./pages/Pembimbing/PerjalananDinas";

import KoordinatorHome from "./pages/Koordinator/Home";
import KelolaPenempatan from "./pages/Koordinator/KelolaPenempatan";
import PlottingPembimbing from "./pages/Koordinator/Plottingpembimbing";
import RekapitulasiPKL from "./pages/Koordinator/Rekapitulasi";

import HubinHome from "./pages/Hubin/Home";
import KelolaIndustri from "./pages/Hubin/KelolaIndustri";
import ApprovalKeberangkatan from "./pages/Hubin/ApprovalKeberangkatan";
import ApprovalPerjalananDinas from "./pages/Hubin/ApprovalDinas";
import MasterRekap from "./pages/Hubin/MasterRekap";

import AdminHome from "./pages/Admin/Home";
import KelolaPengguna from "./pages/Admin/KelolaPengguna";
import DataMaster from "./pages/Admin/DataMaster";
import PengaturanSistem from "./pages/Admin/Pengaturan";
import ActivityLogs from "./pages/Admin/ActivityLogs";

import UserProfiles from "./pages/UserProfiles";

const RoleBasedRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 font-medium">Memeriksa sesi...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" replace />;
  }

  const role = user.roles?.[0]?.name?.toLowerCase() || "";

  switch (role) {
    case "admin": return <Navigate to="/admin/dashboard" replace />;
    case "siswa": return <Navigate to="/siswa/dashboard" replace />;
    case "pembimbing": return <Navigate to="/pembimbing/dashboard" replace />;
    case "koordinator": return <Navigate to="/koordinator/dashboard" replace />;
    case "hubin": return <Navigate to="/hubin/dashboard" replace />;
    default: return <Navigate to="/signin" replace />;
  }
};

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <ScrollToTop />
      <MaintenanceGuard>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/" element={<RoleBasedRedirect />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/profile" element={<UserProfiles />} />
              
              <Route path="/siswa">
                <Route path="dashboard" element={<SiswaHome />} />
                <Route path="penempatan" element={<DataPenempatan />} />
                <Route path="logbook" element={<Logbook />} />
                <Route path="evaluasi" element={<EvaluasiPKL />} />
              </Route>

              <Route path="/pembimbing">
                <Route path="dashboard" element={<PembimbingHome/>} />
                <Route path="bimbingan" element={<DaftarBimbingan />} />
                <Route path="bimbingan/:id" element={<DetailSiswa />} />
                <Route path="verifikasi-logbook" element={<VerifikasiLogbook />} />
                <Route path="evaluasi-siswa" element={<EvaluasiSiswa />} />
                <Route path="perjalanan-dinas" element={<PerjalananDinas />} />
              </Route>

              <Route path="/koordinator">
                <Route path="dashboard" element={<KoordinatorHome />} />
                <Route path="penempatan" element={<KelolaPenempatan />} />
                <Route path="plotting" element={<PlottingPembimbing />} />
                <Route path="rekapitulasi" element={<RekapitulasiPKL />} />
              </Route>

              <Route path="/hubin">
                <Route path="dashboard" element={<HubinHome />} />
                <Route path="kelola-industri" element={<KelolaIndustri />} />
                <Route path="approval-berangkat" element={<ApprovalKeberangkatan />} />
                <Route path="approval-dinas" element={<ApprovalPerjalananDinas />} />
                <Route path="master-rekap" element={<MasterRekap />} />
              </Route>

              <Route path="/admin">
                <Route path="dashboard" element={<AdminHome />} />
                <Route path="kelola-pengguna" element={<KelolaPengguna />} />
                <Route path="data-master" element={<DataMaster />} />
                <Route path="pengaturan" element={<PengaturanSistem />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Routes>
      </MaintenanceGuard>
    </Router>
  );
}