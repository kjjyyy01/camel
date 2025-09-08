export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'user' | 'agent' | 'admin';

export interface UserProfile {
  id: string;
  user_id: string;
  company_name?: string;
  license_number?: string;
  bio?: string;
  website?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface PropertyRequest {
  id: string;
  user_id?: string;
  request_type: RequestType;
  name: string;
  email: string;
  phone: string;
  region: string;
  budget_min?: number;
  budget_max?: number;
  area_min?: number;
  area_max?: number;
  property_type?: string[];
  requirements?: string;
  status: RequestStatus;
  notes?: string;
  assigned_agent_id?: string;
  created_at: string;
  updated_at: string;
}

export type RequestType = 'buy' | 'sell' | 'lease_in' | 'lease_out';

export type RequestStatus = 'pending' | 'in_progress' | 'contacted' | 'completed' | 'cancelled';

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  license_number: string;
  rating: number;
  review_count: number;
  specialties: string[];
  avatar_url?: string;
  bio?: string;
  created_at: string;
}