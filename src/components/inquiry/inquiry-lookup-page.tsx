"use client";

import { useState } from "react";
import InquiryPhoneForm from "./inquiry-phone-form";
import InquiryResultCard from "./inquiry-result-card";
import { normalizePhoneNumber } from "@/lib/utils/phone-validator";
import { Button } from "@/components/ui/button";
import { PropertyRequest } from "@/types/property-request";

export default function InquiryLookupPage() {
  const [searchPhone, setSearchPhone] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 실제 API 호출로 의뢰 조회
  const fetchRequests = async (phone: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 실제 API 호출
      const response = await fetch(`/api/property-requests?phone=${encodeURIComponent(phone)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '의뢰 조회에 실패했습니다');
      }
      
      const result = await response.json();
      setRequests(result.data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    if (searchPhone) {
      fetchRequests(searchPhone);
    }
  };

  const handlePhoneSubmit = (phone: string) => {
    const normalized = normalizePhone(phone);
    setSearchPhone(normalized);
    setHasSearched(true);
    fetchRequests(normalized);
  };

  const handleReset = () => {
    setSearchPhone("");
    setHasSearched(false);
  };

  const handleRetry = () => {
    if (searchPhone) {
      refetch();
    }
  };

  const handleRequestCancel = (requestId: string) => {
    // 의뢰 취소 후 목록 새로고침
    refetch();
  };

  const normalizePhone = (phone: string) => {
    return normalizePhoneNumber(phone);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">매물 의뢰 조회</h1>
          <p className="text-gray-600">등록하신 전화번호로 매물 의뢰 현황을 확인해보세요</p>
        </div>

        {!hasSearched ? (
          <InquiryPhoneForm onSubmit={handlePhoneSubmit} isLoading={isLoading} />
        ) : (
          <div className="space-y-6">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-600 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">조회 중 오류가 발생했습니다</h3>
                <p className="text-red-600 mb-4">{error.message || "잠시 후 다시 시도해주세요"}</p>
                <div className="space-x-2">
                  <Button onClick={handleRetry} variant="outline">
                    다시 시도
                  </Button>
                  <Button onClick={handleReset} variant="default">
                    새로 조회
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">매물 의뢰 정보를 조회하고 있습니다...</p>
              </div>
            ) : (
              <>
                <InquiryResultCard 
                  requests={requests} 
                  onRequestCancel={handleRequestCancel}
                />
                <div className="text-center">
                  <Button onClick={handleReset} variant="outline" size="lg">
                    새로운 전화번호로 조회하기
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">이용 안내</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">📋 조회 가능한 정보</h3>
              <ul className="space-y-1">
                <li>• 매물 의뢰 등록 일시</li>
                <li>• 문의 유형 및 내용</li>
                <li>• 예산 정보</li>
                <li>• 연락처 정보 (마스킹 처리)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">🔒 개인정보 보호</h3>
              <ul className="space-y-1">
                <li>• 본인 전화번호만 조회 가능</li>
                <li>• 개인정보는 마스킹 처리</li>
                <li>• 안전한 암호화 통신</li>
                <li>• 조회 기록 미저장</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
