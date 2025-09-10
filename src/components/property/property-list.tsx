"use client"

import { Property } from '@/types/property'
import { PropertyCard } from './property-card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Grid, List, Filter, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'

interface PropertyListProps {
  properties: Property[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onSortChange?: (sortBy: string) => void
  onContactClick?: (property: Property) => void
  className?: string
}

type ViewMode = 'grid' | 'list'
type SortOption = 'latest' | 'price-low' | 'price-high' | 'area-large' | 'area-small'

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'price-low', label: '가격 낮은순' },
  { value: 'price-high', label: '가격 높은순' },
  { value: 'area-large', label: '면적 넓은순' },
  { value: 'area-small', label: '면적 좁은순' },
] as const

export function PropertyList({
  properties,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onSortChange,
  onContactClick,
  className = ""
}: PropertyListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('latest')

  // 무한 스크롤 훅 사용
  const { loadingRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: onLoadMore || (() => {})
  })

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    onSortChange?.(value)
  }

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <Filter className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        검색 결과가 없습니다
      </h3>
      <p className="text-gray-500 mb-6">
        다른 검색 조건으로 다시 시도해보세요
      </p>
      <Button variant="outline">
        검색 조건 변경
      </Button>
    </div>
  )

  const LoadingSkeleton = () => (
    <div className={`grid gap-6 ${
      viewMode === 'grid' 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1'
    }`}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
            
            <div className="flex gap-2">
              <div className="h-9 flex-1 bg-gray-200 rounded"></div>
              <div className="h-9 flex-1 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더: 결과 개수, 정렬, 뷰 모드 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">
            총 {properties.length}개의 매물
          </h2>
          
          {/* 정렬 옵션 */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 뷰 모드 전환 */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 매물 목록 */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : properties.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onContactClick={onContactClick}
                className={viewMode === 'list' ? 'md:flex md:flex-row' : ''}
              />
            ))}
          </div>

          {/* 무한 스크롤 로딩 인디케이터 */}
          {onLoadMore && (
            <div 
              ref={loadingRef}
              className="flex justify-center items-center py-8"
            >
              {isLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>더 많은 매물을 불러오는 중...</span>
                </div>
              ) : hasMore ? (
                <div className="text-gray-400 text-sm">
                  스크롤하여 더 많은 매물 보기
                </div>
              ) : (
                <div className="text-gray-400 text-sm">
                  모든 매물을 확인했습니다
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}