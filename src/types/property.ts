export interface Property {
  id: string;
  type: PropertyType;
  transaction_type: TransactionType;
  title: string;
  address: string;
  detailed_address?: string;
  latitude: number;
  longitude: number;
  price: number;
  deposit?: number;
  monthly_rent?: number;
  area: number;
  floor: number;
  total_floors: number;
  description?: string;
  images: string[];
  amenities: string[];
  status: PropertyStatus;
  special_features?: SpecialFeature[];
  view_count: number;
  like_count: number;
  contact_info?: ContactInfo;
  agent_info?: AgentInfo;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  office_hours?: {
    weekday: string;
    saturday?: string;
    sunday?: string;
  };
}

export interface AgentInfo {
  name: string;
  company?: string;
  profile_image?: string;
  phone?: string;
  email?: string;
  license_number?: string;
}

export type PropertyType = 'office' | 'retail' | 'building' | 'warehouse' | 'factory';

export type TransactionType = 'sale' | 'lease' | 'both' | 'jeonse' | 'rent';

export type PropertyStatus = 'available' | 'pending' | 'sold' | 'rented';

export type SpecialFeature = '급매' | '큰길가' | '역세권';

export interface PropertySearchParams {
  region?: string;
  property_type?: PropertyType;
  transaction_type?: TransactionType;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  min_floor?: number;
  max_floor?: number;
  sort_by?: 'created_at' | 'price' | 'area' | 'view_count' | 'like_count';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PropertyMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  price: number;
  property_type: PropertyType;
  transaction_type: TransactionType;
}

export interface PropertyListResponse {
  data: Property[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// 필터 관련 타입 정의
export interface MapFilterOptions {
  priceRange?: PriceRange[] | PriceRange | 'all';
  areaRange?: AreaRange[] | AreaRange | 'all';
  transactionType?: TransactionType[] | TransactionType | 'all';
  propertyType?: PropertyType[] | PropertyType | 'all';
  floorRange?: FloorRange[] | FloorRange | 'all';
  amenities?: string[];
  specialFeature?: SpecialFeature[] | SpecialFeature | 'all';
}

export type PriceRange = 
  | '1억이하'
  | '1억-5억'
  | '5억-10억'
  | '10억-20억'
  | '20억이상'
  | 'all';

export type AreaRange = 
  | '10평이하'
  | '10평-30평'
  | '30평-50평'
  | '50평-100평'
  | '100평이상'
  | 'all';


export type FloorRange = 
  | '저층(1-3층)'
  | '중층(4-10층)'
  | '고층(11층이상)'
  | '지하층'
  | 'all';

export interface FilterSelectOption {
  value: string;
  label: string;
}