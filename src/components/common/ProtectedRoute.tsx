import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 font-medium">Memeriksa sesi dan hak akses...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" replace />;
  }

  const role = user.roles?.[0]?.name?.toLowerCase() || "";
  const path = location.pathname;

  if (path.startsWith("/admin") && role !== "admin") return <Navigate to="/" replace />;
  if (path.startsWith("/siswa") && role !== "siswa") return <Navigate to="/" replace />;
  if (path.startsWith("/pembimbing") && role !== "pembimbing") return <Navigate to="/" replace />;
  if (path.startsWith("/koordinator") && role !== "koordinator") return <Navigate to="/" replace />;
  if (path.startsWith("/hubin") && role !== "hubin") return <Navigate to="/" replace />;

  return <Outlet />;
}