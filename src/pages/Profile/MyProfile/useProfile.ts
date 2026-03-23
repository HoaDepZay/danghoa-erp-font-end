import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { getManv } from "../../../utils/user";

export const useProfile = (user: any) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<string>("");
  const manv = getManv(user);

  const handleProfileUpdated = (updated: any) => {
    setProfile((prev: any) => {
      const next = { ...(prev || {}) };
      if (updated.hoten) {
        next.HOTEN = updated.hoten;
        next.hoten = updated.hoten;
      }
      if (updated.ngaysinh) {
        next.NGAYSINH = updated.ngaysinh;
        next.ngaysinh = updated.ngaysinh;
      }
      if (updated.gioitinh) {
        next.GIOITINH = updated.gioitinh;
        next.gioitinh = updated.gioitinh;
      }
      if (updated.diachi) {
        next.DIACHI = updated.diachi;
        next.diachi = updated.diachi;
      }
      if (updated.sdt) {
        next.SODIENTHOA = updated.sdt;
        next.SODIENTHOAI = updated.sdt;
        next.sdt = updated.sdt;
      }
      return next;
    });

    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return;
      const parsed = JSON.parse(rawUser);
      const merged = {
        ...parsed,
        ...(updated.hoten ? { hoten: updated.hoten, HOTEN: updated.hoten } : {}),
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

