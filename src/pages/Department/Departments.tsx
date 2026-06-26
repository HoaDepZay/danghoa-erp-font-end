import React from "react";
import { Plus, Building2 } from "lucide-react";
import { Btn, Card, SectionHeader, EmptyState, SkeletonRows } from "../../components/UI/index";
import { useDepartments } from "./useDepartments";
import { DepartmentTable } from "./DepartmentTable";
import { DeptModal, DeptDetailModal } from "./DepartmentModal";

export const Departments: React.FC<{ user: any, onNavigate: (page: string) => void }> = ({ user, onNavigate }) => {
  const { departments, employees, loading, modal, setModal, isAdmin, fetchDepts } = useDepartments(user);

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Phòng ban"
        subtitle={`${departments.length} phòng ban trong hệ thống`}
        actions={isAdmin && (
          <Btn size="sm" icon={<Plus size={14} />} onClick={() => setModal({ type: "add", data: null })}>
            Thêm phòng ban
          </Btn>
        )}
      />

       {loading ? (
        <Card padding={false}>
          <table className="data-table">
            <thead><tr><th>Mã</th><th>Tên phòng ban</th><th>Trưởng phòng</th><th>Thao tác</th></tr></thead>
            <tbody><SkeletonRows cols={4} rows={6} /></tbody>
          </table>
        </Card>
      ) : departments.length === 0 ? (
        <Card><EmptyState icon={<Building2 size={48} />} title="Chưa có phòng ban nào" description="Thêm phòng ban đầu tiên" /></Card>
      ) : (
        <DepartmentTable departments={departments} userLevel={isAdmin ? 4 : 1} setModal={setModal} onNavigate={onNavigate} />
      )}

      <DeptModal
         isOpen={modal.type === "add" || modal.type === "edit"}
        onClose={() => setModal({ type: "", data: null })}
        editData={modal.type === "edit" ? modal.data : null}
         employees={employees}
        onSuccess={fetchDepts}
      />
    </div>
  );
};

export default Departments;

