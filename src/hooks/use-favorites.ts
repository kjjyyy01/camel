import { useEffect } from 'react';
import useLikesStore from '@/stores/likes-store';

/**
 * 찜한 매물 관리를 위한 커스텀 훅
 * 기존 useLikesStore를 래핑하여 favorites 네이밍으로 통일
 */
export function useFavorites() {
  const {
    likedProperties,
    isLiked,
    toggleLike,
    getLikedCount,
    getLikedProperties,
    clearAllLikes,
    isHydrated
  } = useLikesStore();

  // 클라이언트 사이드 하이드레이션 처리
  useEffect(() => {
    if (!isHydrated) {
      useLikesStore.persist.rehydrate();
    }
  }, [isHydrated]);

  return {
    // 찜한 매물 ID 배열 반환 (기존 코드 호환성을 위해)
    favorites: Array.from(likedProperties.keys()),
    
    // 찜한 매물 개수
    favoriteCount: getLikedCount(),
    
    // 찜한 매물 전체 데이터
    favoriteProperties: getLikedProperties(),
    
    // 특정 매물이 찜되어 있는지 확인
    isFavorite: isLiked,
    
    // 찜 토글 (기존 toggleLike와 동일)
    toggleFavorite: toggleLike,
    
    // 모든 찜 제거
    clearFavorites: clearAllLikes,
    
    // 하이드레이션 상태
    isHydrated,
  };
}