// import { Property } from './property';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface KoreaRealEstateApiParams {
  LAWD_CD?: string;
  DEAL_YMD?: string;
  serviceKey: string;
  numOfRows?: number;
  pageNo?: number;
}

export interface KoreaRealEstateProperty {
  거래금액: string;
  건축년도: string;
  년: string;
  법정동: string;
  아파트: string;
  월: string;
  일: string;
  전용면적: string;
  지번: string;
  층: string;
  지역코드: string;
}

export interface KakaoMapSearchResult {
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  id: string;
  place_url: string;
  distance: string;
  x: string;
  y: string;
}

export interface KakaoGeocodingResult {
  address_name: string;
  category_group_code: string;
  category_group_name: string;
  category_name: string;
  distance: string;
  id: string;
  phone: string;
  place_name: string;
  place_url: string;
  road_address_name: string;
  x: string;
  y: string;
}