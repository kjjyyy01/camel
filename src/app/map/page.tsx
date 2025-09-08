"use client"

import { useState, useEffect } from 'react'
import { PropertyMap } from '@/components/map/property-map'
import { PropertyMarker } from '@/components/map/property-marker'
import { SearchBar } from '@/components/search/search-bar'
import { generateMockProperties, DataNormalizer } from '@/lib/utils/data-normalizer'
import { KoreaRealEstateApi } from '@/lib/api/korea-real-estate'
import { Property } from '@/types/property'

interface SearchParams {
  keyword: string
  location: string
  propertyType: string
}

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 초기 매물 데이터 로드 (실제 API 사용)
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setIsLoading(true)
        
        let allProperties: Property[] = []

        try {
          // 실제 Korea Real Estate API 호출
          const currentYear = new Date().getFullYear().toString()
          const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0')
          
          // 서울 주요 구 검색
          const regionCodes = ['11680', '11650', '11440'] // 강남, 서초, 마포
          
          for (const regionCode of regionCodes) {
            try {
              const commercialData = await KoreaRealEstateApi.getCommercialProperties({
                lawd_cd: regionCode,
                deal_ymd: currentYear + currentMonth.padStart(2, '0')
              })
              
              const normalizedData = commercialData.map(item => DataNormalizer.normalizeCommercialProperty(item))
              allProperties.push(...normalizedData)
              
              // API 호출 제한 방지
              await new Promise(resolve => setTimeout(resolve, 300))
              
            } catch (regionError) {
              console.warn(`지역 ${regionCode} 데이터 로드 실패:`, regionError)
            }
          }
          
          if (allProperties.length === 0) {
            console.warn('API 데이터 없음, Mock 데이터 사용')
            allProperties = generateMockProperties()
          }
          
        } catch (apiError) {
          console.warn('API 호출 실패, Mock 데이터 사용:', apiError)
          allProperties = generateMockProperties()
        }
        
        // 중복 제거
        const uniqueProperties = allProperties.filter((property, index, self) => 
          index === self.findIndex(p => p.location.address === property.location.address)
        )
        
        setProperties(uniqueProperties)
        
      } catch (error) {
        console.error('매물 데이터 로드 실패:', error)
        setProperties(generateMockProperties())
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [])

  const handleSearch = async (params: SearchParams) => {
    try {
      setIsLoading(true)
      
      let allProperties: Property[] = []

      try {
        // API 호출로 새 데이터 가져오기
        const currentYear = new Date().getFullYear().toString()
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0')
        
        const regionCodes = ['11680', '11650', '11440', '11410', '11500']
        
        for (const regionCode of regionCodes) {
          try {
            const commercialData = await KoreaRealEstateApi.getCommercialProperties({
              lawd_cd: regionCode,
              deal_ymd: currentYear + currentMonth.padStart(2, '0')
            })
            
            const normalizedData = commercialData.map(item => DataNormalizer.normalizeCommercialProperty(item))
            allProperties.push(...normalizedData)
            
            await new Promise(resolve => setTimeout(resolve, 200))
            
          } catch (regionError) {
            console.warn(`지역 ${regionCode} 검색 실패:`, regionError)
          }
        }
        
        if (allProperties.length === 0) {
          allProperties = generateMockProperties()
        }
        
      } catch (apiError) {
        console.warn('API 검색 실패, Mock 데이터 사용:', apiError)
        allProperties = generateMockProperties()
      }
      
      // 검색 조건 적용
      let filteredProperties = allProperties
      
      if (params.keyword) {
        filteredProperties = filteredProperties.filter(property =>
          property.title.toLowerCase().includes(params.keyword.toLowerCase()) ||
          property.description.toLowerCase().includes(params.keyword.toLowerCase()) ||
          property.location.address.toLowerCase().includes(params.keyword.toLowerCase())
        )
      }
      
      if (params.location) {
        filteredProperties = filteredProperties.filter(property =>
          property.location.address.toLowerCase().includes(params.location.toLowerCase()) ||
          property.location.district?.toLowerCase().includes(params.location.toLowerCase()) ||
          property.location.dong?.toLowerCase().includes(params.location.toLowerCase())
        )
      }
      
      if (params.propertyType !== 'all') {
        filteredProperties = filteredProperties.filter(property =>
          property.type === params.propertyType
        )
      }
      
      // 중복 제거
      const uniqueProperties = filteredProperties.filter((property, index, self) => 
        index === self.findIndex(p => p.location.address === property.location.address)
      )
      
      setProperties(uniqueProperties)
      
    } catch (error) {
      console.error('검색 실패:', error)
      setProperties(generateMockProperties())
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property)
  }

  const handlePropertyClick = () => {
    // TODO: 매물 상세 페이지로 이동
    if (selectedProperty) {
      console.log('매물 상세 보기:', selectedProperty.id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 검색바 */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-40">
        <div className="container mx-auto py-4 px-4">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* 지도 및 매물 정보 */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* 지도 영역 */}
        <div className="flex-1 relative">
          <PropertyMap
            properties={properties}
            onMarkerClick={handleMarkerClick}
            className="w-full h-full"
          />
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <div className="mt-2 text-gray-600">매물 검색 중...</div>
              </div>
            </div>
          )}
        </div>

        {/* 매물 상세 정보 패널 */}
        {selectedProperty && (
          <div className="w-96 bg-white border-l shadow-lg overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">매물 정보</h2>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <PropertyMarker
                property={selectedProperty}
                onClick={handlePropertyClick}
                className="w-full shadow-none border-0"
              />
              
              {/* 추가 정보 */}
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">상세 설명</h3>
                  <p className="text-sm text-gray-600">
                    {selectedProperty.description}
                  </p>
                </div>
                
                {selectedProperty.contact.agent_name && (
                  <div>
                    <h3 className="font-semibold mb-2">담당자 정보</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>이름: {selectedProperty.contact.agent_name}</div>
                      {selectedProperty.contact.phone && (
                        <div>연락처: {selectedProperty.contact.phone}</div>
                      )}
                      {selectedProperty.contact.company && (
                        <div>소속: {selectedProperty.contact.company}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}