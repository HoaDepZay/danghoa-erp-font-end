const DATE_YYYY_MM_DD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const toNullableString = (value) => {
  if (value == null) return null;
  const normalized = String(value).trim();
  return normalized === "" ? null : normalized;
};

const toNullableDate = (value) => {
  const normalized = toNullableString(value);
  if (normalized == null) return null;
  return DATE_YYYY_MM_DD_REGEX.test(normalized) ? normalized : null;
};

export const CREATE_PROJECT_INITIAL_FORM = Object.freeze({
  TEN_DA: "",
  MO_TA: "",
  NGAY_BAT_DAU: "",
  NGAY_KET_THUC: "",
  TRANG_THAI: "Đang thực hiện",
  CONG_KHAI: true,
});

export const buildCreateProjectModel = (form = {}) => ({
  TEN_DA: String(form.TEN_DA ?? "").trim(),
  MO_TA: toNullableString(form.MO_TA),
  NGAY_BAT_DAU: toNullableDate(form.NGAY_BAT_DAU),
  NGAY_KET_THUC: toNullableDate(form.NGAY_KET_THUC),
  TRANG_THAI: toNullableString(form.TRANG_THAI),
  CONG_KHAI: form.CONG_KHAI !== undefined ? Boolean(form.CONG_KHAI) : true,
});
