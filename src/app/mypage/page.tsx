"use client"

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, FileText, Settings, Phone, Mail, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// Mock data - 실제로는 API에서 가져올 데이터
const mockPropertyRequests = [
  {
    id: '1',
    type: '임대',
    region: '강남구',
    budget: '5,000만원 ~ 1억원',
    status: 'pending',
    created_at: '2024-12-01',
    requirements: '접근성이 좋고 주차가 편리한 사무실'
  },
  {
    id: '2',
    type: '매매',
    region: '서초구',
    budget: '10억원 ~ 15억원',
    status: 'in_progress',
    created_at: '2024-11-28',
    requirements: '신축 건물 선호'
  }
]

const mockFavoriteProperties = [
  {
    id: '1',
    title: '강남역 초역세권 프리미엄 오피스',
    address: '서울 강남구 강남대로 123',
    price: 800000000,
    area: 85,
    type: 'office',
    images: ['/placeholder-property.jpg']
  },
  {
    id: '2',
    title: '홍대입구 복합상가 1층 매장',
    address: '서울 마포구 홍익로 456',
    price: 50000000,
    area: 45,
    type: 'retail',
    images: ['/placeholder-property.jpg']
  }
]

export default function MyPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { text: '대기중', variant: 'secondary' as const },
      in_progress: { text: '진행중', variant: 'default' as const },
      contacted: { text: '연락완료', variant: 'default' as const },
      completed: { text: '완료', variant: 'default' as const },
      cancelled: { text: '취소', variant: 'destructive' as const }
    }
    return statusMap[status as keyof typeof statusMap] || { text: status, variant: 'secondary' as const }
  }

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억원`
    } else if (price >= 10000) {
      return `${(price / 10000).toFixed(0)}만원`
    }
    return `${price.toLocaleString()}원`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
          <p className="text-gray-600">계정 정보와 활동 내역을 관리하세요</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:block">프로필</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:block">의뢰 내역</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:block">설정</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>프로필 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {user.user_metadata?.name || '이름 미설정'}
                    </h3>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {user.email}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">기본 정보</h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">전화번호:</span>
                        <span className="ml-2">{user.user_metadata?.phone || '미등록'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">관심 지역:</span>
                        <span className="ml-2">강남구, 서초구</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">활동 현황</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">의뢰 내역</span>
                        <Badge variant="secondary">{mockPropertyRequests.length}건</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">가입일</span>
                        <span className="text-gray-900">
                          {new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button>프로필 수정</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>매물 의뢰 내역 ({mockPropertyRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {mockPropertyRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">의뢰 내역이 없습니다</p>
                    <Button asChild>
                      <Link href="/request">매물 의뢰하기</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockPropertyRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{request.type}</Badge>
                            <span className="font-medium">{request.region}</span>
                          </div>
                          <Badge {...getStatusBadge(request.status)}>
                            {getStatusBadge(request.status).text}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">예산:</span>
                            <span>{request.budget}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="text-gray-600">요구사항:</span>
                            <span className="flex-1">{request.requirements}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">의뢰일:</span>
                            <span>{new Date(request.created_at).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>계정 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">알림 설정</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">새로운 매물 알림 받기</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">의뢰 진행 상황 알림 받기</span>
                    </label>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">계정 관리</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      비밀번호 변경
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      개인정보 수정
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      회원 탈퇴
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}