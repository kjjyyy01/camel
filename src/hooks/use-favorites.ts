"use client"

import { useEffect } from 'react'
import { useFavoritesStore } from '@/stores/favorites-store'

export function useFavorites() {
  const {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoriteCount,
    initializeFavorites
  } = useFavoritesStore()

  // 초기 로드
  useEffect(() => {
    initializeFavorites()
  }, [initializeFavorites])

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoriteCount
  }
}