import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { getManv } from "../../../utils/user";

export const useProfile = (user: any) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<string>("");
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

  return { profile, loading, modal, setModal, handleProfileUpdated, MA_NV };
};

