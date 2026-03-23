import React from "react";
import { UserPlus, Search, Download } from "lucide-react";
import { Btn, Card, SectionHeader, Pagination } from "../../../components/UI/index";
import { useEmployees } from "./useEmployees";
import { EmployeeModal } from "./EmployeeModal";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeDetails } from "../EmployeeDetails/EmployeeDetails";

export const Employees: React.FC<{ user: any }> = ({ user }) => {
  const {
    employees, departments, loading, search, setSearch, page, setPage, totalPages, total,
    modal, setModal, userLevel, fetchEmployees, handleExport
  } = useEmployees(user);

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

      <Card className="mb-4">
        <div style={{ position: "relative" }}>
           <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
          <input
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Tìm theo tên, mã NV, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
       </Card>

      <Card padding={false}>
         <EmployeeTable loading={loading} employees={employees} userLevel={userLevel} setModal={setModal} />
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
       <EmployeeDetails
        isOpen={modal.type === "detail"}
        onClose={() => setModal({ type: "", data: null })}
        employeeId={modal.data}
       />
    </div>
  );
};

export default Employees;

