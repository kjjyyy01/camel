"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Calendar,
  Phone,
  Mail,
  User,
  FileText
} from 'lucide-react'

// Zod 스키마 정의
const propertyRequestSchema = z.object({
  // 개인정보
  name: z.string().min(2, '이름은 2자 이상 입력해주세요'),
  phone: z.string()
    .min(10, '전화번호를 정확히 입력해주세요')
    .regex(/^[0-9-+()]*$/, '올바른 전화번호 형식이 아닙니다'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  
  // 매물 정보
  propertyType: z.string().min(1, '매물 유형을 선택해주세요'),
  transactionType: z.string().min(1, '거래 유형을 선택해주세요'),
  location: z.string().min(2, '희망 지역을 입력해주세요'),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  areaMin: z.string().optional(),
  areaMax: z.string().optional(),
  moveInDate: z.string().optional(),
  
  // 상세 요구사항
  requirements: z.string().min(10, '상세 요구사항을 10자 이상 입력해주세요'),
  additionalInfo: z.string().optional(),
  
  // 연락 설정
  contactMethod: z.array(z.string()).min(1, '연락 방법을 최소 1개 선택해주세요'),
  contactTime: z.string().min(1, '연락 가능 시간을 선택해주세요'),
  
  // 약관 동의
  agreeToTerms: z.boolean().refine(val => val === true, '이용약관에 동의해주세요'),
  agreeToPrivacy: z.boolean().refine(val => val === true, '개인정보처리방침에 동의해주세요'),
  agreeToMarketing: z.boolean().optional(),
})

type PropertyRequestFormData = z.infer<typeof propertyRequestSchema>

interface PropertyRequestFormProps {
  onSubmit: (data: PropertyRequestFormData) => Promise<void>
  isLoading?: boolean
}

export function PropertyRequestForm({ onSubmit, isLoading = false }: PropertyRequestFormProps) {
  const [step, setStep] = useState(1)
  const [contactMethods, setContactMethods] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger
  } = useForm<PropertyRequestFormData>({
    resolver: zodResolver(propertyRequestSchema),
    defaultValues: {
      contactMethod: [],
      agreeToTerms: false,
      agreeToPrivacy: false,
      agreeToMarketing: false,
    }
  })

  const handleContactMethodChange = (method: string, checked: boolean) => {
    let newMethods: string[]
    if (checked) {
      newMethods = [...contactMethods, method]
    } else {
      newMethods = contactMethods.filter(m => m !== method)
    }
    setContactMethods(newMethods)
    setValue('contactMethod', newMethods)
  }

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ['name', 'phone', 'email']
      : step === 2 
      ? ['propertyType', 'transactionType', 'location', 'requirements']
      : []

    const isValid = await trigger(fieldsToValidate as (keyof PropertyRequestFormData)[])
    if (isValid) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleFormSubmit = async (data: PropertyRequestFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('매물 의뢰 제출 실패:', error)
    }
  }

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
                    placeholder="홍길동"
                    className="pl-10"
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">전화번호 *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="010-1234-5678"
                    className="pl-10"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">이메일 *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <Button onClick={nextStep} className="w-full">
              다음 단계
            </Button>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">매물 정보</h3>
              <p className="text-gray-600 text-sm">원하시는 매물 조건을 입력해주세요</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>매물 유형 *</Label>
                <Select onValueChange={(value) => setValue('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="매물 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">사무실</SelectItem>
                    <SelectItem value="retail">상가</SelectItem>
                    <SelectItem value="building">건물</SelectItem>
                    <SelectItem value="warehouse">창고</SelectItem>
                    <SelectItem value="factory">공장</SelectItem>
                  </SelectContent>
                </Select>
                {errors.propertyType && (
                  <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>
                )}
              </div>

              <div>
                <Label>거래 유형 *</Label>
                <Select onValueChange={(value) => setValue('transactionType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="거래 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">매매</SelectItem>
                    <SelectItem value="lease">전세</SelectItem>
                    <SelectItem value="rent">월세</SelectItem>
                  </SelectContent>
                </Select>
                {errors.transactionType && (
                  <p className="text-red-500 text-sm mt-1">{errors.transactionType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">희망 지역 *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="예: 강남구, 서초구"
                    className="pl-10"
                    {...register('location')}
                  />
                </div>
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetMin">예산 (최소)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="budgetMin"
                      placeholder="1000"
                      className="pl-10"
                      {...register('budgetMin')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">단위: 만원</p>
                </div>
                <div>
                  <Label htmlFor="budgetMax">예산 (최대)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="budgetMax"
                      placeholder="5000"
                      className="pl-10"
                      {...register('budgetMax')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">단위: 만원</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="areaMin">면적 (최소)</Label>
                  <Input
                    id="areaMin"
                    placeholder="30"
                    {...register('areaMin')}
                  />
                  <p className="text-xs text-gray-500 mt-1">단위: ㎡</p>
                </div>
                <div>
                  <Label htmlFor="areaMax">면적 (최대)</Label>
                  <Input
                    id="areaMax"
                    placeholder="100"
                    {...register('areaMax')}
                  />
                  <p className="text-xs text-gray-500 mt-1">단위: ㎡</p>
                </div>
              </div>

              <div>
                <Label htmlFor="moveInDate">입주 희망일</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="moveInDate"
                    type="date"
                    className="pl-10"
                    {...register('moveInDate')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">상세 요구사항 *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="requirements"
                    placeholder="원하시는 매물의 구체적인 조건, 편의시설, 접근성 등을 자세히 작성해주세요"
                    className="pl-10 min-h-24"
                    {...register('requirements')}
                  />
                </div>
                {errors.requirements && (
                  <p className="text-red-500 text-sm mt-1">{errors.requirements.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                이전 단계
              </Button>
              <Button onClick={nextStep} className="flex-1">
                다음 단계
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">연락 설정 및 약관 동의</h3>
              <p className="text-gray-600 text-sm">연락 방법과 약관 동의를 완료해주세요</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>선호하는 연락 방법 *</Label>
                <div className="space-y-2 mt-2">
                  {['전화', '문자', '이메일', '카카오톡'].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={method}
                        checked={contactMethods.includes(method)}
                        onCheckedChange={(checked) => handleContactMethodChange(method, !!checked)}
                      />
                      <Label htmlFor={method}>{method}</Label>
                    </div>
                  ))}
                </div>
                {errors.contactMethod && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactMethod.message}</p>
                )}
              </div>

              <div>
                <Label>연락 가능 시간 *</Label>
                <Select onValueChange={(value) => setValue('contactTime', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="연락 가능 시간 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">오전 (09:00-12:00)</SelectItem>
                    <SelectItem value="afternoon">오후 (12:00-18:00)</SelectItem>
                    <SelectItem value="evening">저녁 (18:00-21:00)</SelectItem>
                    <SelectItem value="anytime">언제든지</SelectItem>
                  </SelectContent>
                </Select>
                {errors.contactTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactTime.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="additionalInfo">추가 정보</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="기타 요청사항이나 특별히 고려해야 할 사항이 있다면 작성해주세요"
                  {...register('additionalInfo')}
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    {...register('agreeToTerms')}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    <span className="text-red-500">*</span> 이용약관에 동의합니다
                  </Label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToPrivacy"
                    {...register('agreeToPrivacy')}
                  />
                  <Label htmlFor="agreeToPrivacy" className="text-sm">
                    <span className="text-red-500">*</span> 개인정보처리방침에 동의합니다
                  </Label>
                </div>
                {errors.agreeToPrivacy && (
                  <p className="text-red-500 text-sm">{errors.agreeToPrivacy.message}</p>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToMarketing"
                    {...register('agreeToMarketing')}
                  />
                  <Label htmlFor="agreeToMarketing" className="text-sm">
                    마케팅 정보 수신에 동의합니다 (선택)
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={prevStep} variant="outline" className="flex-1" disabled={isLoading}>
                이전 단계
              </Button>
              <Button onClick={handleSubmit(handleFormSubmit)} className="flex-1" disabled={isLoading}>
                {isLoading ? '제출 중...' : '매물 의뢰하기'}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

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
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= step ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderStep()}
      </CardContent>
    </Card>
  )
}