import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { ArrowLeft, Save, UploadCloud, File as FileIcon } from "lucide-react";
import {
  Card,
  Btn,
  FormField,
  CustomSelect,
  SectionHeader,
  DatePicker,
} from "../../components/UI/index";

const CONTRACT_TYPES = [
  { label: "Thử việc", value: "Thử việc" },
  { label: "1 năm", value: "1 năm" },
  { label: "3 năm", value: "3 năm" },
  { label: "Vô thời hạn", value: "Vô thời hạn" },
];

const STATUS_TYPES = [
  { label: "Chưa bắt đầu", value: "CHUA BAT DAU" },
  { label: "Đang thực hiện", value: "DANG THUC HIEN" },
  { label: "Hết hạn", value: "HET HAN" },
  { label: "Hủy", value: "HUY" },
];

const CreateContract = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [employees, setEmployees] = useState<{ label: string; value: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState("");

  const [form, setForm] = useState({
    MA_NV: "",
    LOAI_HOP_DONG: "1 năm",
    TU_NGAY: "",
    DEN_NGAY: "",
    LUONG_CO_BAN: "",
    NGAY_KY: "",
    GHI_CHU: "",
    URL_CHI_TIET: "",
    TRANG_THAI: "CHUA BAT DAU",
  });

  useEffect(() => {
    const editDataStr = localStorage.getItem("edit_contract_data");
    if (editDataStr) {
      try {
        const editData = JSON.parse(editDataStr);
        setForm({
          MA_NV: editData.MA_NV || "",
          LOAI_HOP_DONG: editData.LOAI_HOP_DONG || "1 năm",
          TU_NGAY: editData.TU_NGAY ? editData.TU_NGAY.substring(0, 10) : "",
          DEN_NGAY: editData.DEN_NGAY ? editData.DEN_NGAY.substring(0, 10) : "",
          LUONG_CO_BAN: editData.LUONG_CO_BAN || "",
          NGAY_KY: editData.NGAY_KY ? editData.NGAY_KY.substring(0, 10) : "",
          GHI_CHU: editData.GHI_CHU || "",
          URL_CHI_TIET: editData.URL_CHI_TIET || "",
          TRANG_THAI: editData.TRANG_THAI || "CHUA BAT DAU",
        });
        setIsEditMode(true);
        setEditId(editData.MA_HD || editData.MAHD);
        localStorage.removeItem("edit_contract_data");
      } catch (e) {
        console.error("Lỗi parse dữ liệu hợp đồng", e);
      }
    } else {
      const draftMaNv = localStorage.getItem("draft_contract_ma_nv");
      if (draftMaNv) {
        setForm((f) => ({ ...f, MA_NV: draftMaNv }));
        localStorage.removeItem("draft_contract_ma_nv");
      }
    }

    api
      .getEmployees({ pageSize: 200 })
      .then((res: any) => {
        const data = res.data?.data || res.data?.employees || res.data;
        const emps = Array.isArray(data) ? data : data?.data || [];
        setEmployees(
          emps.map((emp: any) => ({
            label: `${emp.HO_TEN} (${emp.MA_NV})`,
            value: emp.MA_NV,
          }))
        );
      })
      .catch((e) => console.error(e));
  }, []);

  const setField = (k: string) => (e: any) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.MA_NV || !form.TU_NGAY || !form.LUONG_CO_BAN) {
      return toast.error("Vui lòng điền đầy đủ: Nhân viên, Ngày bắt đầu, Lương cơ bản");
    }
    if (form.DEN_NGAY && new Date(form.TU_NGAY) > new Date(form.DEN_NGAY)) {
      return toast.error("Ngày hết hạn không được nhỏ hơn ngày bắt đầu");
    }
    setSaving(true);
    try {
      let fileUrl = form.URL_CHI_TIET;
      if (selectedFile) {
        try {
          const uploadRes = await api.uploadFile(selectedFile);
          const extractedUrl = uploadRes?.data?.url || uploadRes?.data?.URL || (uploadRes as any)?.url || (uploadRes as any)?.URL || (uploadRes as any)?.fileUrl;
          if (extractedUrl) {
            fileUrl = extractedUrl;
          }
        } catch (e: any) {
          console.error("Lỗi upload file", e);
        }
      }

      const payload = {
        MA_NV: form.MA_NV,
        LOAI_HOP_DONG: form.LOAI_HOP_DONG,
        TU_NGAY: form.TU_NGAY,
        DEN_NGAY: form.DEN_NGAY || undefined,
        LUONG_CO_BAN: Number(form.LUONG_CO_BAN),
        NGAY_KY: form.NGAY_KY || undefined,
        GHI_CHU: form.GHI_CHU || undefined,
        URL_CHI_TIET: fileUrl || undefined,
        TRANG_THAI: form.TRANG_THAI || undefined,
      };

      if (isEditMode && editId) {
        await api.updateContract(editId, payload);
        toast.success("Đã cập nhật hợp đồng thành công");
      } else {
        await api.createContract(payload);
        toast.success("Đã tạo hợp đồng thành công");
      }

      onNavigate("contracts");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || (isEditMode ? "Lỗi cập nhật hợp đồng" : "Lỗi tạo hợp đồng"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-contract-page">
      <SectionHeader
        title={isEditMode ? "Cập nhật hợp đồng" : "Tạo hợp đồng mới"}
        subtitle="Vui lòng điền đầy đủ thông tin bên dưới"
        actions={
          <Btn
            variant="secondary"
            onClick={() => onNavigate("contracts")}
            icon={<ArrowLeft size={16} />}
          >
            Quay lại
          </Btn>
        }
      />

      <Card style={{ maxWidth: 800, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            padding: 10,
          }}
        >
          <FormField label="Nhân viên *">
            <CustomSelect
              options={employees}
              value={form.MA_NV}
              onChange={setField("MA_NV")}
              placeholder="-- Chọn nhân viên --"
            />
          </FormField>

          <FormField label="Loại hợp đồng *">
            <CustomSelect
              options={CONTRACT_TYPES}
              value={form.LOAI_HOP_DONG}
              onChange={setField("LOAI_HOP_DONG")}
            />
          </FormField>

          <FormField label="Trạng thái">
            <CustomSelect
              options={STATUS_TYPES}
              value={form.TRANG_THAI}
              onChange={setField("TRANG_THAI")}
            />
          </FormField>

          <FormField label="Ngày bắt đầu *">
            <DatePicker
              value={form.TU_NGAY}
              onChange={(date) => {
                if (date) {
                  // Format to YYYY-MM-DD
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, '0');
                  const dd = String(date.getDate()).padStart(2, '0');
                  setForm(f => ({ ...f, TU_NGAY: `${yyyy}-${mm}-${dd}` }));
                } else {
                  setForm(f => ({ ...f, TU_NGAY: "" }));
                }
              }}
              placeholder="Chọn ngày bắt đầu"
            />
          </FormField>

          <FormField label="Ngày hết hạn">
            <DatePicker
              value={form.DEN_NGAY}
              minDate={form.TU_NGAY ? new Date(form.TU_NGAY) : undefined}
              onChange={(date) => {
                if (date) {
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, '0');
                  const dd = String(date.getDate()).padStart(2, '0');
                  setForm(f => ({ ...f, DEN_NGAY: `${yyyy}-${mm}-${dd}` }));
                } else {
                  setForm(f => ({ ...f, DEN_NGAY: "" }));
                }
              }}
              placeholder="Bỏ trống nếu vô thời hạn"
            />
          </FormField>

          <FormField label="Lương cơ bản *">
            <input
              className="form-input"
              type="number"
              value={form.LUONG_CO_BAN}
              onChange={setField("LUONG_CO_BAN")}
              placeholder="VD: 10000000"
            />
          </FormField>

          <FormField label="Ngày ký">
            <DatePicker
              value={form.NGAY_KY}
              onChange={(date) => {
                if (date) {
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, '0');
                  const dd = String(date.getDate()).padStart(2, '0');
                  setForm(f => ({ ...f, NGAY_KY: `${yyyy}-${mm}-${dd}` }));
                } else {
                  setForm(f => ({ ...f, NGAY_KY: "" }));
                }
              }}
              placeholder="Chọn ngày ký"
            />
          </FormField>

          <div style={{ gridColumn: "1 / -1" }}>
            <FormField label="File hợp đồng (PDF)">
              <div
                style={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: 12,
                  padding: "24px",
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.backgroundColor = "#eff6ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
                {!selectedFile ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UploadCloud size={24} color="#64748b" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: "#334155", margin: 0 }}>Nhấn để tải lên hoặc kéo thả file vào đây</p>
                      <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0 0" }}>Chỉ hỗ trợ file định dạng PDF</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <FileIcon size={40} color="#10b981" />
                    <div>
                      <p style={{ fontWeight: 600, color: "#10b981", margin: 0 }}>{selectedFile.name}</p>
                      <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0 0" }}>Nhấn để chọn file khác</p>
                    </div>
                  </div>
                )}
              </div>
            </FormField>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <FormField label="Ghi chú">
              <textarea
                className="form-input"
                rows={4}
                value={form.GHI_CHU}
                onChange={setField("GHI_CHU")}
                placeholder="Ghi chú thêm..."
              />
            </FormField>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 30,
            paddingTop: 20,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <Btn variant="primary" loading={saving} onClick={handleSave} icon={<Save size={16} />}>
            {isEditMode ? "Lưu cập nhật" : "Tạo hợp đồng"}
          </Btn>
        </div>
      </Card>
    </div>
  );
};

export default CreateContract;
