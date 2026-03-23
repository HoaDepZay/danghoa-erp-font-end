import { useState, useCallback, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { getManv, toArray, getUserLevel } from "../../utils/user";

export const STATUS_COLOR: Record<string, string> = {
  "Đang thực hiện": "blue",
  "Hoàn thành": "green",
  "Tạm dừng": "yellow",
  Hủy: "red",
};

export const useProjects = (user: any) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ type: "", data: null as any });
  const [viewMode, setViewMode] = useState("all");

  const userLevel = getUserLevel(user);
  const manv = getManv(user);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.allSettled([
        userLevel >= 2 ? api.getProjects() : Promise.resolve(null),
        api.getMyProjects(manv),
      ]);
      if (allRes.status === "fulfilled" && allRes.value)
        setProjects(toArray(allRes.value.data));
      if (myRes.status === "fulfilled")
        setMyProjects(toArray(myRes.value.data));
    } catch {
      toast.error("Không thể tải dự án!");
    } finally {
      setLoading(false);
    }
  }, [manv, userLevel]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    api.getEmployees({ pageSize: 200 })
      .then((r: any) => setEmployees(r.data?.data || r.data?.employees || r.data || []))
      .catch(() => {});
  }, []);

  const displayList = viewMode === "mine" ? myProjects : projects;

  return {
    projects, myProjects, displayList, employees, loading,
    modal, setModal, viewMode, setViewMode, userLevel, fetchProjects
  };
};

