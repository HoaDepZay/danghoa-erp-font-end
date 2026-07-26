import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Campaign } from '../../types/recruitment';
import { getUserLevel } from '../../utils/user';
import { toast, formatDate } from '../../utils/helpers';
import {
  SectionHeader,
  Card,
  Btn,
  Badge,
  Spinner,
  EmptyState,
  FormField,
  Input,
} from '../../components/UI/index';
import Modal from '../../components/UI/Modal';
import { Briefcase, Users, Calendar, Plus, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

const RecruitmentDashboard = ({ user, onNavigate }: { user?: any; onNavigate?: (page: string) => void }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    TIEU_DE: '',
    SO_LUONG: 1,
    HAN_NOP: '',
    MA_PHG: 1,
  });

  const userLevel = getUserLevel(user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campRes, depRes] = await Promise.all([
        api.getCampaigns(),
        api.getDepartments().catch(() => ({ data: [] })),
      ]);
      if (campRes?.data?.success) {
        setCampaigns(campRes.data.data);
      }
      const depList = Array.isArray(depRes?.data)
        ? depRes.data
        : depRes?.data?.data || depRes?.data?.departments || [];
      setDepartments(depList);
      if (depList.length > 0) {
        setFormData((prev) => ({ ...prev, MA_PHG: depList[0].MA_PHG || depList[0].ma_phg || 1 }));
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách tuyển dụng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async () => {
    if (!formData.TIEU_DE.trim()) {
      return toast.error('Vui lòng nhập tiêu đề chiến dịch');
    }
    if (formData.SO_LUONG < 1) {
      return toast.error('Số lượng tuyển dụng tối thiểu là 1');
    }

    try {
      setSubmitting(true);
      const maCD = 'CD' + Date.now().toString().slice(-4);
      await api.createCampaign({
        MA_CD: maCD,
        TIEU_DE: formData.TIEU_DE,
        SO_LUONG: Number(formData.SO_LUONG),
        HAN_NOP: formData.HAN_NOP || null,
        MA_PHG: Number(formData.MA_PHG) || 1,
      });
      toast.success('Tạo chiến dịch tuyển dụng thành công!');
      setShowCreateModal(false);
      setFormData({ TIEU_DE: '', SO_LUONG: 1, HAN_NOP: '', MA_PHG: departments[0]?.MA_PHG || 1 });
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Có lỗi xảy ra khi tạo chiến dịch');
    } finally {
      setSubmitting(false);
    }
  };

  const goToDetails = (id: string) => {
    localStorage.setItem('selectedCampaignId', id);
    if (onNavigate) onNavigate('campaign_details');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader
        title="Quản lý Tuyển dụng"
        subtitle="Danh sách các chiến dịch tuyển dụng, nhu cầu nhân sự và theo dõi tiến độ ứng viên"
        actions={
          userLevel >= 3 ? (
            <Btn
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              icon={<Plus size={16} />}
            >
              Tạo chiến dịch mới
            </Btn>
          ) : null
        }
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner size={32} />
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Briefcase size={48} color="#cbd5e1" />}
            title="Chưa có chiến dịch tuyển dụng nào"
            description="Nhấn vào nút 'Tạo chiến dịch mới' ở góc trên bên phải để bắt đầu thêm nhu cầu tuyển dụng."
          />
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {campaigns.map((cd) => {
            const isOpen = cd.TRANG_THAI === 'OPEN';
            return (
              <Card
                key={cd.MA_CD}
                style={{
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  borderTop: `4px solid ${isOpen ? '#10b981' : '#94a3b8'}`,
                }}
                onClick={() => goToDetails(cd.MA_CD)}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: isOpen ? '#d1fae5' : '#f1f5f9',
                      color: isOpen ? '#059669' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Briefcase size={22} />
                  </div>
                  <Badge color={isOpen ? 'green' : 'gray'}>
                    {isOpen ? 'Đang mở' : 'Đã đóng'}
                  </Badge>
                </div>

                <h4
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--text-primary, #0f172a)',
                    marginBottom: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {cd.TIEU_DE}
                </h4>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    margin: '14px 0',
                    fontSize: 13,
                    color: 'var(--text-secondary, #64748b)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={15} color="#64748b" />
                    <span>
                      Phòng ban: <strong>{cd.TEN_PHONG_BAN || 'Chưa phân bổ'}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={15} color="#3b82f6" />
                    <span>
                      Chỉ tiêu: <strong style={{ color: '#0f172a' }}>{cd.SO_LUONG}</strong> nhân sự
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={15} color="#f59e0b" />
                    <span>
                      Hạn nộp: <strong>{cd.HAN_NOP ? formatDate(cd.HAN_NOP) : 'Không giới hạn'}</strong>
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-color, #e2e8f0)',
                    paddingTop: 14,
                    marginTop: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>
                    📥 {cd.TONG_UNG_VIEN || 0} ứng viên
                  </span>
                  <Btn
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToDetails(cd.MA_CD);
                    }}
                    icon={<ArrowRight size={14} />}
                  >
                    Kanban / Chi tiết
                  </Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo chiến dịch tuyển dụng mới"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Btn>
            <Btn
              variant="primary"
              loading={submitting}
              onClick={handleCreateSubmit}
              icon={<CheckCircle2 size={16} />}
            >
              Tạo chiến dịch
            </Btn>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="Tiêu đề chiến dịch *">
            <Input
              placeholder="VD: Tuyển dụng lập trình viên Fullstack / Frontend..."
              value={formData.TIEU_DE}
              onChange={(e) => setFormData({ ...formData, TIEU_DE: e.target.value })}
            />
          </FormField>

          <FormField label="Phòng ban phụ trách *">
            <select
              className="form-input"
              value={formData.MA_PHG}
              onChange={(e) => setFormData({ ...formData, MA_PHG: Number(e.target.value) })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Số lượng cần tuyển *">
              <Input
                type="number"
                min={1}
                placeholder="Số lượng"
                value={formData.SO_LUONG}
                onChange={(e) => setFormData({ ...formData, SO_LUONG: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Hạn nộp hồ sơ">
              <Input
                type="date"
                value={formData.HAN_NOP}
                onChange={(e) => setFormData({ ...formData, HAN_NOP: e.target.value })}
              />
            </FormField>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RecruitmentDashboard;

