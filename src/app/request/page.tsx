"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PropertyRequestForm } from '@/components/forms/property-request-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Clock,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  Building,
  Users,
  Star
} from 'lucide-react'

type PropertyRequestFormData = {
  name: string
  phone: string
  email: string
  propertyType: string
  transactionType: string
  location: string
  budgetMin?: string
  budgetMax?: string
  areaMin?: string
  areaMax?: string
  moveInDate?: string
  requirements: string
  additionalInfo?: string
  contactMethod: string[]
  contactTime: string
}

export default function RequestPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [submittedData, setSubmittedData] = useState<PropertyRequestFormData | null>(null)

  const handleSubmit = async (data: PropertyRequestFormData) => {
    setIsLoading(true)
    setError('')

    try {
      // TODO: 실제 API 연동
      // 현재는 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Supabase에 데이터 저장 또는 이메일 전송 로직
      console.log('매물 의뢰 데이터:', data)
      
      setSubmittedData(data)
      setIsSubmitted(true)
    } catch (error) {
      console.error('매물 의뢰 제출 실패:', error)
      setError('매물 의뢰 제출에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted && submittedData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold text-green-600">
                매물 의뢰가 완료되었습니다!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">의뢰 정보</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div><strong>이름:</strong> {submittedData.name}</div>
                  <div><strong>연락처:</strong> {submittedData.phone}</div>
                  <div><strong>매물 유형:</strong> {submittedData.propertyType}</div>
                  <div><strong>희망 지역:</strong> {submittedData.location}</div>
                  <div><strong>선호 연락방법:</strong> {submittedData.contactMethod.join(', ')}</div>
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
                <Button onClick={() => router.push('/')} className="flex-1">
                  홈으로 돌아가기
                </Button>
                <Button onClick={() => router.push('/properties')} variant="outline" className="flex-1">
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            원하는 매물을 찾아드립니다
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            전문 부동산 컨설턴트가 고객님의 요구사항에 맞는<br />
            최적의 상업용 매물을 찾아서 추천해드립니다.
          </p>
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

        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 매물 의뢰 폼 */}
        <PropertyRequestForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {/* 추가 정보 */}
        <div className="max-w-2xl mx-auto mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">이용 안내</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
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
                <p>매물 의뢰 및 상담은 <strong>무료</strong>로 제공됩니다.</p>
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
  )
}