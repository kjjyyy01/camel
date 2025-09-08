"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Filter, ChevronDown, RotateCcw } from 'lucide-react'
import { PropertyType, TransactionType } from '@/types/property'

export interface PropertyFilterOptions {
  propertyType: PropertyType | 'all'
  transactionType: TransactionType | 'all'
  priceMin: number
  priceMax: number
  areaMin: number
  areaMax: number
  location: string
  amenities: string[]
  hasElevator: boolean
  hasParking: boolean
  yearBuiltMin: number | null
  yearBuiltMax: number | null
}

interface PropertyFilterProps {
  onFilterChange: (filters: PropertyFilterOptions) => void
  className?: string
}

const PROPERTY_TYPES = [
  { value: 'all', label: '전체' },
  { value: 'office', label: '사무실' },
  { value: 'retail', label: '상가' },
  { value: 'building', label: '건물' },
  { value: 'warehouse', label: '창고' },
  { value: 'factory', label: '공장' },
] as const

const TRANSACTION_TYPES = [
  { value: 'all', label: '전체' },
  { value: 'sale', label: '매매' },
  { value: 'rent', label: '월세' },
  { value: 'jeonse', label: '전세' },
] as const

const AMENITY_OPTIONS = [
  '엘리베이터', '주차장', '에어컨', '화장실', '인터넷',
  '보안시설', '휠체어접근', '카페테리아', '회의실', '라운지'
]

const DEFAULT_FILTERS: PropertyFilterOptions = {
  propertyType: 'all',
  transactionType: 'all',
  priceMin: 0,
  priceMax: 100000,
  areaMin: 0,
  areaMax: 1000,
  location: '',
  amenities: [],
  hasElevator: false,
  hasParking: false,
  yearBuiltMin: null,
  yearBuiltMax: null,
}

export function PropertyFilter({ onFilterChange, className = '' }: PropertyFilterProps) {
  const [filters, setFilters] = useState<PropertyFilterOptions>(DEFAULT_FILTERS)
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof PropertyFilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked
      ? [...filters.amenities, amenity]
      : filters.amenities.filter(a => a !== amenity)
    updateFilter('amenities', newAmenities)
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    onFilterChange(DEFAULT_FILTERS)
  }

  const formatPrice = (value: number) => {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}억`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}천만`
    }
    return `${value}만원`
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                상세 필터
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-4 space-y-6">
              {/* 매물 유형 및 거래 유형 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>매물 유형</Label>
                  <Select 
                    value={filters.propertyType} 
                    onValueChange={(value) => updateFilter('propertyType', value as PropertyType | 'all')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>거래 유형</Label>
                  <Select 
                    value={filters.transactionType} 
                    onValueChange={(value) => updateFilter('transactionType', value as TransactionType | 'all')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 가격 범위 */}
              <div className="space-y-3">
                <Label>가격 범위</Label>
                <div className="px-2">
                  <Slider
                    value={[filters.priceMin, filters.priceMax]}
                    onValueChange={([min, max]) => {
                      updateFilter('priceMin', min)
                      updateFilter('priceMax', max)
                    }}
                    max={100000}
                    min={0}
                    step={500}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>{formatPrice(filters.priceMin)}</span>
                    <span>{formatPrice(filters.priceMax)}</span>
                  </div>
                </div>
              </div>

              {/* 면적 범위 */}
              <div className="space-y-3">
                <Label>면적 범위 (㎡)</Label>
                <div className="px-2">
                  <Slider
                    value={[filters.areaMin, filters.areaMax]}
                    onValueChange={([min, max]) => {
                      updateFilter('areaMin', min)
                      updateFilter('areaMax', max)
                    }}
                    max={1000}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>{filters.areaMin}㎡</span>
                    <span>{filters.areaMax}㎡</span>
                  </div>
                </div>
              </div>

              {/* 지역 */}
              <div className="space-y-2">
                <Label>지역</Label>
                <Input
                  placeholder="지역명을 입력하세요"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                />
              </div>

              {/* 건축년도 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>건축년도 (시작)</Label>
                  <Input
                    type="number"
                    placeholder="예: 2000"
                    value={filters.yearBuiltMin || ''}
                    onChange={(e) => updateFilter('yearBuiltMin', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>건축년도 (끝)</Label>
                  <Input
                    type="number"
                    placeholder="예: 2023"
                    value={filters.yearBuiltMax || ''}
                    onChange={(e) => updateFilter('yearBuiltMax', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
              </div>

              {/* 필수 시설 */}
              <div className="space-y-3">
                <Label>필수 시설</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="elevator"
                      checked={filters.hasElevator}
                      onCheckedChange={(checked) => updateFilter('hasElevator', checked)}
                    />
                    <Label htmlFor="elevator" className="text-sm">엘리베이터</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="parking"
                      checked={filters.hasParking}
                      onCheckedChange={(checked) => updateFilter('hasParking', checked)}
                    />
                    <Label htmlFor="parking" className="text-sm">주차 가능</Label>
                  </div>
                </div>
              </div>

              {/* 편의시설 */}
              <div className="space-y-3">
                <Label>편의시설</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AMENITY_OPTIONS.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={filters.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                      />
                      <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 초기화 버튼 */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={resetFilters}
                  variant="outline" 
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  필터 초기화
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  )
}