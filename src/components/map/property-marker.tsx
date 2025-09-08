"use client"

import { Property } from '@/types/property'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building, Eye, Heart } from 'lucide-react'

interface PropertyMarkerProps {
  property: Property
  onClick?: () => void
  className?: string
}

export function PropertyMarker({ property, onClick, className }: PropertyMarkerProps) {
  const formatPrice = (price: number | undefined, deposit: number | undefined, monthlyRent: number | undefined) => {
    if (property.transaction_type === 'sale' && price) {
      return `매매 ${price.toLocaleString()}만원`
    } else if (property.transaction_type === 'lease' && deposit) {
      return `전세 ${deposit.toLocaleString()}만원`
    } else if (property.transaction_type === 'lease' && monthlyRent) {
      const depositText = deposit ? `${deposit.toLocaleString()}` : '0'
      const rentText = monthlyRent ? `/${monthlyRent.toLocaleString()}` : '/0'
      return `월세 ${depositText}${rentText}만원`
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
      office: 'bg-blue-100 text-blue-800',
      retail: 'bg-red-100 text-red-800',
      building: 'bg-green-100 text-green-800',
      warehouse: 'bg-orange-100 text-orange-800',
      factory: 'bg-purple-100 text-purple-800'
    }
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card 
      className={`w-80 cursor-pointer hover:shadow-lg transition-shadow ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={getPropertyTypeBadgeColor(property.type)}>
                {getPropertyTypeLabel(property.type)}
              </Badge>
              <Badge variant="outline">
                {property.transaction_type === 'sale' ? '매매' : '전월세'}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {property.title}
            </h3>
          </div>
        </div>

        {/* 가격 */}
        <div className="text-xl font-bold text-primary mb-3">
          {formatPrice(property.price, property.deposit, property.monthly_rent)}
        </div>

        {/* 위치 */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.address}</span>
        </div>

        {/* 면적 및 건물 정보 */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-1" />
            <span>{property.area}㎡</span>
            <span className="ml-2">{property.floor}층</span>
          </div>
          {property.created_at && (
            <span>{new Date(property.created_at).getFullYear()}년</span>
          )}
        </div>

        {/* 편의시설 */}
        {property.amenities.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 4).map((amenity) => (
                <Badge key={amenity} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{property.amenities.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* 하단 정보 */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span>{property.view_count}</span>
            </div>
            <div className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              <span>{property.like_count}</span>
            </div>
          </div>
          <span>문의가능</span>
        </div>
      </CardContent>
    </Card>
  )
}