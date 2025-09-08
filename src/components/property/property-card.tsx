"use client"

import { Property } from '@/types/property'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Building, Eye, Heart, Phone, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useFavorites } from '@/hooks/use-favorites'

interface PropertyCardProps {
  property: Property
  onFavoriteClick?: (propertyId: string) => void
  onContactClick?: (property: Property) => void
  className?: string
  showActions?: boolean
}

export function PropertyCard({ 
  property, 
  onFavoriteClick, 
  onContactClick,
  className = "",
  showActions = true 
}: PropertyCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites()
  const isFavorited = isFavorite(property.id)

  const formatPrice = (price: number, deposit?: number, monthlyRent?: number) => {
    if (property.transaction_type === 'sale' && price) {
      return `매매 ${price.toLocaleString()}만원`
    } else if (property.transaction_type === 'lease') {
      if (deposit && !monthlyRent) {
        return `전세 ${deposit.toLocaleString()}만원`
      } else if (monthlyRent) {
        const depositText = deposit ? `${deposit.toLocaleString()}` : '0'
        return `월세 ${depositText}/${monthlyRent.toLocaleString()}만원`
      }
    }
    return '가격 협의'
  }

  const getPropertyTypeLabel = (type: string) => {
    const typeMap = {
      office: '사무실',
      retail: '상가',
      building: '건물',
      warehouse: '창고',
      factory: '공장'
    }
    return typeMap[type as keyof typeof typeMap] || type
  }

  const getPropertyTypeBadgeColor = (type: string) => {
    const colorMap = {
      office: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      retail: 'bg-red-100 text-red-800 hover:bg-red-200',
      building: 'bg-green-100 text-green-800 hover:bg-green-200',
      warehouse: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      factory: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
    }
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(property.id)
    onFavoriteClick?.(property.id)
  }

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onContactClick?.(property)
  }

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${className}`}>
      <Link href={`/properties/${property.id}`}>
        <CardHeader className="pb-3">
          {/* 상단 배지와 즐겨찾기 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getPropertyTypeBadgeColor(property.type)}>
                {getPropertyTypeLabel(property.type)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {property.transaction_type === 'sale' ? '매매' : '전월세'}
              </Badge>
              {property.amenities.includes('엘리베이터') && (
                <Badge variant="secondary" className="text-xs">엘리베이터</Badge>
              )}
              {property.amenities.includes('주차장') && (
                <Badge variant="secondary" className="text-xs">주차가능</Badge>
              )}
            </div>
            
            {showActions && (
              <button
                onClick={handleFavoriteClick}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Heart 
                  className={`h-5 w-5 transition-colors ${
                    isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'
                  }`} 
                />
              </button>
            )}
          </div>

          {/* 제목 */}
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 가격 정보 */}
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(property.price, property.deposit, property.monthly_rent)}
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-900">{property.address}</div>
              <div className="text-xs text-gray-500 line-clamp-2">{property.description || '상세 정보 문의'}</div>
            </div>
          </div>

          {/* 면적 및 건물 정보 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-medium">{property.area}㎡</div>
                <div className="text-xs text-gray-500">{property.floor}층</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-medium">{new Date(property.created_at).getFullYear()}년</div>
              <div className="text-xs text-gray-500">등록</div>
            </div>
          </div>

          {/* 편의시설 */}
          {property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 6).map((amenity) => (
                <Badge key={amenity} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{property.amenities.length - 6}개
                </Badge>
              )}
            </div>
          )}

          {/* 설명 */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {property.description}
          </p>

          {/* 하단 정보 */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{property.view_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{property.like_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(property.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              문의가능
            </div>
          </div>

          {/* 액션 버튼들 */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9"
                onClick={handleContactClick}
              >
                <Phone className="h-4 w-4 mr-1" />
                문의하기
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9"
                asChild
              >
                <Link href={`/properties/${property.id}`}>
                  자세히 보기
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}