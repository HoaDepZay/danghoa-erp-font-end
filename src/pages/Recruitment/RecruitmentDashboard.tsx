import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Campaign } from '../../types/recruitment';
import { getUserLevel } from '../../utils/user';
import Swal from 'sweetalert2';

const RecruitmentDashboard = ({ user, onNavigate }: { user?: any; onNavigate?: (page: string) => void }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const userLevel = getUserLevel(user);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await api.getCampaigns();
      if (res.data.success) {
        setCampaigns(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Tạo Chiến Dịch Mới',
      html:
        '<input id="swal-title" class="swal2-input" placeholder="Tiêu đề">' +
        '<input id="swal-qty" type="number" class="swal2-input" placeholder="Số lượng">' +
        '<input id="swal-date" type="date" class="swal2-input" placeholder="Hạn nộp">',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          TIEU_DE: (document.getElementById('swal-title') as HTMLInputElement).value,
          SO_LUONG: (document.getElementById('swal-qty') as HTMLInputElement).value,
          HAN_NOP: (document.getElementById('swal-date') as HTMLInputElement).value
        }
      }
    });

    if (formValues && formValues.TIEU_DE) {
      try {
        const maCD = "CD" + Date.now().toString().slice(-4);
        await api.createCampaign({
          MA_CD: maCD,
          ...formValues,
          MA_PHG: 1 // TODO: get from select
        });
        Swal.fire("Thành công!", "Đã tạo chiến dịch", "success");
        fetchCampaigns();
      } catch (e) {
        Swal.fire("Lỗi!", "Có lỗi xảy ra", "error");
      }
    }
  };

  const goToDetails = (id: string) => {
    localStorage.setItem("selectedCampaignId", id);
    if (onNavigate) onNavigate("campaign_details");
  }

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý Tuyển Dụng</h1>
        {userLevel >= 3 && (
          <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            + Tạo Chiến Dịch
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(cd => (
          <div key={cd.MA_CD} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition cursor-pointer" onClick={() => goToDetails(cd.MA_CD)}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">{cd.TIEU_DE}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${cd.TRANG_THAI === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {cd.TRANG_THAI}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
              <p>📍 {cd.TEN_PHONG_BAN || 'Chưa phân bổ'}</p>
              <p>👥 Cần tuyển: {cd.SO_LUONG}</p>
              <p>⏳ Hạn nộp: {cd.HAN_NOP ? new Date(cd.HAN_NOP).toLocaleDateString('vi-VN') : 'Không giới hạn'}</p>
              <p className="font-medium text-blue-600 dark:text-blue-400">📥 Số ứng viên: {cd.TONG_UNG_VIEN || 0}</p>
            </div>

            <button className="block w-full text-center px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
              Chi tiết / Kanban
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruitmentDashboard;
