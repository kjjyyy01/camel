"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "전화번호를 입력해주세요")
    .regex(/^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$/, "올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

interface InquiryPhoneFormProps {
  onSubmit: (phone: string) => void;
  isLoading?: boolean;
}

export default function InquiryPhoneForm({ onSubmit, isLoading = false }: InquiryPhoneFormProps) {
  const [formattedPhone, setFormattedPhone] = useState("");

  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    mode: "onChange",
  });

  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/[^\d]/g, "");

    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 7) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    } else {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setFormattedPhone(formatted);
    setValue("phone", formatted, { shouldValidate: true });
  };

  const onFormSubmit = (data: PhoneFormData) => {
    const normalizedPhone = data.phone.replace(/[^\d]/g, "");
    onSubmit(normalizedPhone);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">매물 의뢰 조회</CardTitle>
        <CardDescription>매물 의뢰 시 등록하신 전화번호를 입력해주세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="010-1234-5678"
              value={formattedPhone}
              onChange={handlePhoneChange}
              disabled={isLoading}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
            {isLoading ? "조회 중..." : "조회하기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
