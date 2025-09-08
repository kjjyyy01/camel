"use client"

import { useState, useEffect } from 'react'
import { Property } from '@/types/property'
import { generateMockProperties } from '@/lib/utils/data-normalizer'
import { useFavorites } from '@/hooks/use-favorites'
import { PropertyCard } from '@/components/property/property-card'
import { Button } from '@/components/ui/button'
import { Heart, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function FavoritesPage() {
  const router = useRouter()
  const { favorites, clearFavorites, favoriteCount } = useFavorites()
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFavoriteProperties = async () => {
      try {
        setIsLoading(true)
        
        if (favorites.length === 0) {
          setFavoriteProperties([])
          return
        }

        // TODO: 실제 API에서 찜한 매물들 가져오기
        // 현재는 Mock 데이터에서 찾기
        const mockProperties = generateMockProperties()
        const favoriteProps = mockProperties.filter(property => 
          favorites.includes(property.id)
        )
        
        setFavoriteProperties(favoriteProps)
      } catch (error) {
        console.error('찜한 매물 로드 실패:', error)
        setFavoriteProperties([])
      } finally {
        setIsLoading(false)
      }
    }

    loadFavoriteProperties()
  }, [favorites])

  const handleClearAll = () => {
    if (window.confirm('모든 찜한 매물을 삭제하시겠습니까?')) {
      clearFavorites()
    }
  }

  const handleContactClick = (property: Property) => {
    // TODO: 문의하기 기능 구현
    alert(`${property.title}에 대한 문의를 시작합니다.`)
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-96 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 빈 상태
  if (favoriteCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white border-b sticky top-16 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  돌아가기
                </Button>
                <div className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-red-500" />
                  <h1 className="text-2xl font-bold">찜한 매물</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 빈 상태 */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              찜한 매물이 없습니다
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              마음에 드는 매물을 찜해보세요.<br />
              나중에 쉽게 다시 찾아볼 수 있어요.
            </p>
            <div className="space-y-3">
              <Button asChild size="lg" className="w-full">
                <Link href="/properties">
                  매물 둘러보기
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/map">
                  지도에서 찾기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                돌아가기
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500 fill-current" />
                <h1 className="text-2xl font-bold">찜한 매물</h1>
                <span className="text-lg text-gray-500">({favoriteCount}개)</span>
              </div>
            </div>
            
            {favoriteCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                전체 삭제
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 찜한 매물 목록 */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            총 <span className="font-semibold text-gray-900">{favoriteCount}개</span>의 매물을 찜했습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onContactClick={handleContactClick}
              showActions={true}
            />
          ))}
        </div>

        {/* 더 많은 매물 찾기 */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-8 border">
            <h3 className="text-xl font-semibold mb-4">더 많은 매물을 찾아보세요</h3>
            <p className="text-gray-600 mb-6">
              다양한 조건으로 원하는 매물을 찾아보실 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/properties">
                  매물 목록 보기
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/map">
                  지도에서 검색
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}