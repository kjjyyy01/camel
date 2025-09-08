export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          type: 'office' | 'retail' | 'building' | 'warehouse' | 'factory'
          transaction_type: 'sale' | 'rent' | 'jeonse'
          title: string
          description: string | null
          price: number
          deposit: number | null
          monthly_rent: number | null
          maintenance_fee: number | null
          area_total: number
          area_land: number | null
          area_building: number | null
          area_floor: string | null
          address: string
          coordinates_lat: number
          coordinates_lng: number
          district: string | null
          dong: string | null
          location_detail: string | null
          year_built: number | null
          total_floors: number
          elevator: boolean
          parking: boolean
          amenities: string[]
          images: string[]
          agent_name: string | null
          agent_phone: string | null
          agent_company: string | null
          created_at: string
          updated_at: string
          is_active: boolean
          view_count: number
          favorite_count: number
        }
        Insert: {
          id: string
          type: 'office' | 'retail' | 'building' | 'warehouse' | 'factory'
          transaction_type: 'sale' | 'rent' | 'jeonse'
          title: string
          description?: string | null
          price?: number
          deposit?: number | null
          monthly_rent?: number | null
          maintenance_fee?: number | null
          area_total: number
          area_land?: number | null
          area_building?: number | null
          area_floor?: string | null
          address: string
          coordinates_lat?: number
          coordinates_lng?: number
          district?: string | null
          dong?: string | null
          location_detail?: string | null
          year_built?: number | null
          total_floors?: number
          elevator?: boolean
          parking?: boolean
          amenities?: string[]
          images?: string[]
          agent_name?: string | null
          agent_phone?: string | null
          agent_company?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          view_count?: number
          favorite_count?: number
        }
        Update: {
          id?: string
          type?: 'office' | 'retail' | 'building' | 'warehouse' | 'factory'
          transaction_type?: 'sale' | 'rent' | 'jeonse'
          title?: string
          description?: string | null
          price?: number
          deposit?: number | null
          monthly_rent?: number | null
          maintenance_fee?: number | null
          area_total?: number
          area_land?: number | null
          area_building?: number | null
          area_floor?: string | null
          address?: string
          coordinates_lat?: number
          coordinates_lng?: number
          district?: string | null
          dong?: string | null
          location_detail?: string | null
          year_built?: number | null
          total_floors?: number
          elevator?: boolean
          parking?: boolean
          amenities?: string[]
          images?: string[]
          agent_name?: string | null
          agent_phone?: string | null
          agent_company?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          view_count?: number
          favorite_count?: number
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          user_type: 'individual' | 'agent' | 'company'
          birth_date: string | null
          gender: 'male' | 'female' | null
          business_number: string | null
          business_name: string | null
          license_number: string | null
          office_address: string | null
          profile_image: string | null
          bio: string | null
          email_notifications: boolean
          sms_notifications: boolean
          marketing_consent: boolean
          created_at: string
          updated_at: string
          last_login_at: string | null
          is_active: boolean
          is_verified: boolean
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          user_type?: 'individual' | 'agent' | 'company'
          birth_date?: string | null
          gender?: 'male' | 'female' | null
          business_number?: string | null
          business_name?: string | null
          license_number?: string | null
          office_address?: string | null
          profile_image?: string | null
          bio?: string | null
          email_notifications?: boolean
          sms_notifications?: boolean
          marketing_consent?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_active?: boolean
          is_verified?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          user_type?: 'individual' | 'agent' | 'company'
          birth_date?: string | null
          gender?: 'male' | 'female' | null
          business_number?: string | null
          business_name?: string | null
          license_number?: string | null
          office_address?: string | null
          profile_image?: string | null
          bio?: string | null
          email_notifications?: boolean
          sms_notifications?: boolean
          marketing_consent?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_active?: boolean
          is_verified?: boolean
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          created_at?: string
        }
      }
      property_requests: {
        Row: {
          id: string
          property_id: string
          user_id: string | null
          inquirer_name: string
          inquirer_phone: string
          inquirer_email: string | null
          request_type: 'viewing' | 'consultation' | 'negotiation' | 'other'
          preferred_date: string | null
          preferred_time: string | null
          message: string | null
          budget_min: number | null
          budget_max: number | null
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          agent_response: string | null
          agent_responded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id?: string | null
          inquirer_name: string
          inquirer_phone: string
          inquirer_email?: string | null
          request_type?: 'viewing' | 'consultation' | 'negotiation' | 'other'
          preferred_date?: string | null
          preferred_time?: string | null
          message?: string | null
          budget_min?: number | null
          budget_max?: number | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          agent_response?: string | null
          agent_responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string | null
          inquirer_name?: string
          inquirer_phone?: string
          inquirer_email?: string | null
          request_type?: 'viewing' | 'consultation' | 'negotiation' | 'other'
          preferred_date?: string | null
          preferred_time?: string | null
          message?: string | null
          budget_min?: number | null
          budget_max?: number | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          agent_response?: string | null
          agent_responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}