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

/* ================= SISWA ================= */

import StudentDashboard from "./pages/Siswa/Home";
import PlacementData from "./pages/Siswa/PlacementData";
import Logbook from "./pages/Siswa/Logbook";
import StudentPermission from "./pages/Siswa/StudentPermission";
import InternshipEvaluation from "./pages/Siswa/Evaluation";

/* ================= PEMBIMBING ================= */

import SupervisorDashboard from "./pages/Pembimbing/Home";
import SupervisionList from "./pages/Pembimbing/SupervisionList";
import StudentDetail from "./pages/Pembimbing/StudentDetail";
import LogbookMonitoring from "./pages/Pembimbing/LogbookMonitoring";
import SupervisorPermission from "./pages/Pembimbing/SupervisorPermission";
import StudentEvaluation from "./pages/Pembimbing/StudentEvaluation";
import IndustryVisit from "./pages/Pembimbing/IndustryVisit";

/* ================= KOORDINATOR ================= */

import CoordinatorDashboard from "./pages/Koordinator/Home";
import InternshipPlacementList from "./pages/Koordinator/InternshipPlacement";
import InternshipApplicationList from "./pages/Koordinator/InternshipApplication";
import InternshipHistoryList from "./pages/Koordinator/InternshipHistoryList";
import InternshipSummary from "./pages/Koordinator/SummaryReport";

/* ================= HUBIN ================= */

import HubinDashboard from "./pages/Hubin/Home";
import IndustryManagement from "./pages/Hubin/IndustryManagement";
import HubinApplicationList from "./pages/Hubin/HubinAppicationsList";
import HubinPlacementsList from "./pages/Hubin/HubinPlacementsList";
import IndustryVisitApproval from "./pages/Hubin/IndustryVisitApproval";
import MasterReport from "./pages/Hubin/MasterReport";

/* ================= ADMIN ================= */

import AdminDashboard from "./pages/Admin/Home";
import UserManagement from "./pages/Admin/UserManagement";
import DataMaster from "./pages/Admin/DataMaster";
import SystemSetting from "./pages/Admin/Setting";
import ActivityLogs from "./pages/Admin/ActivityLogs";

import UserProfiles from "./pages/UserProfiles";

/* ================= ROLE REDIRECT ================= */

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
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "siswa":
      return <Navigate to="/siswa/dashboard" replace />;
    case "pembimbing":
      return <Navigate to="/pembimbing/dashboard" replace />;
    case "koordinator":
      return <Navigate to="/koordinator/dashboard" replace />;
    case "hubin":
      return <Navigate to="/hubin/dashboard" replace />;
    default:
      return <Navigate to="/signin" replace />;
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

              {/* ================= STUDENT ================= */}

              <Route path="/siswa">
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="placement" element={<PlacementData />} />
                <Route path="logbook" element={<Logbook />} />
                <Route path="permissions" element={<StudentPermission />} />
                <Route path="evaluation" element={<InternshipEvaluation />} />
              </Route>

              {/* ================= SUPERVISOR ================= */}

              <Route path="/pembimbing">
                <Route path="dashboard" element={<SupervisorDashboard />} />
                <Route path="supervisions" element={<SupervisionList />} />
                <Route path="supervisions/:id" element={<StudentDetail />} />
                <Route path="logbook-approvals" element={<LogbookMonitoring />} />
                <Route path="permissions" element={<SupervisorPermission />} />
                <Route path="student-evaluations" element={<StudentEvaluation />} />
                <Route path="industry-visits" element={<IndustryVisit />} />
              </Route>

              {/* ================= COORDINATOR ================= */}

              <Route path="/koordinator">
                <Route path="dashboard" element={<CoordinatorDashboard />} />
                <Route path="internship-placements" element={<InternshipPlacementList />} />
                <Route path="internship-applications" element={<InternshipApplicationList />} />
                <Route path="placements-history" element={<InternshipHistoryList />} />
                <Route path="summary-reports" element={<InternshipSummary />} />
              </Route>

              {/* ================= HUBIN ================= */}

              <Route path="/hubin">
                <Route path="dashboard" element={<HubinDashboard />} />
                <Route path="industries" element={<IndustryManagement />} />
                <Route path="departure-approvals/application" element={<HubinApplicationList />} />
                <Route path="departure-approvals/placement" element={<HubinPlacementsList />} />
                <Route path="industry-visit-approvals" element={<IndustryVisitApproval />} />
                <Route path="master-reports" element={<MasterReport />} />
              </Route>

              {/* ================= ADMIN ================= */}

              <Route path="/admin">
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="master-data" element={<DataMaster />} />
                <Route path="system-setting" element={<SystemSetting />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
              </Route>

            </Route>
          </Route>

          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
      </MaintenanceGuard>
    </Router>
  );
}