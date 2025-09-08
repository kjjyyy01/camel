"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PropertyList } from '@/components/property/property-list'
import { SearchBar } from '@/components/search/search-bar'
import { generateMockProperties } from '@/lib/utils/data-normalizer'
import { koreaRealEstateApi } from '@/lib/api/korea-real-estate'
import { KakaoMapApi } from '@/lib/api/kakao-map'
import { Property } from '@/types/property'

interface SearchParams {
  keyword: string
  location: string
  propertyType: string
}

function PropertiesContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  // URL 쿼리 파라미터에서 초기 검색 조건 가져오기
  const initialKeyword = searchParams.get('keyword') || ''
  const initialLocation = searchParams.get('location') || ''
  const initialType = searchParams.get('type') || 'all'

  // 초기 매물 데이터 로드
  useEffect(() => {
    loadProperties({
      keyword: initialKeyword,
      location: initialLocation,
      propertyType: initialType
    })
  }, [initialKeyword, initialLocation, initialType])

  const loadProperties = async (searchConditions: SearchParams, append = false) => {
    try {
      setIsLoading(true)
      const kakaoMapApi = new KakaoMapApi()
      let allProperties: Property[] = []

      try {
        // 실제 Korea Real Estate API 호출
        const currentYear = new Date().getFullYear().toString()
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0')
        
        // 여러 지역 코드로 검색 (서울 주요 구)
        const regionCodes = ['11680', '11650', '11440', '11410', '11500'] // 강남, 서초, 마포, 서대문, 중구
        
        for (const regionCode of regionCodes) {
          try {
            console.log(`지역 데이터 로드 시작: ${regionCode}`)
            
            // 상업용 부동산 전월세 데이터 호출
            const commercialRentData = await koreaRealEstateApi.fetchOfficeRentData(
              regionCode, 
              currentYear + currentMonth
            )
            
            // 상업용 부동산 매매 데이터 호출  
            const commercialSaleData = await koreaRealEstateApi.fetchCommercialSaleData(
              regionCode,
              currentYear + currentMonth
            )
            
            // 데이터를 Property 타입으로 변환 (좌표 변환 포함)
            const normalizedRentProperties = await Promise.all(
              commercialRentData.map(async item => {
                const address = `${item.법정동} ${item.지번}`
                try {
                  const coordinates = await kakaoMapApi.geocoding(address)
                  return koreaRealEstateApi.normalizeToProperty(item, coordinates || undefined)
                } catch (error) {
                  console.warn(`좌표 변환 실패: ${address}`, error)
                  return koreaRealEstateApi.normalizeToProperty(item)
                }
              })
            )
            
            const normalizedSaleProperties = await Promise.all(
              commercialSaleData.map(async item => {
                const address = `${item.법정동} ${item.지번}`
                try {
                  const coordinates = await kakaoMapApi.geocoding(address)
                  return koreaRealEstateApi.normalizeToProperty(item, coordinates || undefined)
                } catch (error) {
                  console.warn(`좌표 변환 실패: ${address}`, error)
                  return koreaRealEstateApi.normalizeToProperty(item)
                }
              })
            )
            
            allProperties.push(...normalizedRentProperties, ...normalizedSaleProperties)
            
            console.log(`지역 ${regionCode}: 전월세 ${normalizedRentProperties.length}건, 매매 ${normalizedSaleProperties.length}건`)
            
            // API 호출 제한을 위한 딜레이
            await new Promise(resolve => setTimeout(resolve, 200))
            
          } catch (regionError) {
            console.warn(`지역 ${regionCode} 데이터 로드 실패:`, regionError)
            continue
          }
        }
        
        // API에서 데이터를 못 가져온 경우에만 Mock 데이터 사용
        if (allProperties.length === 0) {
          console.warn('API에서 데이터를 가져오지 못함, Mock 데이터 사용')
          allProperties = generateMockProperties()
        } else {
          console.log(`실제 API에서 ${allProperties.length}건의 매물 데이터 로드 성공`)
        }
        
      } catch (apiError) {
        console.warn('Korea Real Estate API 호출 실패, Mock 데이터 사용:', apiError)
        allProperties = generateMockProperties()
      }
      
      // 검색 조건 적용
      let filteredProperties = allProperties
      
      if (searchConditions.keyword) {
        filteredProperties = filteredProperties.filter(property =>
          property.title.toLowerCase().includes(searchConditions.keyword.toLowerCase()) ||
          property.description?.toLowerCase().includes(searchConditions.keyword.toLowerCase()) ||
          property.address.toLowerCase().includes(searchConditions.keyword.toLowerCase())
        )
      }
      
      if (searchConditions.location) {
        filteredProperties = filteredProperties.filter(property =>
          property.address.toLowerCase().includes(searchConditions.location.toLowerCase())
        )
      }
      
      if (searchConditions.propertyType !== 'all') {
        filteredProperties = filteredProperties.filter(property =>
          property.type === searchConditions.propertyType
        )
      }

      // 중복 제거 (같은 주소의 매물)
      const uniqueProperties = filteredProperties.filter((property, index, self) => 
        index === self.findIndex(p => p.address === property.address)
      )

      if (append) {
        setProperties(prev => [...prev, ...uniqueProperties.slice(properties.length, properties.length + 12)])
      } else {
        setProperties(uniqueProperties.slice(0, 20))
      }

      setHasMore(uniqueProperties.length > (append ? properties.length + 12 : 20))
      
    } catch (error) {
      console.error('매물 데이터 로드 실패:', error)
      // 오류 발생 시 Mock 데이터라도 표시
      const mockProperties = generateMockProperties()
      setProperties(mockProperties)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (searchConditions: SearchParams) => {
    // URL 업데이트
    const url = new URL(window.location.href)
    url.searchParams.set('keyword', searchConditions.keyword)
    url.searchParams.set('location', searchConditions.location)
    url.searchParams.set('type', searchConditions.propertyType)
    window.history.pushState({}, '', url.toString())

    // 새로운 검색 실행
    loadProperties(searchConditions, false)
  }

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadProperties({
        keyword: initialKeyword,
        location: initialLocation,
        propertyType: initialType
      }, true)
    }
  }

  const handleSortChange = (sortBy: string) => {
    const sortedProperties = [...properties].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          const priceA = a.price || a.deposit || a.monthly_rent || 0
          const priceB = b.price || b.deposit || b.monthly_rent || 0
          return priceA - priceB
        case 'price-high':
          const priceA2 = a.price || a.deposit || a.monthly_rent || 0
          const priceB2 = b.price || b.deposit || b.monthly_rent || 0
          return priceB2 - priceA2
        case 'area-large':
          return b.area - a.area
        case 'area-small':
          return a.area - b.area
        case 'latest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
    setProperties(sortedProperties)
  }

  const handleFavoriteClick = (propertyId: string) => {
    // TODO: 실제 찜하기 API 호출
    console.log('찜하기:', propertyId)
    
    // 로컬 상태 업데이트 (임시)
    setProperties(prev => 
      prev.map(property => 
        property.id === propertyId 
          ? { ...property, like_count: property.like_count + 1 }
          : property
      )
    )
  }

  const handleContactClick = (property: Property) => {
    // TODO: 문의하기 모달 또는 페이지로 이동
    console.log('문의하기:', property.id)
    alert(`${property.title}에 대한 문의를 시작합니다.`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 검색바 */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-40">
        <div className="container mx-auto py-6 px-4">
          <SearchBar 
            onSearch={handleSearch}
            className="max-w-6xl"
          />
        </div>
      </div>

      {/* 매물 목록 */}
      <div className="container mx-auto px-4 py-8">
        <PropertyList
          properties={properties}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={hasMore ? handleLoadMore : undefined}
          onSortChange={handleSortChange}
          onFavoriteClick={handleFavoriteClick}
          onContactClick={handleContactClick}
        />
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="mt-2 text-gray-600">매물 목록 로딩 중...</div>
        </div>
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  )
}