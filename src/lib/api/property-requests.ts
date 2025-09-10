import { createClient } from "@/lib/supabase/client";
import { PropertyRequest, CreatePropertyRequestData } from "@/types/property-request";

const supabase = createClient();

/**
 * 매물 의뢰 생성 (API Route 호출)
 */
export const createPropertyRequest = async (data: CreatePropertyRequestData): Promise<PropertyRequest> => {
  try {

    const response = await fetch('/api/property-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '매물 의뢰 등록 중 오류가 발생했습니다');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
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
      throw new Error(`매물 의뢰 목록을 가져오지 못했습니다: ${error.message}`);
    }

    return data || [];
  } catch (error) {
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
      throw new Error(`매물 의뢰를 가져오지 못했습니다: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * 매물 의뢰 상태 업데이트 (현재 테이블에 status 필드가 없으므로 주석 처리)
 */
// export const updatePropertyRequestStatus = async (
//   id: string,
//   status: string
// ): Promise<PropertyRequest> => {
//   try {
//     const { data, error } = await supabase
//       .from("property_requests")
//       .update({
//         // status 필드가 테이블에 없으므로 향후 필요시 테이블 스키마 수정 필요
//       })
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) {
//       console.error("매물 의뢰 상태 업데이트 실패:", error);
//       throw new Error(`매물 의뢰 상태 업데이트에 실패했습니다: ${error.message}`);
//     }

//     return data;
//   } catch (error) {
//     console.error("매물 의뢰 상태 업데이트 중 오류:", error);
//     throw error;
//   }
// };

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
      throw new Error(`전체 매물 의뢰 목록을 가져오지 못했습니다: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw error;
  }
};
