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
  const [projectRoles, setProjectRoles] = useState<any[]>([]);
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
      const promises: Promise<any>[] = [api.getProjects(), api.getMyProjects(MA_NV)];
      const [allRes, myRes] = await Promise.allSettled(promises);

      if (allRes.status === "fulfilled" && allRes.value) {
        setProjects(toArray(allRes.value.data));
      }
      if (myRes.status === "fulfilled" && myRes.value) {
        setMyProjects(toArray(myRes.value.data));
      }
    } catch {
      toast.error("Không thể tải dự án!");
    } finally {
      setLoading(false);
    }
  }, [MA_NV]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (isAdmin) {
      api
        .getEmployees({ pageSize: 1000 })
        .then((r: any) => setEmployees(r.data?.data || r.data?.employees || r.data || []))
        .catch(() => {});
    }
  }, [isAdmin]);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await api.getProjectRoles();
      setProjectRoles(res.data?.data || []);
    } catch (e) {
      console.error("Lỗi lấy vai trò dự án:", e);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Dùng danh sách đầy đủ khi chọn "all", nếu không thì dùng "mine"
  const displayList = viewMode === "all" ? projects : myProjects;

  return {
    projects,
    myProjects,
    displayList,
    employees,
    projectRoles,
    fetchRoles,
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
