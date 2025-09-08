"use client"

import { useState, useEffect } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  // 초기 로드
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (error) {
        console.error('찜하기 목록 로드 실패:', error)
        setFavorites([])
      }
    }
  }, [])

  // 찜하기 추가/제거
  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => {
      let newFavorites: string[]
      
      if (prev.includes(propertyId)) {
        // 제거
        newFavorites = prev.filter(id => id !== propertyId)
      } else {
        // 추가
        newFavorites = [...prev, propertyId]
      }
      
      // 로컬스토리지에 저장
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      
      return newFavorites
    })
  }

  // 특정 매물이 찜하기에 있는지 확인
  const isFavorite = (propertyId: string) => {
    return favorites.includes(propertyId)
  }

  // 찜하기 목록 초기화
  const clearFavorites = () => {
    setFavorites([])
    localStorage.removeItem('favorites')
  }

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoriteCount: favorites.length
  }
}