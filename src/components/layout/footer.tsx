import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* 메인 푸터 콘텐츠 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-sm">
                C
              </div>
              <span className="font-bold text-lg">Camel</span>
            </div>
            <p className="text-sm text-muted-foreground">
              상업용 부동산 전문 플랫폼<br />
              사무실, 상가, 건물 임대의 모든 것
            </p>
          </div>

          {/* 서비스 */}
          <div className="space-y-4">
            <h3 className="font-semibold">서비스</h3>
            <nav className="space-y-2">
              <Link 
                href="/map" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                지도 검색
              </Link>
              <Link 
                href="/properties" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                매물 목록
              </Link>
              <Link 
                href="/request" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                매물 의뢰
              </Link>
              <Link 
                href="/favorites" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                찜 목록
              </Link>
            </nav>
          </div>

          {/* 고객 지원 */}
          <div className="space-y-4">
            <h3 className="font-semibold">고객 지원</h3>
            <nav className="space-y-2">
              <Link 
                href="/request" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                문의하기
              </Link>
            </nav>
          </div>

          {/* 연락처 정보 */}
          <div className="space-y-4">
            <h3 className="font-semibold">연락처</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>고객센터: 1588-0000</div>
              <div>평일 09:00~18:00</div>
              <div>토요일 09:00~13:00</div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* 하단 정보 */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2025 Camel. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>고객센터: 1588-0000</span>
            <Separator orientation="vertical" className="h-4" />
            <span>평일 09:00~18:00</span>
          </div>
        </div>
      </div>
    </footer>
  )
}