import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { getManv } from "../../../utils/user";

export const useProfile = (user: any) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<string>("");
  const manv = getManv(user);

  const handleProfileUpdated = (updated: any) => {
    setProfile((prev: any) => ({
      ...(prev || {}),
      hoten: updated.hoten ?? prev?.hoten,
      ngaysinh: updated.ngaysinh ?? prev?.ngaysinh,
      gioitinh: updated.gioitinh ?? prev?.gioitinh,
      diachinhan: updated.diachi ?? prev?.diachinhan,
      sdt: updated.sdt ?? prev?.sdt,
    }));

    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return;
      const parsed = JSON.parse(rawUser);
      const merged = {
        ...parsed,
        ...(updated.hoten ? { hoten: updated.hoten } : {}),
      };
      localStorage.setItem("user", JSON.stringify(merged));
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    if (!manv) {
      setProfile(user);
      setLoading(false);
      return;
    }
    api
      .getProfile(manv)
      .then((r: any) => setProfile(r.data?.employee || r.data?.data || r.data))
      .catch(() =>
        api
          .getEmployee(manv)
          .then((r: any) => setProfile(r.data?.employee || r.data?.data || r.data))
          .catch(() => setProfile(user)),
      )
      .finally(() => setLoading(false));
  }, [manv, user]);

  return { profile, loading, modal, setModal, handleProfileUpdated, manv };
};

