import React from "react";
import { UserPlus, Search, Download, Users, UserCheck, UserX } from "lucide-react";
import { Btn, Card, SectionHeader, Pagination } from "../../../components/UI/index";
import { useEmployees } from "./useEmployees";
import { EmployeeModal } from "./EmployeeModal";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeDetails } from "../EmployeeDetails/EmployeeDetails";

export const Employees: React.FC<{ user: any; onNavigate: (page: string) => void }> = ({ user, onNavigate }) => {
  const {
    employees, departments, loading, search, setSearch, page, setPage, totalPages, total,
    modal, setModal, userLevel, fetchEmployees, handleExport,
    filterDept, setFilterDept, filterRole, setFilterRole, filterStatus, setFilterStatus, stats
  } = useEmployees(user);

  const handleViewDetail = (maNv: string) => {
    localStorage.setItem("selectedEmployeeId", maNv);
    onNavigate("employee_profile");
  };

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Nhân viên"
        subtitle={`${total} người · Trang ${page}/${totalPages || 1}`}
        actions={
          <>
            <Btn variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExport}>Xuất CSV</Btn>
            {userLevel >= 3 && (
              <Btn size="sm" icon={<UserPlus size={14} />} onClick={() => setModal({ type: "add", data: null })}>Thêm nhân viên</Btn>
            )}
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Card padding={true}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Tổng nhân viên</p>
              <h3 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700, color: "#0f172a" }}>{stats.totalEmployees}</h3>
            </div>
          </div>
        </Card>
        <Card padding={true}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
              <UserCheck size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Đang làm việc</p>
              <h3 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700, color: "#0f172a" }}>{stats.workingCount}</h3>
            </div>
          </div>
        </Card>
        <Card padding={true}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}>
              <UserX size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Nghỉ việc / Off</p>
              <h3 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700, color: "#0f172a" }}>{stats.offCount}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-4">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <div style={{ position: "relative", flex: "1 1 300px" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input
              className="form-input"
              style={{ paddingLeft: 36, width: "100%" }}
              placeholder="Tìm theo tên, mã NV, EMAIL..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="form-input" style={{ flex: "1 1 150px" }} value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}>
            <option value="all">Tất cả phòng ban</option>
            {departments.map((d: any) => (
              <option key={d.MA_PHG || d.id} value={d.TEN_PB || d.TEN_PHG}>{d.TEN_PB || d.TEN_PHG}</option>
            ))}
          </select>
          <select className="form-input" style={{ flex: "1 1 150px" }} value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}>
            <option value="all">Tất cả chức vụ</option>
            <option value="Admin">Admin</option>
            <option value="Giám đốc">Giám đốc</option>
            <option value="Quản lý">Quản lý</option>
            <option value="Trưởng phòng">Trưởng phòng</option>
            <option value="Phó phòng">Phó phòng</option>
            <option value="Phó dự án">Phó dự án</option>
            <option value="Nhân viên">Nhân viên</option>
            <option value="Cộng tác viên">Cộng tác viên</option>
          </select>
          <select className="form-input" style={{ flex: "1 1 150px" }} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="working">Đang làm việc</option>
            <option value="off">Nghỉ việc / Off</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </Card>

      <Card padding={false}>
         <EmployeeTable loading={loading} employees={employees} userLevel={userLevel} setModal={setModal} onNavigate={onNavigate} onViewDetail={handleViewDetail} />
        <div style={{ padding: "8px 16px", borderTop: "1px solid #f5f5f5" }}>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      <EmployeeModal
         isOpen={modal.type === "add" || modal.type === "edit"}
        onClose={() => setModal({ type: "", data: null })}
        editData={modal.type === "edit" ? modal.data : null}
         departments={departments}
        onSuccess={fetchEmployees}
      />
    </div>
  );
};

export default Employees;

