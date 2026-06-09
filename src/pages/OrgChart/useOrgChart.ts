import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { toArray } from "../../utils/user";

export interface OrgNodeData {
  id: string;
  type: "root" | "department" | "role";
  title: string;
  subtitle?: string;
  count: number;
  employees: any[];
  departmentData?: any;
  children: OrgNodeData[];
}

export const useOrgChart = () => {
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<OrgNodeData | null>(null);
  
  // Data for Modals
  const [selectedNode, setSelectedNode] = useState<OrgNodeData | null>(null);

  const fetchOrgData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all employees and departments
      const [empRes, deptRes] = await Promise.all([
        api.getEmployees({ page: 1, pageSize: 10000 }),
        api.getDepartments()
      ]);
      
      const allEmployees = toArray(empRes.data);
      const allDepartments = Array.isArray(deptRes.data) ? deptRes.data : Array.isArray(deptRes.data?.data) ? deptRes.data.data : [];

      // 1. Root Node: Giám đốc
      const directors = allEmployees.filter(emp => emp.CHUC_VU === "Giám đốc" || emp.CHUC_VU === "Admin");
      
      const rootNode: OrgNodeData = {
        id: "root",
        type: "root",
        title: "Ban Giám đốc",
        count: directors.length,
        employees: directors,
        children: []
      };

      // 2. Department Nodes
      allDepartments.forEach((dept: any) => {
        // Find employees in this department
        const deptEmployees = allEmployees.filter(emp => emp.MA_PHG === dept.MA_PHG);
        
        // Find the manager of this department (usually Chức vụ = Quản lý, or using MA_TRUONG_PHG)
        const manager = deptEmployees.find(emp => emp.MA_NV === dept.MA_TRUONG_PHG || emp.MA_NV === dept.MATRUONGPHG || emp.CHUC_VU === "Quản lý");
        const managerName = manager ? manager.HO_TEN : "Chưa có trưởng phòng";

        const deptNode: OrgNodeData = {
          id: `dept_${dept.MA_PHG}`,
          type: "department",
          title: dept.TEN_PB || dept.TEN_PHG || "Phòng ban không tên",
          subtitle: `Trưởng phòng: ${managerName}`,
          count: deptEmployees.length,
          employees: deptEmployees,
          departmentData: dept,
          children: []
        };

        // 3. Roles within department
        // Group remaining employees by Role (excluding manager if we only want to show staff, but here we group all by role)
        const rolesInDept = ["Nhân viên", "Cộng tác viên"];
        rolesInDept.forEach(role => {
          const employeesInRole = deptEmployees.filter(emp => emp.CHUC_VU === role);
          if (employeesInRole.length > 0) {
            deptNode.children.push({
              id: `role_${dept.MA_PHG}_${role}`,
              type: "role",
              title: role,
              count: employeesInRole.length,
              employees: employeesInRole,
              children: []
            });
          }
        });

        rootNode.children.push(deptNode);
      });

      setTreeData(rootNode);
    } catch (error) {
      toast.error("Không thể tải dữ liệu sơ đồ tổ chức!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgData();
  }, [fetchOrgData]);

  return {
    loading,
    treeData,
    selectedNode,
    setSelectedNode
  };
};
