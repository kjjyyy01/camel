"use client"

import { SearchBar } from '@/components/search/search-bar'
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
    <section 
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
      }}
    >
      <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col justify-center min-h-screen">
        {/* 상단 서브 헤드라인 */}
        <div className="text-center mb-8">
          <p className="text-white/90 text-lg md:text-xl font-medium tracking-wide">
            No.1 OFFICE SOLUTION - CAMEL
          </p>
        </div>

        {/* 메인 헤드라인 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            카멜은 고객님의 조건에 맞는
            <br />
            <span className="text-yellow-400">사무실 · 상가</span>를 찾아드려요
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-2xl mx-auto">
            아직도 사무실, 상가 구하실 때 일일이 찾으시나요?
          </p>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            부담없이 편하게 문의하세요
          </p>
        </div>

        {/* 검색바 */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} className="max-w-4xl mx-auto" />
        </div>

        {/* 하단 설명 */}
        <div className="text-center">
          <p className="text-white/80 text-base md:text-lg max-w-3xl mx-auto">
            카멜은 고객중심의 빌딩매매/관리/임대업무/기업컨설팅을
            <br />
            전문으로 하는 종합부동산 기업입니다.
          </p>
        </div>
      </div>
    </section>
  )
}