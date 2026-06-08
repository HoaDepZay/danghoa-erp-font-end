const fs = require('fs');
const path = require('path');

const replacements = {
  'manv': 'MA_NV', 'maNv': 'MA_NV', 'MaNV': 'MA_NV', 'MANV': 'MA_NV',
  'hoten': 'HO_TEN', 'hoTen': 'HO_TEN', 'HoTen': 'HO_TEN', 'HOTEN': 'HO_TEN',
  'maphg': 'MA_PHG', 'maPhg': 'MA_PHG', 'MaPhg': 'MA_PHG', 'MAPHG': 'MA_PHG',
  'tenpb': 'TEN_PB', 'tenPb': 'TEN_PB', 'TenPB': 'TEN_PB', 'TENPB': 'TEN_PB',
  'chucvu': 'CHUC_VU', 'chucVu': 'CHUC_VU', 'ChucVu': 'CHUC_VU', 'CHUCVU': 'CHUC_VU',
  'luong': 'LUONG', 'Luong': 'LUONG',
  'sdt': 'SDT', 'Sdt': 'SDT',
  'tenda': 'TEN_DA', 'tenDa': 'TEN_DA', 'TenDA': 'TEN_DA', 'TENDA': 'TEN_DA',
  'thoigian': 'THOI_GIAN', 'thoiGian': 'THOI_GIAN', 'ThoiGian': 'THOI_GIAN', 'THOIGIAN': 'THOI_GIAN',
  'trangthai': 'TRANG_THAI', 'trangThai': 'TRANG_THAI', 'TrangThai': 'TRANG_THAI', 'TRANGTHAI': 'TRANG_THAI',
  'mota': 'MO_TA', 'moTa': 'MO_TA', 'MoTa': 'MO_TA', 'MOTA': 'MO_TA',
  'tennhiemvu': 'TEN_NHIEM_VU', 'tenNhiemVu': 'TEN_NHIEM_VU', 'TenNhiemVu': 'TEN_NHIEM_VU', 'TENNHIEMVU': 'TEN_NHIEM_VU',
  'vaitroduan': 'VAI_TRO_DU_AN', 'vaiTroDuAn': 'VAI_TRO_DU_AN', 'VaiTroDuAn': 'VAI_TRO_DU_AN', 'VAITRODUAN': 'VAI_TRO_DU_AN',
  'truongphg': 'TRUONG_PHG', 'truongPhg': 'TRUONG_PHG', 'TruongPhg': 'TRUONG_PHG', 'TRUONGPHG': 'TRUONG_PHG',
  'ngaysinh': 'NGAY_SINH', 'ngaySinh': 'NGAY_SINH', 'NgaySinh': 'NGAY_SINH', 'NGAYSINH': 'NGAY_SINH',
  'gioitinh': 'GIOI_TINH', 'gioiTinh': 'GIOI_TINH', 'GioiTinh': 'GIOI_TINH', 'GIOITINH': 'GIOI_TINH',
  'diachi': 'DIA_CHI', 'diaChi': 'DIA_CHI', 'DiaChi': 'DIA_CHI', 'DIACHI': 'DIA_CHI',
  'diachinhan': 'DIA_CHI_NHAN', 'diaChiNhan': 'DIA_CHI_NHAN', 'DiaChiNhan': 'DIA_CHI_NHAN', 'DIACHINHAN': 'DIA_CHI_NHAN',
  'ngaybatdau': 'NGAY_BAT_DAU', 'ngayBatDau': 'NGAY_BAT_DAU', 'NgayBatDau': 'NGAY_BAT_DAU', 'NGAYBATDAU': 'NGAY_BAT_DAU',
  'ngayketthuc': 'NGAY_KET_THUC', 'ngayKetThuc': 'NGAY_KET_THUC', 'NgayKetThuc': 'NGAY_KET_THUC', 'NGAYKETTHUC': 'NGAY_KET_THUC',
  'ngayvaolam': 'NGAY_VAO_LAM', 'ngayVaoLam': 'NGAY_VAO_LAM', 'NgayVaoLam': 'NGAY_VAO_LAM', 'NGAYVAOLAM': 'NGAY_VAO_LAM',
  'email': 'EMAIL', 'Email': 'EMAIL'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.match(/\.(tsx|ts|jsx|js)$/)) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let totalUpdates = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  Object.keys(replacements).forEach(key => {
    const regex = new RegExp('\\b' + key + '\\b', 'g');
    content = content.replace(regex, replacements[key]);
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
    totalUpdates++;
  }
});

console.log('Total files updated:', totalUpdates);
