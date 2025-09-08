"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Property } from '@/types/property'
import { generateMockProperties } from '@/lib/utils/data-normalizer'
import { useFavorites } from '@/hooks/use-favorites'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Building, 
  Calendar,
  Ruler,
  Phone,
  MessageCircle,
  Car,
  Wifi,
  Coffee,
  Shield,
  Train,
  ShoppingBag,
  Hospital,
  GraduationCap
} from 'lucide-react'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toggleFavorite, isFavorite } = useFavorites()
  const isFavorited = property ? isFavorite(property.id) : false

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setIsLoading(true)
        
        // TODO: 실제 API에서 매물 상세 정보 가져오기
        // 현재는 Mock 데이터에서 ID로 찾기
        const mockProperties = generateMockProperties()
        const foundProperty = mockProperties.find(p => p.id === params.id)
        
        if (foundProperty) {
          setProperty(foundProperty)
        } else {
          // 404 처리 또는 에러 처리
          console.error('매물을 찾을 수 없습니다.')
        }
        
      } catch (error) {
        console.error('매물 상세 정보 로드 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadProperty()
    }
  }, [params.id])

  const handleFavoriteClick = () => {
    if (!property) return
    toggleFavorite(property.id)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: property?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.error('공유하기 실패:', error)
      }
    } else {
      // Fallback: 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 클립보드에 복사되었습니다!')
    }
  }

  const handleContact = () => {
    if (!property) return
    // TODO: 문의하기 기능 구현
    alert(`${property.title}에 대한 문의를 시작합니다.`)
  }

  const formatPrice = (property: Property) => {
    if (property.price) {
      return `매매 ${(property.price / 10000).toLocaleString()}만원`
    } else if (property.deposit && property.monthly_rent) {
      return `전세 ${(property.deposit / 10000).toLocaleString()}만원 / 월세 ${property.monthly_rent.toLocaleString()}만원`
    } else if (property.deposit) {
      return `보증금 ${(property.deposit / 10000).toLocaleString()}만원`
    }
    return '가격 문의'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300"></div>
          <div className="container mx-auto px-4 py-8 space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            <div className="h-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">매물을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 매물이 존재하지 않거나 삭제되었을 수 있습니다.</p>
          <Button onClick={() => router.push('/properties')}>
            매물 목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                공유
              </Button>
              <Button
                variant={isFavorited ? "default" : "ghost"}
                size="sm"
                onClick={handleFavoriteClick}
                className="gap-2"
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                찜하기
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 이미지 */}
      <div className="relative h-64 md:h-96">
        <Image
          src={property.images?.[0] || "/images/placeholder-property.jpg"}
          alt={property.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* 매물 정보 */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 매물 상세 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary">{property.type}</Badge>
                      <Badge variant="outline">{property.transaction_type}</Badge>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{property.location.address}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {formatPrice(property)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.area.total}㎡ ({Math.round(property.area.total * 0.3025)}평)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">건물유형</div>
                      <div className="text-sm font-medium">{property.building_type || '상업용'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">전용면적</div>
                      <div className="text-sm font-medium">{property.area.exclusive || property.area.total}㎡</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">층수</div>
                      <div className="text-sm font-medium">{property.floor || '-'}층</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">주차</div>
                      <div className="text-sm font-medium">가능</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 탭 메뉴 */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">상세정보</TabsTrigger>
                <TabsTrigger value="facilities">편의시설</TabsTrigger>
                <TabsTrigger value="location">위치정보</TabsTrigger>
                <TabsTrigger value="images">사진보기</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card>
                  <CardHeader>
                    <CardTitle>매물 상세정보</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {property.description}
                    </p>
                    
                    <div className="mt-6 space-y-4">
                      <h4 className="font-semibold">매물 특징</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• 접근성이 뛰어난 역세권 입지</li>
                        <li>• 대형 쇼핑몰과 인접</li>
                        <li>• 24시간 보안 시스템</li>
                        <li>• 충분한 주차 공간 확보</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="facilities">
                <Card>
                  <CardHeader>
                    <CardTitle>편의시설</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { icon: Wifi, label: '무료 Wi-Fi' },
                        { icon: Car, label: '주차장' },
                        { icon: Coffee, label: '카페' },
                        { icon: Shield, label: '보안시스템' },
                        { icon: Train, label: '지하철역' },
                        { icon: ShoppingBag, label: '쇼핑몰' }
                      ].map((facility, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <facility.icon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm">{facility.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location">
                <Card>
                  <CardHeader>
                    <CardTitle>위치정보</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">주소</h4>
                        <p className="text-gray-600">{property.location.address}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">주변 환경</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { icon: Train, label: '지하철역', distance: '도보 3분' },
                            { icon: ShoppingBag, label: '대형마트', distance: '도보 5분' },
                            { icon: Hospital, label: '종합병원', distance: '차량 10분' },
                            { icon: GraduationCap, label: '대학교', distance: '차량 15분' }
                          ].map((place, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <place.icon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{place.label}</span>
                              <span className="text-xs text-gray-500 ml-auto">{place.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* TODO: 실제 지도 컴포넌트 추가 */}
                      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">지도 (추후 구현)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images">
                <Card>
                  <CardHeader>
                    <CardTitle>매물 사진</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(property.images || []).map((image, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`${property.title} 사진 ${index + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                      {(!property.images || property.images.length === 0) && (
                        <div className="col-span-full text-center py-8 text-gray-400">
                          등록된 사진이 없습니다
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 오른쪽: 문의하기 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle>문의하기</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={handleContact}
                >
                  <Phone className="h-4 w-4" />
                  전화 문의
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={handleContact}
                >
                  <MessageCircle className="h-4 w-4" />
                  채팅 문의
                </Button>

                <div className="pt-4 border-t text-center text-sm text-gray-500">
                  <p>평일 09:00 - 18:00</p>
                  <p>토요일 09:00 - 15:00</p>
                  <p className="mt-2 font-medium">부동산 전문 컨설턴트가<br />친절히 상담해드립니다</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}