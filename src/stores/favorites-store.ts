"use client"

import { create } from 'zustand'

interface FavoritesState {
  favorites: string[]
  toggleFavorite: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean
  clearFavorites: () => void
  initializeFavorites: () => void
  favoriteCount: number
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  favoriteCount: 0,

  initializeFavorites: () => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('favorites')
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites)
          set({ favorites: parsed, favoriteCount: parsed.length })
        } catch (error) {
          console.error('찜하기 목록 로드 실패:', error)
          set({ favorites: [], favoriteCount: 0 })
        }
      }
    }
  },

  toggleFavorite: (propertyId: string) => {
    const { favorites } = get()
    let newFavorites: string[]

    if (favorites.includes(propertyId)) {
      // 제거
      newFavorites = favorites.filter(id => id !== propertyId)
    } else {
      // 추가
      newFavorites = [...favorites, propertyId]
    }

    // 로컬스토리지에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
    }

    set({ favorites: newFavorites, favoriteCount: newFavorites.length })
  },

  isFavorite: (propertyId: string) => {
    const { favorites } = get()
    return favorites.includes(propertyId)
  },

  clearFavorites: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('favorites')
    }
    set({ favorites: [], favoriteCount: 0 })
  },
}))