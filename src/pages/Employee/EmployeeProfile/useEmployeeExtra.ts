import { useState, useEffect } from "react";
import { api } from "../../../services/api";

export const useEmployeeExtra = (employeeId: string | null, activeTab: string, user: any, userLevel: number) => {
  const [departmentInfo, setDepartmentInfo] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  useEffect(() => {
    if (employeeId && activeTab === "employment") {
      setLoadingExtra(true);

      api.getEmployeeDepartmentDetail(employeeId)
        .then(res => {
          const dept = res.data?.data || res.data;
          setDepartmentInfo(dept);

          const isDirectorOrAdmin = userLevel >= 4 || user?.CHUC_VU === "Giám đốc";
          const isSelf = user?.MA_NV === employeeId;
          const isManager = dept?.MA_TRUONG_PHG === user?.MA_NV || dept?.MATRUONGPHG === user?.MA_NV;
          const canViewLeaves = isDirectorOrAdmin || isSelf || isManager;

          const promises = [
            api.getMyProjects(employeeId).then(r => r.data?.data || r.data).catch(() => [])
          ];

          if (canViewLeaves) {
            promises.push(
              api.getLeaves({ MA_NV: employeeId }).then(r => r.data?.data || r.data).catch(() => [])
            );
          } else {
            promises.push(Promise.resolve([]));
          }

          return Promise.all(promises);
        })
        .then(([proj, lv]) => {
          setProjects(Array.isArray(proj) ? proj : []);
          setLeaves(Array.isArray(lv) ? lv : []);
        })
        .catch(() => {})
        .finally(() => setLoadingExtra(false));
    }
  }, [employeeId, activeTab, user, userLevel]);

  return { departmentInfo, projects, leaves, loadingExtra };
};
