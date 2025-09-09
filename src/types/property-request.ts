export interface PropertyRequest {
  id?: string;
  property_id: string;
  user_id?: string | null;
  inquirer_name: string;
  inquirer_phone: string;
  inquirer_email?: string | null;
  request_type?: "viewing" | "consultation" | "negotiation" | "other";
  message?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  created_at?: string;
}

export interface CreatePropertyRequestData {
  property_id: string;
  inquirer_name: string;
  inquirer_phone: string;
  inquirer_email?: string | null;
  request_type?: "viewing" | "consultation" | "negotiation" | "other";
  message?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
}
