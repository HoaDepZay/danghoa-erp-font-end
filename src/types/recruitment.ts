export interface Campaign {
  MA_CD: string;
  TIEU_DE: string;
  MA_PHG: number;
  TEN_PHONG_BAN?: string;
  SO_LUONG: number;
  HAN_NOP: string;
  TRANG_THAI: 'OPEN' | 'CLOSED';
  NGAY_TAO: string;
  TONG_UNG_VIEN?: number;
}

export interface Applicant {
  MA_UV: string;
  MA_CD: string;
  HO_TEN: string;
  EMAIL: string;
  SO_DIEN_THOAI: string;
  URL_CV: string | null;
  TRANG_THAI: 'NEW' | 'INTERVIEW' | 'OFFER' | 'PASSED' | 'FAILED' | 'HIRED';
  GHI_CHU: string | null;
  NGAY_UNG_TUYEN: string;
}
