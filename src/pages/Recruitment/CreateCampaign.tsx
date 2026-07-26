import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  SectionHeader,
  Card,
  Btn,
  Spinner,
  CustomSelect,
  DatePicker,
} from "../../components/UI";
import {
  Briefcase,
  Building2,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Award,
  FileText,
  CheckCircle2,
  HeartHandshake,
  ArrowLeft,
  Save,
} from "lucide-react";

const CreateCampaign = ({ onNavigate }: any) => {
  const editId = localStorage.getItem("editCampaignId") || "";
  const isEditMode = Boolean(editId);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [departments, setDepartments] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    MA_CD: `CD${Math.floor(1000 + Math.random() * 9000)}`,
    TIEU_DE: "",
    MA_PHG: "",
    SO_LUONG: 1,
    HAN_NOP: "",
    TRANG_THAI: "OPEN",
    LOAI_HINH: "Full-time",
    KINH_NGHIEM: "1-3 năm",
    MUC_LUONG: "Thỏa thuận",
    DIA_DIEM: "Tòa nhà HUIT, Q.Tân Phú, TP. HCM",
    MO_TA_CONG_VIEC: "",
    YEU_CAU_CONG_VIEC: "",
    QUYEN_LOI: "",
  });

  useEffect(() => {
    fetchDepartments();
    if (isEditMode && editId) {
      fetchCampaignDetails(editId);
    }
  }, [editId, isEditMode]);

  const fetchDepartments = async () => {
    try {
      const res = await api.getDepartments();
      const depList = Array.isArray(res)
        ? res
        : res?.data?.data || res?.data?.departments || res?.data || [];
      if (Array.isArray(depList)) {
        setDepartments(depList);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách phòng ban:", error);
    }
  };

  const fetchCampaignDetails = async (campaignId: string) => {
    try {
      setFetching(true);
      const res = await api.getCampaignById(campaignId);
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setFormData({
          MA_CD: data.MA_CD || "",
          TIEU_DE: data.TIEU_DE || "",
          MA_PHG: String(data.MA_PHG || ""),
          SO_LUONG: data.SO_LUONG || 1,
          HAN_NOP: data.HAN_NOP ? data.HAN_NOP.split("T")[0] : "",
          TRANG_THAI: data.TRANG_THAI || "OPEN",
          LOAI_HINH: data.LOAI_HINH || "Full-time",
          KINH_NGHIEM: data.KINH_NGHIEM || "1-3 năm",
          MUC_LUONG: data.MUC_LUONG || "Thỏa thuận",
          DIA_DIEM: data.DIA_DIEM || "Tòa nhà HUIT, Q.Tân Phú, TP. HCM",
          MO_TA_CONG_VIEC: data.MO_TA_CONG_VIEC || "",
          YEU_CAU_CONG_VIEC: data.YEU_CAU_CONG_VIEC || "",
          QUYEN_LOI: data.QUYEN_LOI || "",
        });
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết chiến dịch:", error);
      alert("Không tìm thấy thông tin chiến dịch!");
      if (onNavigate) onNavigate("recruitment");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "SO_LUONG" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.TIEU_DE || !formData.MA_PHG) {
      alert("Vui lòng nhập đầy đủ Tiêu đề và Phòng ban phụ trách!");
      return;
    }
    if (formData.HAN_NOP) {
      const selectedDay = new Date(formData.HAN_NOP);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDay < today) {
        alert("⚠️ Hạn chót nhận hồ sơ không được nhỏ hơn ngày hiện tại!");
        return;
      }
    }

    try {
      setLoading(true);
      if (isEditMode && editId) {
        await api.updateCampaign(editId, {
          ...formData,
          MA_PHG: Number(formData.MA_PHG),
        });
        alert("🎉 Cập nhật chiến dịch tuyển dụng thành công!");
      } else {
        await api.createCampaign({
          ...formData,
          MA_PHG: Number(formData.MA_PHG),
        });
        alert("🎉 Tạo chiến dịch tuyển dụng mới thành công!");
      }
      localStorage.removeItem("editCampaignId");
      if (onNavigate) onNavigate("recruitment");
    } catch (error: any) {
      console.error("Lỗi lưu chiến dịch:", error);
      alert(error?.response?.data?.message || "Có lỗi xảy ra khi lưu chiến dịch!");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16 }}>
        <Spinner size={32} />
        <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Đang tải thông tin chiến dịch tuyển dụng...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000, margin: "0 auto", paddingBottom: 48 }}>
      <SectionHeader
        title={isEditMode ? "Chỉnh sửa Chiến dịch Tuyển dụng" : "Tạo Chiến dịch Tuyển dụng mới"}
        subtitle="Thiết lập vị trí tuyển dụng, mô tả công việc (JD) đầy đủ để hiển thị chuyên nghiệp trên trang Tuyển dụng công ty"
        actions={
          <Btn variant="outline" onClick={() => { localStorage.removeItem("editCampaignId"); if (onNavigate) onNavigate("recruitment"); }}>
            <ArrowLeft size={16} style={{ marginRight: 6 }} /> Quay lại
          </Btn>
        }
      />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* PHẦN 1: THÔNG TIN CHUNG */}
        <Card style={{ position: "relative", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, marginBottom: 20, borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ padding: 8, background: "#eff6ff", color: "#3b82f6", borderRadius: 8, display: "flex" }}>
              <Briefcase size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>1. Thông tin vị trí tuyển dụng</h3>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0" }}>Các thông tin cơ bản về chức danh, chỉ tiêu và hạn nộp</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>
                Mã chiến dịch <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                name="MA_CD"
                disabled={isEditMode}
                value={formData.MA_CD}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "10px 14px", background: isEditMode ? "#f3f4f6" : "var(--input-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: 10, fontSize: 14, fontFamily: "monospace", color: "var(--text-primary)", outline: "none" }}
                placeholder="VD: CD1001"
              />
            </div>

            <div style={{ gridColumn: "span 2 / span 2", minWidth: 280 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>
                Tiêu đề vị trí tuyển dụng <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                name="TIEU_DE"
                value={formData.TIEU_DE}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "10px 14px", background: "var(--input-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: 10, fontSize: 14, color: "var(--text-primary)", outline: "none" }}
                placeholder="VD: Senior ReactJS / Node.js Developer, Chuyên viên Quản trị Nhân sự..."
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>
                <Building2 size={16} color="#9ca3af" /> Phòng ban phụ trách <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <CustomSelect
                value={formData.MA_PHG}
                onChange={(e: any) => setFormData((prev) => ({ ...prev, MA_PHG: e.target.value }))}
                placeholder="-- Chọn phòng ban phụ trách --"
                options={departments.map((dept: any) => ({
                  label: dept.TEN_PB || dept.TEN_PHG || `Phòng ban ${dept.MA_PHG}`,
                  value: dept.MA_PHG,
                }))}
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>
                <Users size={16} color="#9ca3af" /> Chỉ tiêu số lượng
              </label>
              <input
                type="number"
                name="SO_LUONG"
                min={1}
                value={formData.SO_LUONG}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "10px 14px", background: "var(--input-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: 10, fontSize: 14, color: "var(--text-primary)", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>
                <Calendar size={16} color="#9ca3af" /> Hạn chót nhận hồ sơ
              </label>
              <DatePicker
                value={formData.HAN_NOP}
                onChange={(date: Date | null) => {
                  if (date) {
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, "0");
                    const dd = String(date.getDate()).padStart(2, "0");
                    setFormData((prev) => ({ ...prev, HAN_NOP: `${yyyy}-${mm}-${dd}` }));
                  } else {
                    setFormData((prev) => ({ ...prev, HAN_NOP: "" }));
                  }
                }}
                minDate={new Date()}
                placeholder="-- Chọn ngày hạn nộp --"
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>
                <Clock size={16} color="#9ca3af" /> Loại hình làm việc
              </label>
              <CustomSelect
                value={formData.LOAI_HINH}
                onChange={(e: any) => setFormData((prev) => ({ ...prev, LOAI_HINH: e.target.value }))}
                options={[
                  { label: "Full-time (Toàn thời gian)", value: "Full-time" },
                  { label: "Part-time (Bán thời gian)", value: "Part-time" },
                  { label: "Remote (Làm từ xa)", value: "Remote" },
                  { label: "Internship (Thực tập sinh)", value: "Internship" },
                  { label: "Freelance (Theo dự án)", value: "Freelance" },
                ]}
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>
                <Award size={16} color="#9ca3af" /> Yêu cầu kinh nghiệm
              </label>
              <CustomSelect
                value={formData.KINH_NGHIEM}
                onChange={(e: any) => setFormData((prev) => ({ ...prev, KINH_NGHIEM: e.target.value }))}
                options={[
                  { label: "Không yêu cầu kinh nghiệm", value: "Không yêu cầu" },
                  { label: "Dưới 1 năm kinh nghiệm", value: "Dưới 1 năm" },
                  { label: "1 - 3 năm kinh nghiệm", value: "1-3 năm" },
                  { label: "3 - 5 năm kinh nghiệm", value: "3-5 năm" },
                  { label: "Trên 5 năm kinh nghiệm", value: "Trên 5 năm" },
                ]}
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>
                <DollarSign size={16} color="#9ca3af" /> Mức lương thu nhập
              </label>
              <input
                type="text"
                name="MUC_LUONG"
                value={formData.MUC_LUONG}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", background: "var(--input-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: 10, fontSize: 14, color: "var(--text-primary)", outline: "none" }}
                placeholder="VD: 15 - 25 triệu / Thỏa thuận / 1,000 USD..."
              />
            </div>

            <div style={{ gridColumn: "span 2 / span 2", minWidth: 280 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>
                <MapPin size={16} color="#9ca3af" /> Địa điểm làm việc
              </label>
              <input
                type="text"
                name="DIA_DIEM"
                value={formData.DIA_DIEM}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", background: "var(--input-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: 10, fontSize: 14, color: "var(--text-primary)", outline: "none" }}
                placeholder="VD: Trụ sở chính: Tòa nhà HUIT, Q.Tân Phú, TP. Hồ Chí Minh"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>
                Trạng thái hiển thị
              </label>
              <CustomSelect
                value={formData.TRANG_THAI}
                onChange={(e: any) => setFormData((prev) => ({ ...prev, TRANG_THAI: e.target.value }))}
                options={[
                  { label: "🟢 OPEN (Đang mở nhận CV)", value: "OPEN" },
                  { label: "🔴 CLOSED (Đã tạm đóng)", value: "CLOSED" },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* PHẦN 2: MÔ TẢ CÔNG VIỆC (JD) */}
        <Card style={{ position: "relative", zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, marginBottom: 20, borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ padding: 8, background: "#e0e7ff", color: "#4f46e5", borderRadius: 8, display: "flex" }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>2. Thông tin chi tiết mô tả công việc (JD)</h3>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0" }}>Nội dung này sẽ hiển thị trực tiếp bên trang Tuyển dụng của công ty (Company Web)</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
                <CheckCircle2 size={16} color="#4f46e5" /> Mô tả công việc (Job Description)
              </label>
              <textarea
                name="MO_TA_CONG_VIEC"
                rows={5}
                value={formData.MO_TA_CONG_VIEC}
                onChange={handleChange}
                style={{ width: "100%", padding: "12px 14px", background: "var(--input-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: 10, fontSize: 14, color: "var(--text-primary)", outline: "none", lineHeight: 1.6 }}
                placeholder="- Tham gia phát triển, xây dựng các tính năng Frontend/Backend cho hệ thống DANGHOA-ERP...&#10;- Phối hợp chặt chẽ với đội ngũ UI/UX Designer, BA và QC để tối ưu trải nghiệm người dùng...&#10;- Viết clean code, dễ bảo trì, thực hiện code review và tuân thủ chuẩn kiến trúc của công ty..."
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
                <CheckCircle2 size={16} color="#10b981" /> Yêu cầu ứng viên (Job Requirements)
              </label>
              <textarea
                name="YEU_CAU_CONG_VIEC"
                rows={5}
                value={formData.YEU_CAU_CONG_VIEC}
                onChange={handleChange}
                style={{ width: "100%", padding: "12px 14px", background: "var(--input-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: 10, fontSize: 14, color: "var(--text-primary)", outline: "none", lineHeight: 1.6 }}
                placeholder="- Tốt nghiệp Đại học/Cao đẳng chuyên ngành Công nghệ thông tin, Quản trị kinh doanh hoặc liên quan...&#10;- Có kinh nghiệm vững với ReactJS / TypeScript / Node.js / SQL Server...&#10;- Tư duy lô-gic tốt, chủ động trong công việc, có trách nhiệm và khả năng giải quyết vấn đề..."
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
                <HeartHandshake size={16} color="#ef4444" /> Quyền lợi & Phúc lợi (Benefits)
              </label>
              <textarea
                name="QUYEN_LOI"
                rows={4}
                value={formData.QUYEN_LOI}
                onChange={handleChange}
                style={{ width: "100%", padding: "12px 14px", background: "var(--input-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: 10, fontSize: 14, color: "var(--text-primary)", outline: "none", lineHeight: 1.6 }}
                placeholder="- Mức lương cạnh tranh theo năng lực + Thưởng KPIs + Thưởng lương tháng 13...&#10;- Được đóng đầy đủ BHYT, BHXH, BHTN theo quy định nhà nước...&#10;- Môi trường làm việc trẻ trung, hiện đại, trang bị MacBook/PC cấu hình cao, du lịch nghỉ mát hàng năm..."
              />
            </div>
          </div>
        </Card>

        {/* NÚT ACTION */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, paddingTop: 16, borderTop: "1px solid var(--border-color)" }}>
          <Btn variant="outline" type="button" onClick={() => { localStorage.removeItem("editCampaignId"); if (onNavigate) onNavigate("recruitment"); }}>
            Hủy bỏ
          </Btn>
          <Btn variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <Spinner size={16} style={{ marginRight: 8 }} />
            ) : (
              <Save size={16} style={{ marginRight: 8 }} />
            )}
            {isEditMode ? "Lưu thay đổi" : "Hoàn tất đăng tuyển"}
          </Btn>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
