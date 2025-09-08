"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Heart, User, Menu, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useFavorites } from '@/hooks/use-favorites'
import { useAuth } from '@/contexts/auth-context'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { favoriteCount } = useFavorites()
  const { user, signOut, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold">
            C
          </div>
          <span className="font-bold text-xl">Camel</span>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/map" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            지도 검색
          </Link>
          <Link 
            href="/properties" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            매물 목록
          </Link>
          <Link 
            href="/request" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            매물 의뢰
          </Link>
        </nav>

        {/* 우측 액션 버튼들 */}
        <div className="flex items-center space-x-2">
          {/* 검색 버튼 */}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Search className="h-4 w-4" />
          </Button>

          {/* 찜 목록 */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/favorites" className="relative">
              <Heart className="h-4 w-4" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favoriteCount > 99 ? '99+' : favoriteCount}
                </span>
              )}
              <span className="sr-only">찜 목록</span>
            </Link>
          </Button>

          {/* 로그인/마이페이지 */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  <span className="sr-only">사용자 메뉴</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm text-gray-500">
                  {user.user_metadata?.name || user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/mypage">마이페이지</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites">찜한 매물</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">
                <User className="h-4 w-4" />
                <span className="sr-only">로그인</span>
              </Link>
            </Button>
          )}

          {/* 모바일 메뉴 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">메뉴</span>
          </Button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            <Link 
              href="/map" 
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              지도 검색
            </Link>
            <Link 
              href="/properties" 
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              매물 목록
            </Link>
            <Link 
              href="/request" 
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              매물 의뢰
            </Link>
            <div className="pt-2 border-t">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                검색
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}