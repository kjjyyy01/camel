"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Property } from "@/types/property";
import { generateMockProperties } from "@/lib/utils/data-normalizer";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyMap } from "@/components/map/property-map";
import { PropertyImageGallery } from "@/components/ui/property-image-gallery";
import { formatPropertyPrice, formatArea, formatFloor } from "@/lib/utils/price-formatter";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Building,
  Calendar,
  Ruler,
  Car,
  Wifi,
  Coffee,
  Shield,
  Train,
  ShoppingBag,
  Hospital,
  GraduationCap,
  Camera,
} from "lucide-react";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isFavorited = property ? isFavorite(property.id) : false;

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setIsLoading(true);

        // TODO: 실제 API에서 매물 상세 정보 가져오기
        // 현재는 Mock 데이터에서 ID로 찾기
        const mockProperties = generateMockProperties();
        const foundProperty = mockProperties.find((p) => p.id === params.id);

        if (foundProperty) {
          setProperty(foundProperty);
        } else {
          // 404 처리 또는 에러 처리
          console.error("매물을 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("매물 상세 정보 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadProperty();
    }
  }, [params.id]);

  // Carousel API를 사용한 현재 슬라이드 추적
  useEffect(() => {
    if (!api) return;

    const updateCurrentIndex = () => {
      setCurrentImageIndex(api.selectedScrollSnap());
    };

    updateCurrentIndex();
    api.on("select", updateCurrentIndex);

    return () => {
      api?.off("select", updateCurrentIndex);
    };
  }, [api]);

  const handleFavoriteClick = () => {
    if (!property) return;
    toggleFavorite(property.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: property?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("공유하기 실패:", error);
      }
    } else {
      // Fallback: 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 클립보드에 복사되었습니다!");
    }
  };



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
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">매물을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 매물이 존재하지 않거나 삭제되었을 수 있습니다.</p>
          <Button onClick={() => router.push("/properties")}>매물 목록으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">돌아가기</span>
            </Button>

            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">공유</span>
              </Button>
              <Button
                variant={isFavorited ? "default" : "ghost"}
                size="sm"
                onClick={handleFavoriteClick}
                className="gap-2"
              >
                <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                <span className="hidden sm:inline">찜하기</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 이미지 Carousel */}
      <div className="relative h-64 md:h-96 bg-gray-100">
        {property.images && property.images.length > 0 ? (
          <Carousel 
            className="w-full h-full" 
            setApi={setApi}
            opts={{
              loop: true,
              align: "center",
            }}
          >
            <CarouselContent className="h-64 md:h-96 -ml-0">
              {property.images.map((image, index) => (
                <CarouselItem key={index} className="h-64 md:h-96 pl-0">
                  <div className="relative h-64 md:h-96 w-full">
                    {/* 이미지 로딩 중 스켈레톤 */}
                    {imageLoading && (
                      <div className="absolute inset-0 animate-pulse bg-gray-200 flex items-center justify-center">
                        <div className="text-gray-400">
                          <Building className="h-12 w-12" />
                        </div>
                      </div>
                    )}
                    
                    {/* 이미지 에러 시 대체 콘텐츠 */}
                    {imageError && (
                      <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center">
                        <Building className="h-16 w-16 text-gray-400 mb-2" />
                        <p className="text-gray-500 text-sm">이미지를 불러올 수 없습니다</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setImageError(false);
                            setImageLoading(true);
                          }}
                        >
                          다시 시도
                        </Button>
                      </div>
                    )}
                    
                    {/* 메인 이미지 */}
                    {!imageError && (
                      <Image
                        src={image}
                        alt={`${property.title} 사진 ${index + 1}`}
                        fill
                        className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                        priority={index === 0}
                        onLoad={() => setImageLoading(false)}
                        onError={() => {
                          setImageLoading(false);
                          setImageError(true);
                        }}
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Carousel 네비게이션 - 여러 이미지가 있을 때만 표시 */}
            {property.images.length > 1 && (
              <>
                <CarouselPrevious className="left-4 bg-black/50 border-0 text-white hover:bg-black/70" />
                <CarouselNext className="right-4 bg-black/50 border-0 text-white hover:bg-black/70" />
                
                {/* 인디케이터 (점들) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      onClick={() => api?.scrollTo(index)}
                    />
                  ))}
                </div>
                
                {/* 이미지 개수 표시 */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                  <Camera className="h-4 w-4" />
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </>
            )}
          </Carousel>
        ) : (
          /* 이미지가 없을 때 플레이스홀더 */
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400">
              <Building className="h-16 w-16 mx-auto mb-2" />
              <p>이미지가 없습니다</p>
            </div>
          </div>
        )}
      </div>

      {/* 매물 정보 */}
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
                      <span>{property.address}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const priceInfo = formatPropertyPrice(property);
                      const areaInfo = formatArea(property.area);
                      return (
                        <>
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {priceInfo.main}
                          </div>
                          {priceInfo.sub && (
                            <div className="text-lg font-medium text-blue-500">
                              {priceInfo.sub}
                            </div>
                          )}
                          <div className="text-sm text-gray-500 mt-1">
                            {areaInfo.sqm} ({areaInfo.pyeong})
                          </div>
                          {priceInfo.detail && (
                            <div className="text-xs text-gray-400 mt-1">
                              {priceInfo.detail}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">건물유형</div>
                      <div className="text-sm font-medium">상업용</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">전용면적</div>
                      <div className="text-sm font-medium">{formatArea(property.area).sqm}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">층수</div>
                      <div className="text-sm font-medium">{formatFloor(property.floor)}</div>
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
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="description" className="text-xs md:text-sm">상세정보</TabsTrigger>
                <TabsTrigger value="facilities" className="text-xs md:text-sm">편의시설</TabsTrigger>
                <TabsTrigger value="location" className="text-xs md:text-sm">위치정보</TabsTrigger>
                <TabsTrigger value="images" className="text-xs md:text-sm">사진보기</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card>
                  <CardHeader>
                    <CardTitle>매물 상세정보</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{property.description}</p>

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
                        { icon: Wifi, label: "무료 Wi-Fi" },
                        { icon: Car, label: "주차장" },
                        { icon: Coffee, label: "카페" },
                        { icon: Shield, label: "보안시스템" },
                        { icon: Train, label: "지하철역" },
                        { icon: ShoppingBag, label: "쇼핑몰" },
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
                        <p className="text-gray-600">{property.address}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">주변 환경</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { icon: Train, label: "지하철역", distance: "도보 3분" },
                            { icon: ShoppingBag, label: "대형마트", distance: "도보 5분" },
                            { icon: Hospital, label: "종합병원", distance: "차량 10분" },
                            { icon: GraduationCap, label: "대학교", distance: "차량 15분" },
                          ].map((place, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <place.icon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{place.label}</span>
                              <span className="text-xs text-gray-500 ml-auto">{place.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <PropertyMap
                        properties={property.latitude && property.longitude ? [property] : []}
                        center={
                          property.latitude && property.longitude
                            ? { lat: property.latitude, lng: property.longitude }
                            : undefined
                        }
                        level={3}
                        className="h-64 rounded-lg"
                      />
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
                    <PropertyImageGallery 
                      images={property.images || []} 
                      title={property.title}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 오른쪽: 매물 정보 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 lg:top-32">
              <CardHeader>
                <CardTitle>매물 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 가격 정보 */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  {(() => {
                    const priceInfo = formatPropertyPrice(property);
                    return (
                      <>
                        <div className="text-lg font-bold text-blue-600 mb-1">
                          {priceInfo.main}
                        </div>
                        {priceInfo.sub && (
                          <div className="text-md font-medium text-blue-500">
                            {priceInfo.sub}
                          </div>
                        )}
                        {priceInfo.detail && (
                          <div className="text-sm text-gray-600 mt-1">
                            {priceInfo.detail}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* 기본 정보 */}
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-gray-500">면적</span>
                    <span className="text-sm font-medium">{formatArea(property.area).sqm} ({formatArea(property.area).pyeong})</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-gray-500">층수</span>
                    <span className="text-sm font-medium">{formatFloor(property.floor)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-gray-500">건물유형</span>
                    <span className="text-sm font-medium">{property.type === 'office' ? '사무용' : property.type === 'retail' ? '상업용' : '기타'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">상태</span>
                    <span className="text-sm font-medium text-green-600">임대 가능</span>
                  </div>
                </div>

                {/* 관심 매물 등록 */}
                <Button 
                  variant={isFavorited ? "default" : "outline"} 
                  className="w-full gap-2" 
                  size="lg" 
                  onClick={handleFavoriteClick}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                  {isFavorited ? "관심매물 해제" : "관심매물 등록"}
                </Button>

                {/* 안내 문구 */}
                <div className="pt-4 border-t text-center text-sm text-gray-500">
                  <p className="font-medium mb-2">더 자세한 정보가 필요하신가요?</p>
                  <p>고객센터: 02-1234-5678</p>
                  <p className="text-xs text-gray-400 mt-2">
                    평일 09:00 - 18:00<br />
                    토요일 09:00 - 15:00
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
