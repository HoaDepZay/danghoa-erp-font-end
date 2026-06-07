import { useState, useCallback, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { getManv, toArray, getUserLevel } from "../../utils/user";

export const STATUS_COLOR: Record<string, string> = {
  "Đang lên kế hoạch": "purple",
  "Đang thực hiện": "blue",
  "Hoàn thành": "green",
  "Tạm dừng": "yellow",
  Hủy: "red",
};

export const STATUS_OPTIONS = [
  "Đang lên kế hoạch",
  "Đang thực hiện",
  "Hoàn thành",
  "Tạm dừng",
  "Hủy",
];

export const useProjects = (user: any) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ type: "", data: null as any });
  const [viewMode, setViewMode] = useState("all");
  const userLevel = getUserLevel(user);
  const MA_NV = getManv(user);

  // Cập nhật: Quản lý (level 3) và Admin (level 4) đều có quyền xem toàn bộ dự án
  const isAdmin = userLevel >= 3;

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [api.getMyProjects(MA_NV)];
      if (isAdmin) promises.unshift(api.getProjects());

      const results = await Promise.allSettled(promises);

      if (isAdmin) {
        const [allRes, myRes] = results;
        if (allRes.status === "fulfilled" && allRes.value)
          setProjects(toArray(allRes.value.data));
        if (myRes.status === "fulfilled")
          setMyProjects(toArray(myRes.value.data));
      } else {
        const [myRes] = results;
        if (myRes.status === "fulfilled")
          setMyProjects(toArray(myRes.value.data));
      }
    } catch {
      toast.error("Không thể tải dự án!");
    } finally {
      setLoading(false);
    }
  }, [MA_NV, isAdmin]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (isAdmin) {
      api
        .getEmployees({ pageSize: 200 })
        .then((r: any) => setEmployees(r.data?.data || r.data?.employees || r.data || []))
        .catch(() => {});
    }
  }, [isAdmin]);

  // Admin xem "all" thì dùng danh sách đầy đủ, còn lại xem "mine"
  const displayList = isAdmin && viewMode === "all" ? projects : myProjects;

  return {
    projects,
    myProjects,
    displayList,
    employees,
    loading,
    modal,
    setModal,
    viewMode,
    setViewMode,
    userLevel,
    isAdmin,
    fetchProjects,
  };
};
