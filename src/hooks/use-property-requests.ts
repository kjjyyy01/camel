import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPropertyRequestsByPhone,
  getUserPropertyRequests,
  getPropertyRequest,
  createPropertyRequest,
  getAllPropertyRequests,
} from "@/lib/api/property-requests";
import { PropertyRequest, CreatePropertyRequestData } from "@/types/property-request";

// Query Keys
export const propertyRequestsKeys = {
  all: ["property-requests"] as const,
  byPhone: (phone: string) => ["property-requests", "phone", phone] as const,
  byUser: (userId: string) => ["property-requests", "user", userId] as const,
  byId: (id: string) => ["property-requests", "id", id] as const,
  admin: () => ["property-requests", "admin"] as const,
};

/**
 * 전화번호로 매물 의뢰 조회하는 훅
 */
export function usePropertyRequestsByPhone(phone: string, enabled: boolean = true) {
  return useQuery({
    queryKey: propertyRequestsKeys.byPhone(phone),
    queryFn: () => getPropertyRequestsByPhone(phone),
    enabled: enabled && !!phone,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 사용자별 매물 의뢰 목록 조회하는 훅
 */
export function useUserPropertyRequests(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: propertyRequestsKeys.byUser(userId),
    queryFn: () => getUserPropertyRequests(userId),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 2, // 2분
  });
}

/**
 * 특정 매물 의뢰 조회하는 훅
 */
export function usePropertyRequest(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: propertyRequestsKeys.byId(id),
    queryFn: () => getPropertyRequest(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10, // 10분
  });
}

/**
 * 관리자용 전체 매물 의뢰 목록 조회하는 훅
 */
export function useAllPropertyRequests(enabled: boolean = true) {
  return useQuery({
    queryKey: propertyRequestsKeys.admin(),
    queryFn: getAllPropertyRequests,
    enabled,
    staleTime: 1000 * 60 * 1, // 1분
  });
}

/**
 * 매물 의뢰 생성 Mutation 훅
 */
export function useCreatePropertyRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyRequestData) => createPropertyRequest(data),
    onSuccess: (newRequest: PropertyRequest) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: propertyRequestsKeys.all,
      });

      // 새로운 데이터가 있다면 해당 전화번호 쿼리도 무효화
      if (newRequest.inquirer_phone) {
        queryClient.invalidateQueries({
          queryKey: propertyRequestsKeys.byPhone(newRequest.inquirer_phone),
        });
      }

      // 사용자별 쿼리도 무효화
      if (newRequest.user_id) {
        queryClient.invalidateQueries({
          queryKey: propertyRequestsKeys.byUser(newRequest.user_id),
        });
      }
    },
    onError: (error) => {
      console.error("매물 의뢰 생성 실패:", error);
    },
  });
}
