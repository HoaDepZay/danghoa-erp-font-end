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
  tenda: "",
  mota: "",
  ngaybatdau: "",
  ngayketthuc: "",
  trangthai: "Đang thực hiện",
});

export const buildCreateProjectModel = (form = {}) => ({
  tenda: String(form.tenda ?? "").trim(),
  mota: toNullableString(form.mota),
  ngaybatdau: toNullableDate(form.ngaybatdau),
  ngayketthuc: toNullableDate(form.ngayketthuc),
  trangthai: toNullableString(form.trangthai),
});
