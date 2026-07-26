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
} from '../../components/UI/index';
import { Briefcase, Users, Calendar, Plus, MapPin, ArrowRight } from 'lucide-react';

const RecruitmentDashboard = ({ user, onNavigate }: { user?: any; onNavigate?: (page: string) => void }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách tuyển dụng');
    } finally {
      setLoading(false);
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
              onClick={() => {
                localStorage.removeItem('editCampaignId');
                if (onNavigate) onNavigate('campaign_create');
              }}
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
                  <div style={{ display: 'flex', gap: 8 }}>
                    {userLevel >= 3 && (
                      <Btn
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          localStorage.setItem('editCampaignId', cd.MA_CD);
                          if (onNavigate) onNavigate('campaign_edit');
                        }}
                      >
                        ✏️ Sửa
                      </Btn>
                    )}
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
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruitmentDashboard;

