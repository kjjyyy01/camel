"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PropertyRequestForm } from "@/components/forms/property-request-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Phone, Mail, MessageCircle, ArrowLeft, Building, Users, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useCreatePropertyRequest } from "@/hooks/use-property-requests";

// PropertyRequestForm에서 전달되는 데이터 타입
type FormData = {
  name: string;
  phone: string;
  property_id: string;
  email?: string;
  request_type?: "viewing" | "consultation" | "negotiation" | "other";
  message?: string;
  budget_min?: number;
  budget_max?: number;
};

export default function RequestPage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const supabase = createClient();

  // Tanstack Query mutation 훅 사용
  const { mutate: createRequest, isPending: isLoading, error: mutationError, reset } = useCreatePropertyRequest();

  // 사용자 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("인증 확인 실패:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSubmit = async (data: FormData) => {
    return new Promise<void>((resolve, reject) => {
      reset(); // 이전 오류 초기화

      // PropertyRequestForm에서 받은 데이터를 API 형식으로 변환
      const apiData = {
        property_id: data.property_id,
        inquirer_name: data.name,
        inquirer_phone: data.phone,
        inquirer_email: data.email || null,
        request_type: data.request_type || "consultation",
        message: data.message || null,
        budget_min: data.budget_min || null,
        budget_max: data.budget_max || null,
      };

      createRequest(apiData, {
        onSuccess: () => {
          setSubmittedData(data);
          setIsSubmitted(true);
          resolve();
        },
        onError: () => {
          reject();
        },
      });
    });
  };

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 임시: 테스트를 위해 로그인 체크 비활성화
  if (false && !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <Building className="h-16 w-16 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">로그인이 필요합니다</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">매물 의뢰를 위한 로그인</h3>
                <p className="text-sm text-blue-700">
                  매물 의뢰 서비스를 이용하시려면 먼저 로그인해주세요.
                  <br />
                  로그인하시면 의뢰 내역 관리와 상담 진행 상황을 확인하실 수 있습니다.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-800">의뢰 내역 관리</h4>
                  <p className="text-sm text-green-600">과거 의뢰 기록 확인</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-800">실시간 상담</h4>
                  <p className="text-sm text-purple-600">담당자와 직접 소통</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Star className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-orange-800">맞춤 추천</h4>
                  <p className="text-sm text-orange-600">개인별 맞춤 서비스</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => router.push("/auth/login")} className="flex-1">
                  로그인하기
                </Button>
                <Button onClick={() => router.push("/auth/signup")} variant="outline" className="flex-1">
                  회원가입하기
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500 pt-4 border-t">
                <p>이미 계정이 있으신가요? 로그인 후 매물 의뢰를 진행하세요.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSubmitted && submittedData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold text-green-600">매물 의뢰가 완료되었습니다!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">의뢰 정보</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div>
                    <strong>이름:</strong> {submittedData.name}
                  </div>
                  <div>
                    <strong>연락처:</strong> {submittedData.phone}
                  </div>
                  <div>
                    <strong>매물 ID:</strong> {submittedData.property_id}
                  </div>
                  <div>
                    <strong>문의 유형:</strong> {submittedData.request_type || "상담"}
                  </div>
                  {submittedData.email && (
                    <div>
                      <strong>이메일:</strong> {submittedData.email}
                    </div>
                  )}
                  {submittedData.message && (
                    <div>
                      <strong>메시지:</strong> {submittedData.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-800">빠른 응답</h4>
                  <p className="text-sm text-blue-600">24시간 내 연락드립니다</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-800">전문 상담</h4>
                  <p className="text-sm text-purple-600">부동산 전문가가 상담</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Star className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-orange-800">맞춤 추천</h4>
                  <p className="text-sm text-orange-600">조건에 맞는 매물 추천</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">다음 단계</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    의뢰서 접수 완료
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    전문 상담사 배정 중
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    24시간 내 연락 예정
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => router.push("/")} className="flex-1">
                  홈으로 돌아가기
                </Button>
                <Button onClick={() => router.push("/properties")} variant="outline" className="flex-1">
                  매물 둘러보기
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500 pt-4 border-t">
                <p>문의사항이 있으시면 언제든 연락주세요</p>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>02-1234-5678</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>contact@camel.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        </div>

        {/* 페이지 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium mb-4">
            <Building className="h-5 w-5" />
            매물 의뢰 서비스
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">원하는 매물을 찾아드립니다</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            전문 부동산 컨설턴트가 고객님의 요구사항에 맞는
            <br />
            최적의 상업용 매물을 찾아서 추천해드립니다.
          </p>
          <div className="inline-block bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
            <p className="text-sm text-green-700 font-medium">📞 회원가입 없이도 매물 의뢰가 가능합니다</p>
          </div>
        </div>

        {/* 서비스 특징 */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-1">빠른 응답</h3>
            <p className="text-sm text-gray-600">24시간 내 연락</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">전문 상담</h3>
            <p className="text-sm text-gray-600">경험 많은 전문가</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-1">맞춤 추천</h3>
            <p className="text-sm text-gray-600">조건에 딱 맞는 매물</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-1">지속 상담</h3>
            <p className="text-sm text-gray-600">계약 완료까지</p>
          </div>
        </div>

        {mutationError && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-6">
            <AlertDescription>
              {mutationError.message || "매물 의뢰 제출에 실패했습니다. 잠시 후 다시 시도해주세요."}
            </AlertDescription>
          </Alert>
        )}

        {/* 매물 의뢰 폼 */}
        <PropertyRequestForm onSubmit={handleSubmit} isLoading={isLoading} />

        {/* 추가 정보 */}
        <div className="max-w-2xl mx-auto mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">이용 안내</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-800 mb-2">💡 비회원도 이용 가능</h4>
                <p className="text-blue-700">
                  회원가입 없이도 이름과 연락처만으로 매물 의뢰를 할 수 있습니다.
                  <br />
                  전문 컨설턴트가 동일한 품질의 서비스를 제공해드립니다.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">서비스 절차</h4>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>매물 의뢰서 작성 및 제출</li>
                  <li>전담 컨설턴트 배정 (24시간 내)</li>
                  <li>조건에 맞는 매물 검색 및 선별</li>
                  <li>매물 추천 및 현장 안내</li>
                  <li>계약 체결 지원</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">서비스 비용</h4>
                <p>
                  매물 의뢰 및 상담은 <strong>무료</strong>로 제공됩니다.
                </p>
                <p>계약 성사 시에만 중개수수료가 발생합니다.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">개인정보 보호</h4>
                <p>고객님의 개인정보는 매물 상담 목적으로만 사용되며, 관련 법령에 따라 안전하게 관리됩니다.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
