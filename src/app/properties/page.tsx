"use client"

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PropertyList } from '@/components/property/property-list'
import { SearchBar } from '@/components/search/search-bar'
import { useProperties } from '@/hooks/use-properties'
import { SearchParams } from '@/types/search'

function PropertiesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sortBy, setSortBy] = useState('latest')

  // URL 쿼리 파라미터에서 검색 조건 가져오기
  const keyword = searchParams.get('keyword') || ''
  const location = searchParams.get('location') || ''
  const propertyType = searchParams.get('type') || 'all'

  // Tanstack Query 훅 사용
  const { 
    properties: filteredProperties, 
    isLoading, 
    error 
  } = useProperties({
    keyword,
    location,
    propertyType,
    sortBy
  })

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
        {error ? (
          <div className="text-center py-16">
            <div className="text-red-500 mb-4">매물 목록을 불러오는 중 오류가 발생했습니다</div>
            <div className="text-gray-500">{error.message}</div>
          </div>
        ) : (
          <PropertyList
            properties={filteredProperties}
            isLoading={isLoading}
            hasMore={false}
            onLoadMore={undefined}
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