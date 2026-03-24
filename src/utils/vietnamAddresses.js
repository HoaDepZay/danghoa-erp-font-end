// Vietnam addresses service using open API
const API_BASE = "https://provinces.open-api.vn/api";

export const fetchProvinces = async () => {
  try {
    const res = await fetch(`${API_BASE}/p/`);
    return await res.json();
  } catch (err) {
    console.error("Lỗi fetch tỉnh thành:", err);
    return [];
  }
};

export const fetchDistricts = async (provinceCode) => {
  if (!provinceCode) return [];
  try {
    const res = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
    const data = await res.json();
    return data.districts || [];
  } catch (err) {
    console.error("Lỗi fetch quận huyện:", err);
    return [];
  }
};

export const fetchWards = async (districtCode) => {
  if (!districtCode) return [];
  try {
    const res = await fetch(`${API_BASE}/d/${districtCode}?depth=2`);
    const data = await res.json();
    return data.wards || [];
  } catch (err) {
    console.error("Lỗi fetch phường xã:", err);
    return [];
  }
};

export const formatFullAddress = (province, district, ward) => {
  const parts = [ward, district, province].filter(Boolean);
  return parts.join(", ");
};

export const VIETNAM_ADDRESSES = {};
