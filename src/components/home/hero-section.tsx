"use client"

import { SearchBar } from '@/components/search/search-bar'
import { Button } from '@/components/ui/button'
import { MapIcon, ListIcon, Building2, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SearchParams {
  keyword: string
  location: string
  propertyType: string
}

export function HeroSection() {
  const router = useRouter()

  const handleSearch = (params: SearchParams) => {
    // URL 쿼리 파라미터로 검색 조건 전달
    const searchParams = new URLSearchParams()
    
    if (params.keyword) searchParams.set('keyword', params.keyword)
    if (params.location) searchParams.set('location', params.location)
    if (params.propertyType !== 'all') searchParams.set('type', params.propertyType)
    
    // 검색 결과를 매물 목록 페이지에서 표시
    router.push(`/properties?${searchParams.toString()}`)
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* 메인 헤드라인 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            상업용 부동산의
            <span className="text-primary block">모든 것</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            사무실, 상가, 건물 임대를 위한 전문 플랫폼
            <br />
            <span className="text-lg">카카오 지도 기반으로 더 쉽고 정확하게</span>
          </p>
        </div>

        {/* 검색바 */}
        <SearchBar onSearch={handleSearch} className="mb-12" />

        {/* 빠른 액세스 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button asChild size="lg" variant="default" className="h-14 px-8">
            <Link href="/map">
              <MapIcon className="mr-2 h-5 w-5" />
              지도에서 찾기
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 px-8">
            <Link href="/properties">
              <ListIcon className="mr-2 h-5 w-5" />
              목록으로 보기
            </Link>
          </Button>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white/70 rounded-lg backdrop-blur-sm">
            <div className="flex justify-center mb-3">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">10,000+</div>
            <div className="text-gray-600">등록 매물</div>
          </div>
          
          <div className="text-center p-6 bg-white/70 rounded-lg backdrop-blur-sm">
            <div className="flex justify-center mb-3">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">5,000+</div>
            <div className="text-gray-600">만족한 고객</div>
          </div>
          
          <div className="text-center p-6 bg-white/70 rounded-lg backdrop-blur-sm">
            <div className="flex justify-center mb-3">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">98%</div>
            <div className="text-gray-600">성공 계약률</div>
          </div>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-blue-200/20 rounded-full blur-xl"></div>
      </div>
    </section>
  )
}