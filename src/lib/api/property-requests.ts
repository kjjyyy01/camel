import { createClient } from "@/lib/supabase/client";
import { PropertyRequest, CreatePropertyRequestData } from "@/types/property-request";

const supabase = createClient();

/**
 * 매물 의뢰 생성 (Supabase Function 호출)
 */
export const createPropertyRequest = async (data: CreatePropertyRequestData): Promise<PropertyRequest> => {
  try {
    console.log("매물 의뢰 데이터:", data);

    // 현재 로그인된 사용자 정보 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.warn("사용자 정보를 가져오지 못했습니다:", userError);
    }

    // Supabase 함수 호출
    const { data: requestId, error } = await supabase.rpc('create_property_request', {
      p_property_id: data.property_id,
      p_inquirer_name: data.inquirer_name,
      p_inquirer_phone: data.inquirer_phone,
      p_user_id: user?.id || null,
      p_inquirer_email: data.inquirer_email || null,
      p_request_type: data.request_type || 'viewing',
      p_message: data.message || null,
      p_budget_min: data.budget_min || null,
      p_budget_max: data.budget_max || null,
    });

    if (error) {
      console.error("매물 의뢰 생성 실패:", error);
      throw new Error(`매물 의뢰 생성에 실패했습니다: ${error.message}`);
    }

    console.log("매물 의뢰 생성 성공, ID:", requestId);

    // 생성된 데이터 조회해서 반환
    const { data: propertyRequest, error: selectError } = await supabase
      .from("property_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (selectError) {
      console.error("생성된 매물 의뢰 조회 실패:", selectError);
      throw new Error(`생성된 매물 의뢰를 조회하지 못했습니다: ${selectError.message}`);
    }

    return propertyRequest;
  } catch (error) {
    console.error("매물 의뢰 생성 중 오류:", error);
    throw error;
  }
};

/**
 * 사용자의 매물 의뢰 목록 조회
 */
export const getUserPropertyRequests = async (userId: string): Promise<PropertyRequest[]> => {
  try {
    const { data, error } = await supabase
      .from("property_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("매물 의뢰 목록 조회 실패:", error);
      throw new Error(`매물 의뢰 목록을 가져오지 못했습니다: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("매물 의뢰 목록 조회 중 오류:", error);
    throw error;
  }
};

/**
 * 특정 매물 의뢰 조회
 */
export const getPropertyRequest = async (id: string): Promise<PropertyRequest | null> => {
  try {
    const { data, error } = await supabase.from("property_requests").select("*").eq("id", id).single();

    if (error) {
      console.error("매물 의뢰 조회 실패:", error);
      throw new Error(`매물 의뢰를 가져오지 못했습니다: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("매물 의뢰 조회 중 오류:", error);
    throw error;
  }
};

/**
 * 매물 의뢰 상태 업데이트
 */
export const updatePropertyRequestStatus = async (
  id: string,
  status: PropertyRequest["status"]
): Promise<PropertyRequest> => {
  try {
    const { data, error } = await supabase
      .from("property_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("매물 의뢰 상태 업데이트 실패:", error);
      throw new Error(`매물 의뢰 상태 업데이트에 실패했습니다: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("매물 의뢰 상태 업데이트 중 오류:", error);
    throw error;
  }
};

/**
 * 관리자용: 모든 매물 의뢰 목록 조회
 */
export const getAllPropertyRequests = async (): Promise<PropertyRequest[]> => {
  try {
    const { data, error } = await supabase
      .from("property_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("전체 매물 의뢰 목록 조회 실패:", error);
      throw new Error(`전체 매물 의뢰 목록을 가져오지 못했습니다: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("전체 매물 의뢰 목록 조회 중 오류:", error);
    throw error;
  }
};
