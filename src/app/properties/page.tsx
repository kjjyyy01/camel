"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PropertyList } from '@/components/property/property-list'
import { SearchBar } from '@/components/search/search-bar'
import { generateMockProperties } from '@/lib/utils/data-normalizer'
import { Property } from '@/types/property'

interface SearchParams {
  keyword: string
  location: string
  propertyType: string
}

function PropertiesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sortBy, setSortBy] = useState('latest')
  const [isLoading, setIsLoading] = useState(true)
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])

  // URL 쿼리 파라미터에서 검색 조건 가져오기
  const keyword = searchParams.get('keyword') || ''
  const location = searchParams.get('location') || ''
  const propertyType = searchParams.get('type') || 'all'

  // Mock 데이터 로드
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      const mockData = generateMockProperties()
      setAllProperties(mockData)
      setIsLoading(false)
    }, 500) // 로딩 시뮬레이션
  }, [])

  // 검색/필터링 로직
  useEffect(() => {
    let filtered = [...allProperties]

    // 키워드 필터링
    if (keyword) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(keyword.toLowerCase()) ||
        property.description?.toLowerCase().includes(keyword.toLowerCase()) ||
        property.address.toLowerCase().includes(keyword.toLowerCase())
      )
    }

    // 위치 필터링
    if (location) {
      filtered = filtered.filter(property =>
        property.address.toLowerCase().includes(location.toLowerCase())
      )
    }

    // 매물 타입 필터링
    if (propertyType !== 'all') {
      filtered = filtered.filter(property =>
        property.type === propertyType
      )
    }

    // 중복 제거
    const uniqueProperties = filtered.filter((property, index, self) => 
      index === self.findIndex(p => p.address === property.address)
    )

    // 정렬
    const sortedProperties = [...uniqueProperties].sort((a, b) => {
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

    setFilteredProperties(sortedProperties)
  }, [allProperties, keyword, location, propertyType, sortBy])

  const handleSearch = (searchConditions: SearchParams) => {
    // URL 업데이트
    const params = new URLSearchParams()
    if (searchConditions.keyword) params.set('keyword', searchConditions.keyword)
    if (searchConditions.location) params.set('location', searchConditions.location)
    if (searchConditions.propertyType && searchConditions.propertyType !== 'all') {
      params.set('type', searchConditions.propertyType)
    }
    
    router.push(`/properties?${params.toString()}`)
  }

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy)
  }


  const handleContactClick = (property: any) => {
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
          properties={filteredProperties}
          isLoading={isLoading}
          hasMore={false}
          onLoadMore={undefined}
          onSortChange={handleSortChange}
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