"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PropertyRequest } from "@/types/property-request";
import { Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { maskPhoneNumber as maskPhone } from "@/lib/utils/phone-validator";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface InquiryResultCardProps {
  requests: PropertyRequest[];
  onRequestCancel?: (requestId: string) => void;
}

export default function InquiryResultCard({ requests, onRequestCancel }: InquiryResultCardProps) {

  const handleCancelRequest = async (requestId: string, requestName: string) => {
    // 전화번호 입력 모달
    const { value: phone } = await Swal.fire({
      title: '의뢰 취소 - 본인 확인',
      text: `${requestName}님의 의뢰를 취소하려면 의뢰 시 입력했던 전화번호를 입력해주세요.`,
      input: 'text',
      inputPlaceholder: '010-1234-5678',
      inputAttributes: {
        maxlength: '13',
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      inputValidator: (value) => {
        if (!value) {
          return '전화번호를 입력해주세요!'
        }
        if (!/^[0-9-+()]*$/.test(value)) {
          return '올바른 전화번호 형식이 아닙니다!'
        }
        if (value.length < 10) {
          return '전화번호가 너무 짧습니다!'
        }
      }
    });

    if (!phone) return;

    // 취소 확인 모달
    const confirmResult = await Swal.fire({
      title: '의뢰 취소',
      text: `정말로 매물 의뢰를 취소하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '취소하기',
      cancelButtonText: '돌아가기',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      console.log('=== 프론트엔드: 취소 요청 시작 ===')
      console.log('Request ID:', requestId)
      console.log('입력된 전화번호:', phone)

      const response = await fetch(`/api/property-requests?id=${requestId}&phone=${encodeURIComponent(phone)}`, {
        method: 'DELETE',
      });

      console.log('API 응답 상태:', response.status)
      console.log('API 응답 OK:', response.ok)

      if (!response.ok) {
        const error = await response.json();
        console.log('API 에러 응답:', error)
        throw new Error(error.error || '의뢰 취소에 실패했습니다');
      }

      const result = await response.json();
      console.log('API 성공 응답:', result)

      // 성공 알림
      await Swal.fire({
        title: '취소 완료',
        text: '매물 의뢰가 성공적으로 취소되었습니다.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      // 부모 컴포넌트에 취소 알림
      if (onRequestCancel) {
        onRequestCancel(requestId);
      }

    } catch (error) {
      await Swal.fire({
        title: '취소 실패',
        text: error instanceof Error ? error.message : '의뢰 취소 중 오류가 발생했습니다',
        icon: 'error',
        confirmButtonText: '확인',
      });
    }
  };

  const getRequestTypeText = (type?: string) => {
    switch (type) {
      case "viewing":
        return "매물 보기";
      case "consultation":
        return "상담 문의";
      case "negotiation":
        return "계약 협상";
      case "other":
        return "기타 문의";
      default:
        return "일반 문의";
    }
  };

  const getRequestTypeColor = (type?: string) => {
    switch (type) {
      case "viewing":
        return "bg-blue-100 text-blue-800";
      case "consultation":
        return "bg-green-100 text-green-800";
      case "negotiation":
        return "bg-purple-100 text-purple-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };


  const formatBudget = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    
    const formatAmount = (amount: number) => {
      if (amount >= 100000000) {
        return `${(amount / 100000000).toLocaleString()}억`;
      } else if (amount >= 10000) {
        return `${(amount / 10000).toLocaleString()}만`;
      } else {
        return `${amount.toLocaleString()}`;
      }
    };

    if (min && max) {
      return `${formatAmount(min)}원 ~ ${formatAmount(max)}원`;
    } else if (min) {
      return `${formatAmount(min)}원 이상`;
    } else if (max) {
      return `${formatAmount(max)}원 이하`;
    }
    return null;
  };

  if (requests.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              조회 결과가 없습니다
            </h3>
            <p className="text-sm text-gray-500">
              입력하신 전화번호로 등록된 매물 의뢰를 찾을 수 없습니다.<br />
              전화번호를 다시 확인해 주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">매물 의뢰 조회 결과</CardTitle>
          <CardDescription>
            총 {requests.length}건의 매물 의뢰가 조회되었습니다
          </CardDescription>
        </CardHeader>
      </Card>

      {requests.map((request, index) => (
        <Card key={request.id || index} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">
                  {request.inquirer_name}님의 매물 의뢰
                </CardTitle>
                <CardDescription>
                  {request.created_at && 
                    `${dayjs(request.created_at).fromNow()} 등록`
                  }
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getRequestTypeColor(request.request_type)}>
                  {getRequestTypeText(request.request_type)}
                </Badge>
                {/* 모든 의뢰에 취소 버튼 표시 (전화번호 기반 인증) */}
                {request.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelRequest(request.id!, request.inquirer_name)}
                    className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    취소
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-1">연락처</h4>
                <p className="text-sm">{maskPhone(request.inquirer_phone)}</p>
                {request.inquirer_email && (
                  <p className="text-sm text-gray-500">{request.inquirer_email}</p>
                )}
              </div>

              {formatBudget(request.budget_min, request.budget_max) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">예산</h4>
                  <p className="text-sm">{formatBudget(request.budget_min, request.budget_max)}</p>
                </div>
              )}
            </div>

            {request.message && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">문의 내용</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                    {request.message}
                  </p>
                </div>
              </>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                매물 ID: {request.property_id}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}