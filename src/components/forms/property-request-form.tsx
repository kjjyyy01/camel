"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Phone, User, FileText } from "lucide-react";
import { createPropertyRequest } from "@/lib/api/property-requests";
import Swal from "sweetalert2";

// Zod 스키마 정의 (API 타입과 일치)
const propertyRequestSchema = z.object({
  // 개인정보
  name: z.string().min(2, "이름은 2자 이상 입력해주세요"),
  phone: z
    .string()
    .min(10, "전화번호를 정확히 입력해주세요")
    .regex(/^[0-9-+()]*$/, "올바른 전화번호 형식이 아닙니다"),
  email: z.string().email("올바른 이메일 형식이 아닙니다").optional(),

  // 매물 정보
  property_id: z.string().min(1, "매물을 선택해주세요"),
  request_type: z.enum(["viewing", "consultation", "negotiation", "other"]).optional(),
  message: z.string().optional(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
});

type PropertyRequestFormData = z.infer<typeof propertyRequestSchema>;

interface PropertyRequestFormProps {
  onSubmit?: (data: PropertyRequestFormData) => Promise<void>;
  isLoading?: boolean;
}

export function PropertyRequestForm({ onSubmit, isLoading = false }: PropertyRequestFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    getValues,
    reset,
    control,
    clearErrors,
    watch,
  } = useForm<PropertyRequestFormData>({
    resolver: zodResolver(propertyRequestSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      property_id: "",
      request_type: "consultation",
      message: "",
      budget_min: undefined,
      budget_max: undefined,
    },
    mode: "onChange",
  });

  // 각 필드의 값을 watch로 가져오기
  const nameValue = watch("name");
  const phoneValue = watch("phone");
  const emailValue = watch("email");
  const propertyIdValue = watch("property_id");

  const nextStep = async () => {
    const fieldsToValidate = step === 1 ? ["name", "phone"] : step === 2 ? ["property_id"] : [];

    const isValid = await trigger(fieldsToValidate as (keyof PropertyRequestFormData)[]);
    if (isValid) {
      // 다음 단계로 넘어가기 전에 해당 필드 초기화
      if (step === 1) {
        // property_id 필드가 실수로 설정되지 않았는지 확인하고 초기화
        setValue("property_id", "");
        clearErrors("property_id");
      }

      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 기본 폼 제출 방지

    // step 3이 아니면 제출하지 않음
    if (step !== 3) {
      return;
    }

    // step 3에서만 실제 데이터 가져와서 처리
    const data = getValues();

    try {
      setIsSubmitting(true);

      if (onSubmit) {
        await onSubmit(data);
      } else {
        // onSubmit이 없으면 직접 Supabase API 호출
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

        // 직접 Supabase에 저장
        const result = await createPropertyRequest(apiData);

        // 성공 메시지 표시
        await Swal.fire({
          icon: "success",
          title: "매물 의뢰 접수 완료!",
          text: "24시간 내에 담당자가 연락드리겠습니다.",
          confirmButtonText: "확인",
          confirmButtonColor: "#10b981"
        });

        // 폼 완전 초기화
        reset();
        setStep(1);

        // 페이지 새로고침 또는 성공 상태로 전환
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "오류 발생",
        text: error instanceof Error ? error.message : "매물 의뢰 중 오류가 발생했습니다",
        confirmButtonText: "확인",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">개인 정보</h3>
              <p className="text-gray-600 text-sm">매물 상담을 위한 기본 정보를 입력해주세요</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">이름 *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="홍길동"
                    className="pl-10"
                    autoComplete="off"
                    value={nameValue || ""}
                    onChange={(e) => setValue("name", e.target.value)}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="phone">전화번호 *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="010-1234-5678"
                    className="pl-10"
                    autoComplete="off"
                    value={phoneValue || ""}
                    onChange={(e) => setValue("phone", e.target.value)}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <Label htmlFor="email">이메일 (선택)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <Button type="button" onClick={nextStep} className="w-full">
              다음 단계
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">매물 선택</h3>
              <p className="text-gray-600 text-sm">문의하실 매물 정보를 입력해주세요</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="property_id">매물 ID *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  {/* TODO(human): 실제 매물 선택 UI 구현 - 드롭다운, 검색, 또는 매물 ID 직접 입력 방식 중 선택 */}
                  <Input
                    id="property_id"
                    name="property_id"
                    placeholder="매물 ID를 입력하세요 (예: PROP001)"
                    className="pl-10"
                    autoComplete="off"
                    value={propertyIdValue || ""}
                    onChange={(e) => setValue("property_id", e.target.value)}
                  />
                </div>
                {errors.property_id && <p className="text-red-500 text-sm mt-1">{errors.property_id.message}</p>}
              </div>

              <div>
                <Label>문의 유형</Label>
                <Controller
                  name="request_type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="문의 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewing">현장 방문</SelectItem>
                        <SelectItem value="consultation">상담 요청</SelectItem>
                        <SelectItem value="negotiation">가격 협상</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.request_type && <p className="text-red-500 text-sm mt-1">{errors.request_type.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetMin">예산 (최소)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-gray-400">₩</span>
                    <Input
                      id="budgetMin"
                      placeholder="1000"
                      className="pl-8"
                      {...register("budget_min", { valueAsNumber: true })}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">단위: 만원</p>
                </div>
                <div>
                  <Label htmlFor="budgetMax">예산 (최대)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-gray-400">₩</span>
                    <Input
                      id="budgetMax"
                      placeholder="5000"
                      className="pl-8"
                      {...register("budget_max", { valueAsNumber: true })}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">단위: 만원</p>
                </div>
              </div>

              <div>
                <Label htmlFor="message">상세 요구사항</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="message"
                    placeholder="원하시는 매물의 구체적인 조건, 편의시설, 접근성 등을 자세히 작성해주세요"
                    className="pl-10 min-h-24"
                    {...register("message")}
                  />
                </div>
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                이전 단계
              </Button>
              <Button type="button" onClick={nextStep} className="flex-1">
                다음 단계
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">최종 확인</h3>
              <p className="text-gray-600 text-sm">매물 문의를 제출하기 전 마지막으로 확인해주세요</p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">입력하신 정보</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <strong>이름:</strong> {getValues("name") || "입력되지 않음"}
                  </div>
                  <div>
                    <strong>연락처:</strong> {getValues("phone") || "입력되지 않음"}
                  </div>
                  <div>
                    <strong>매물 ID:</strong> {getValues("property_id") || "입력되지 않음"}
                  </div>
                  <div>
                    <strong>문의 유형:</strong> {getValues("request_type") || "상담 요청"}
                  </div>
                  {getValues("email") && (
                    <div>
                      <strong>이메일:</strong> {getValues("email")}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">서비스 안내</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 접수 완료 후 24시간 내에 담당자가 연락드립니다</li>
                  <li>• 매물에 대한 자세한 상담을 제공해드립니다</li>
                  <li>• 상담 및 매물 안내 서비스는 무료입니다</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="flex-1"
                disabled={isLoading || isSubmitting}
              >
                이전 단계
              </Button>
              <Button type="button" onClick={handleFormSubmit} className="flex-1" disabled={isLoading || isSubmitting}>
                {isLoading || isSubmitting ? "제출 중..." : "문의하기"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-6 w-6" />
          매물 의뢰하기
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>단계 {step} / 3</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-primary" : "bg-gray-300"}`} />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form autoComplete="off" onSubmit={handleFormSubmit}>
          {renderStep()}
        </form>
      </CardContent>
    </Card>
  );
}
