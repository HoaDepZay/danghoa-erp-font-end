import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Applicant } from '../../types/recruitment';
import { toast } from '../../utils/helpers';
import {
  SectionHeader,
  Card,
  Btn,
  Badge,
  Spinner,
  FormField,
  Input,
} from '../../components/UI/index';
import Modal from '../../components/UI/Modal';
import { ArrowLeft, User, Mail, Phone, Paperclip, CheckCircle, UserCheck } from 'lucide-react';

const STATUS_COLUMNS = [
  { id: 'NEW', label: 'Mới ứng tuyển', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'INTERVIEW', label: 'Phỏng vấn', color: '#f59e0b', bg: '#fef3c7' },
  { id: 'OFFER', label: 'Gửi Offer', color: '#8b5cf6', bg: '#f3e8ff' },
  { id: 'PASSED', label: 'Đồng ý / Đạt', color: '#10b981', bg: '#d1fae5' },
  { id: 'FAILED', label: 'Từ chối', color: '#ef4444', bg: '#fee2e2' },
  { id: 'HIRED', label: 'Đã nhận việc', color: '#059669', bg: '#ecfdf5' },
];

const CampaignDetails = ({ onNavigate }: any) => {
  const id = localStorage.getItem('selectedCampaignId') || '';
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal hire state
  const [selectedUv, setSelectedUv] = useState<Applicant | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [hiring, setHiring] = useState(false);
  const [hireForm, setHireForm] = useState({
    MA_NV: '',
    MA_PHG: 1,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [appRes, depRes] = await Promise.all([
        api.getApplicants(id),
        api.getDepartments().catch(() => ({ data: [] })),
      ]);
      if (appRes?.data?.success) {
        setApplicants(appRes.data.data);
      }
      const depList = Array.isArray(depRes?.data)
        ? depRes.data
        : depRes?.data?.data || depRes?.data?.departments || [];
      setDepartments(depList);
      if (depList.length > 0) {
        setHireForm((prev) => ({ ...prev, MA_PHG: depList[0].MA_PHG || depList[0].ma_phg || 1 }));
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (uvId: string, newStatus: string) => {
    try {
      await api.updateApplicantStatus(uvId, newStatus);
      toast.success('Đã cập nhật trạng thái ứng viên');
      fetchData();
    } catch (e) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const openHireModal = (uv: Applicant) => {
    setSelectedUv(uv);
    const randomCode = 'NV' + Math.floor(1000 + Math.random() * 9000);
    setHireForm({
      MA_NV: randomCode,
      MA_PHG: departments[0]?.MA_PHG || departments[0]?.ma_phg || 1,
    });
    setShowHireModal(true);
  };

  const handleHireSubmit = async () => {
    if (!selectedUv) return;
    if (!hireForm.MA_NV.trim()) {
      return toast.error('Vui lòng nhập mã nhân viên mới');
    }
    try {
      setHiring(true);
      await api.hireApplicant(selectedUv.MA_UV, hireForm.MA_NV.trim(), Number(hireForm.MA_PHG));
      toast.success(`Đã chính thức nhận việc và tạo tài khoản ${hireForm.MA_NV}`);
      setShowHireModal(false);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Có lỗi xảy ra khi tạo hồ sơ nhân viên');
    } finally {
      setHiring(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader
        title={`Kanban Tuyển dụng: ${id}`}
        subtitle="Quản lý quy trình phỏng vấn, theo dõi trạng thái hồ sơ và tiếp nhận nhân sự chính thức"
        actions={
          <Btn
            variant="secondary"
            onClick={() => onNavigate && onNavigate('recruitment')}
            icon={<ArrowLeft size={16} />}
          >
            Quay lại danh sách
          </Btn>
        }
      />

      {/* Kanban Board */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 20,
          minHeight: 'calc(100vh - 220px)',
        }}
      >
        {STATUS_COLUMNS.map((col) => {
          const colApplicants = applicants.filter((a) => a.TRANG_THAI === col.id);
          return (
            <div
              key={col.id}
              style={{
                minWidth: 300,
                flex: 1,
                background: 'var(--bg-secondary, #f8fafc)',
                borderRadius: 14,
                padding: 14,
                border: '1px solid var(--border-color, #f1f5f9)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 10,
                  borderBottom: `2px solid ${col.color}`,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>
                  {col.label}
                </span>
                <span
                  style={{
                    background: col.bg,
                    color: col.color,
                    fontWeight: 700,
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  {colApplicants.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                {colApplicants.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '30px 10px',
                      color: '#94a3b8',
                      fontSize: 13,
                      border: '1px dashed #cbd5e1',
                      borderRadius: 10,
                    }}
                  >
                    Chưa có ứng viên
                  </div>
                ) : (
                  colApplicants.map((uv) => (
                    <Card
                      key={uv.MA_UV}
                      style={{
                        borderLeft: `4px solid ${col.color}`,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: `${col.color}15`,
                            color: col.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          {uv.HO_TEN?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {uv.HO_TEN}
                        </h4>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          fontSize: 12,
                          color: '#64748b',
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mail size={13} color="#94a3b8" />
                          <span>{uv.EMAIL || 'Chưa có email'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Phone size={13} color="#94a3b8" />
                          <span>{uv.SO_DIEN_THOAI || 'Chưa có SĐT'}</span>
                        </div>
                        {uv.URL_CV && (
                          <a
                            href={uv.URL_CV}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              color: '#3b82f6',
                              textDecoration: 'none',
                              fontWeight: 600,
                              marginTop: 2,
                            }}
                          >
                            <Paperclip size={13} /> Xem file CV hồ sơ
                          </a>
                        )}
                      </div>

                      {/* Status Dropdown */}
                      {col.id !== 'HIRED' && (
                        <div style={{ marginTop: 10 }}>
                          <select
                            className="form-input"
                            value={uv.TRANG_THAI}
                            onChange={(e) => handleStatusChange(uv.MA_UV, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              fontSize: 12,
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              background: '#f8fafc',
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            {STATUS_COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                Chuyển: {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Action Hire */}
                      {col.id === 'PASSED' && (
                        <Btn
                          variant="success"
                          size="sm"
                          style={{ width: '100%', marginTop: 10 }}
                          onClick={() => openHireModal(uv)}
                          icon={<UserCheck size={14} />}
                        >
                          🚀 Nhận việc (Tạo NV)
                        </Btn>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hire Modal */}
      <Modal
        isOpen={showHireModal}
        onClose={() => setShowHireModal(false)}
        title="Chuyển ứng viên thành Nhân viên chính thức"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setShowHireModal(false)}>
              Hủy
            </Btn>
            <Btn
              variant="success"
              loading={hiring}
              onClick={handleHireSubmit}
              icon={<UserCheck size={16} />}
            >
              Tạo hồ sơ nhân viên
            </Btn>
          </>
        }
      >
        {selectedUv && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: '#f1f5f9',
                padding: 12,
                borderRadius: 8,
                fontSize: 13,
                color: '#334155',
              }}
            >
              <p style={{ margin: '0 0 6px', fontWeight: 600 }}>Ứng viên trúng tuyển:</p>
              <p style={{ margin: 0 }}>
                👤 <strong>{selectedUv.HO_TEN}</strong> ({selectedUv.EMAIL})
              </p>
            </div>

            <FormField label="Mã nhân viên mới *">
              <Input
                placeholder="VD: NV0123"
                value={hireForm.MA_NV}
                onChange={(e) => setHireForm({ ...hireForm, MA_NV: e.target.value })}
              />
            </FormField>

            <FormField label="Phòng ban trực thuộc *">
              <select
                className="form-input"
                value={hireForm.MA_PHG}
                onChange={(e) => setHireForm({ ...hireForm, MA_PHG: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color, #cbd5e1)',
                  outline: 'none',
                  background: 'var(--card-bg, #fff)',
                  color: 'var(--text-primary, #0f172a)',
                }}
              >
                {departments.length > 0 ? (
                  departments.map((dep: any) => (
                    <option key={dep.MA_PHG || dep.ma_phg} value={dep.MA_PHG || dep.ma_phg}>
                      {dep.TEN_PHG || dep.ten_phg}
                    </option>
                  ))
                ) : (
                  <option value={1}>Phòng Kỹ thuật / Công nghệ</option>
                )}
              </select>
            </FormField>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CampaignDetails;

