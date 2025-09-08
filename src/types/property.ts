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
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export type PropertyType = 'office' | 'retail' | 'building' | 'warehouse' | 'factory';

export type TransactionType = 'sale' | 'lease' | 'both';

export type PropertyStatus = 'available' | 'pending' | 'sold' | 'rented';

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