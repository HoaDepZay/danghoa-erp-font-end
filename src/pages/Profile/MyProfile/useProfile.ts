import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { getManv } from "../../../utils/user";

export const useProfile = (user: any) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const MA_NV = getManv(user);

  const handleProfileUpdated = (updated: any) => {
    setProfile((prev: any) => ({
      ...(prev || {}),
      HO_TEN: updated.HO_TEN ?? prev?.HO_TEN,
      NGAY_SINH: updated.NGAY_SINH ?? prev?.NGAY_SINH,
      GIOI_TINH: updated.GIOI_TINH ?? prev?.GIOI_TINH,
      DIA_CHI: updated.DIA_CHI ?? prev?.DIA_CHI,
      SDT: updated.SDT ?? prev?.SDT,
    }));

    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return;
      const parsed = JSON.parse(rawUser);
      const merged = {
        ...parsed,
        ...(updated.HO_TEN ? { HO_TEN: updated.HO_TEN } : {}),
      };
      localStorage.setItem("user", JSON.stringify(merged));
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    if (!MA_NV) {
      setProfile(user);
      setLoading(false);
      return;
    }
    api
      .getProfile(MA_NV)
      .then((r: any) => setProfile(r.data?.employee || r.data?.data || r.data))
      .catch(() =>
        api
          .getEmployee(MA_NV)
          .then((r: any) => setProfile(r.data?.employee || r.data?.data || r.data))
          .catch(() => setProfile(user)),
      )
      .finally(() => setLoading(false));
  }, [MA_NV, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !MA_NV) return;
    setUploadingAvatar(true);
    try {
      const res = await api.uploadAvatar(MA_NV, file);
      if (res.data?.avatarUrl || res.data?.data?.avatarUrl) {
        const url = res.data.avatarUrl || res.data.data.avatarUrl;
        setProfile((prev: any) => ({ ...prev, HINH_DAI_DIEN: url }));
        alert("Cập nhật ảnh đại diện thành công!");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi cập nhật ảnh đại diện");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return { profile, loading, modal, setModal, handleProfileUpdated, MA_NV, handleAvatarUpload, uploadingAvatar };
};

