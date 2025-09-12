"use client"

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PropertyList } from '@/components/property/property-list'
import { HorizontalFilterBar } from '@/components/common/horizontal-filter-bar'
import { SearchParams } from '@/types/search'
import { MapFilterOptions, Property } from '@/types/property'
import { generateMockProperties } from '@/lib/utils/data-normalizer'
import { applyFilters } from '@/lib/utils/property-filter'

function PropertiesContent() {
  const searchParams = useSearchParams()

  // 상태 관리
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [currentFilters, setCurrentFilters] = useState<MapFilterOptions>({})

  // URL 쿼리 파라미터에서 검색 조건 가져오기
  const keyword = searchParams.get('keyword') || ''
  const location = searchParams.get('location') || ''

  // 초기 매물 데이터 로드
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Mock 데이터 로드
        const baseProperties = generateMockProperties()
        
        // 검색 조건 적용
        const searchConditions: Partial<SearchParams> = {}
        if (keyword) searchConditions.keyword = keyword
        if (location) searchConditions.location = location
        
        const filteredProperties = applyFilters(baseProperties, searchConditions, currentFilters)
        setProperties(filteredProperties)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [keyword, location, currentFilters])

  const handleSearch = (searchConditions: SearchParams) => {
    setIsLoading(true)

    // Mock 데이터에서 검색 조건과 필터 적용
    const baseProperties = generateMockProperties()
    const filteredProperties = applyFilters(baseProperties, searchConditions, currentFilters)

    setProperties(filteredProperties)
    setIsLoading(false)
  }

  const handleSortChange = (newSortBy: string) => {
    // 정렬 변경 로직을 나중에 구현
    console.log('Sort changed:', newSortBy)
  }

  const handleFilterChange = (newFilters: MapFilterOptions) => {
    setCurrentFilters(newFilters)
    setIsLoading(true)

    // 현재 검색 조건은 유지하고 필터만 다시 적용
    const baseProperties = generateMockProperties()
    
    // 검색 조건 적용
    const searchConditions: Partial<SearchParams> = {}
    if (keyword) searchConditions.keyword = keyword
    if (location) searchConditions.location = location
    
    const filteredProperties = applyFilters(baseProperties, searchConditions, newFilters)

    setProperties(filteredProperties)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 필터 바 */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-40">
        <div className="container mx-auto py-3 px-4">
          <HorizontalFilterBar 
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            showSearch={true}
            className="max-w-none"
            searchPlaceholder="지역, 매물 검색... (예: 강남 사무실, 서초 상가)"
          />
        </div>
      </div>

      {/* 매물 목록 */}
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-16">
            <div className="text-red-500 mb-4">매물 목록을 불러오는 중 오류가 발생했습니다</div>
            <div className="text-gray-500">{error.message}</div>
          </div>
        ) : (
          <PropertyList
            properties={properties}
            isLoading={isLoading}
            hasMore={false}
            onLoadMore={() => {}}
            onSortChange={handleSortChange}
          />
        )}
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