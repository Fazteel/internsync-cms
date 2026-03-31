import React, { useEffect, useState } from "react";
import { useSettingStore } from "../../store/useSettingStore";
import { useAuthStore } from "../../store/useAuthStore";
import Maintenance from "../../temp/OtherPage/Maintenance"; 

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

export default function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { settings, fetchSettings } = useSettingStore();
  const { user } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (Object.keys(settings).length === 0) {
        await fetchSettings();
      }
      setIsReady(true);
    };
    init();
  }, [fetchSettings]);

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const isMaintenance = settings.maintenance_mode === "true";
  const userRole = user?.roles?.[0]?.name || "";

  if (isMaintenance && userRole !== "Admin") {
    return <Maintenance />;
  }

  return <>{children}</>;
}