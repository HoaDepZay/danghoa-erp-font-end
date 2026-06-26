import React, { useState, useEffect } from "react";
import { 
  Banknote, Plus, Trash2, Edit, Calendar, DollarSign, FileText, 
  Search, CheckCircle, XCircle 
} from "lucide-react";
import { api } from "../../services/api";
import { formatCurrency, toast } from "../../utils/helpers";
import { 
  SectionHeader, Card, Btn, Badge, Spinner, EmptyState, FormField, SkeletonRows 
} from "../../components/UI/index";
import Modal from "../../components/UI/Modal";
interface Expense {
  ID: number;
  TenKhoanChi: string;
  SoTien: number;
  NgayChi: string;
  MaNvPhuTrach: string;
  TrangThai: string;
  HoTenPhuTrach?: string;
  [key: string]: any;
}

export const Expenses: React.FC<{ user: any }> = ({ user }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({ TrangThai: "Chờ duyệt" });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.getExpenses();
      setExpenses(res.data?.data || res.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách chi tiêu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setFormData({ 
        ...expense, 
        NgayChi: expense.NgayChi ? new Date(expense.NgayChi).toISOString().split("T")[0] : "" 
      });
    } else {
      setFormData({ TrangThai: "Chờ duyệt", NgayChi: new Date().toISOString().split("T")[0] });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.TenKhoanChi || !formData.SoTien || !formData.NgayChi) {
      toast.error("Vui lòng nhập đủ tên, số tiền và ngày chi!");
      return;
    }
    
    setSaving(true);
    try {
      if (formData.ID) {
        await api.updateExpense(formData.ID, formData);
        toast.success("Cập nhật khoản chi thành công!");
      } else {
        await api.createExpense(formData);
        toast.success("Tạo khoản chi thành công!");
      }
      setModalOpen(false);
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu khoản chi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa khoản chi này? Thao tác không thể hoàn tác!")) return;
    try {
      await api.deleteExpense(id);
      toast.success("Xóa thành công!");
      setExpenses(prev => prev.filter(x => x.ID !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể xóa khoản chi này");
    }
  };

  const filtered = expenses.filter(e => 
    e.TenKhoanChi?.toLowerCase().includes(search.toLowerCase()) ||
    e.TrangThai?.toLowerCase().includes(search.toLowerCase()) ||
    e.HoTenPhuTrach?.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filtered.reduce((sum, e) => sum + (e.SoTien || 0), 0);

  return (
    <div className="animate-fade-in">
      <SectionHeader 
        title="Quản lý chi tiêu" 
        subtitle="Theo dõi và quản lý các khoản chi của công ty"
        actions={
          <Btn onClick={() => handleOpenModal()} icon={<Plus size={16} />}>
            Thêm khoản chi
          </Btn>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card style={{ margin: 0, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 50, height: 50, borderRadius: 12, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Banknote size={24} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#888", fontWeight: 600 }}>Tổng tiền chi</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111" }}>{formatCurrency(totalAmount)}</p>
          </div>
        </Card>
        <Card style={{ margin: 0, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 50, height: 50, borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#888", fontWeight: 600 }}>Số lượng khoản chi</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#10b981" }}>{filtered.length}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ position: "relative", width: 300 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Tìm khoản chi, người phụ trách..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        {loading ? (
          <table className="data-table"><tbody><SkeletonRows rows={5} cols={5} /></tbody></table>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Banknote size={48} />} title="Không có khoản chi nào" description="Danh sách chi tiêu đang trống hoặc không khớp tìm kiếm" />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã Khoản Chi</th>
                  <th>Nội Dung</th>
                  <th>Người Phụ Trách</th>
                  <th>Ngày Chi</th>
                  <th style={{ textAlign: "right" }}>Số Tiền</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: "right" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.ID}>
                    <td style={{ color: "#888", fontSize: 12, fontWeight: 600 }}>#{e.ID}</td>
                    <td style={{ fontWeight: 600 }}>{e.TenKhoanChi}</td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{e.HoTenPhuTrach || "—"}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{e.MaNvPhuTrach}</div>
                    </td>
                    <td>{e.NgayChi ? new Date(e.NgayChi).toLocaleDateString("vi-VN") : "—"}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#ef4444" }}>
                      - {formatCurrency(e.SoTien)}
                    </td>
                    <td>
                      <Badge color={e.TrangThai === "Đã duyệt" ? "green" : e.TrangThai === "Từ chối" ? "red" : "yellow"}>
                        {e.TrangThai || "Chờ duyệt"}
                      </Badge>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Btn onClick={() => handleOpenModal(e)} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer" }} title="Sửa">
                          <Edit size={16} />
                        </Btn>
                        <Btn onClick={() => handleDelete(e.ID)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} title="Xóa">
                          <Trash2 size={16} />
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={formData.ID ? "Chỉnh sửa khoản chi" : "Thêm khoản chi mới"}
        size="md"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, width: "100%" }}>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Btn>
            <Btn variant="primary" loading={saving} onClick={handleSave}>Lưu thông tin</Btn>
          </div>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FormField label="Nội dung khoản chi" required>
            <div className="input-group">
              <span className="input-icon"><FileText size={16} /></span>
              <input 
                type="text" 
                className="form-input" 
                placeholder="VD: Mua văn phòng phẩm..." 
                value={formData.TenKhoanChi || ""} 
                onChange={e => setFormData({ ...formData, TenKhoanChi: e.target.value })} 
                required 
              />
            </div>
          </FormField>

          <FormField label="Số tiền (VNĐ)" required>
            <div className="input-group">
              <span className="input-icon"><DollarSign size={16} /></span>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Nhập số tiền..." 
                value={formData.SoTien || ""} 
                onChange={e => setFormData({ ...formData, SoTien: Number(e.target.value) })} 
                required 
              />
            </div>
          </FormField>

          <FormField label="Ngày chi" required>
            <div className="input-group">
              <span className="input-icon"><Calendar size={16} /></span>
              <input 
                type="date" 
                className="form-input" 
                value={formData.NgayChi || ""} 
                onChange={e => setFormData({ ...formData, NgayChi: e.target.value })} 
                required 
              />
            </div>
          </FormField>

          {formData.ID && (
            <FormField label="Trạng thái">
              <select 
                className="form-input" 
                value={formData.TrangThai || "Chờ duyệt"} 
                onChange={e => setFormData({ ...formData, TrangThai: e.target.value })}
              >
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Từ chối">Từ chối</option>
              </select>
            </FormField>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
