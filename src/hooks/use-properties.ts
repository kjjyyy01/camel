import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { generateMockProperties } from '@/lib/utils/data-normalizer';
import { Property } from '@/types/property';

// Query Keys
export const propertiesKeys = {
  all: ['properties'] as const,
  filtered: (filters: PropertyFilters) => ['properties', 'filtered', filters] as const,
};

interface PropertyFilters {
  keyword?: string;
  location?: string;
  propertyType?: string;
  sortBy?: string;
}

/**
 * Mock 데이터를 비동기적으로 가져오는 함수 (실제 API 호출 시뮬레이션)
 */
const fetchProperties = async (): Promise<Property[]> => {
  // 실제 API 호출 시뮬레이션을 위한 지연
  await new Promise(resolve => setTimeout(resolve, 500));
  return generateMockProperties();
};

/**
 * 매물 목록을 조회하고 필터링하는 훅
 */
export function useProperties(filters: PropertyFilters = {}) {
  const { keyword = '', location = '', propertyType = 'all', sortBy = 'latest' } = filters;

  // 모든 매물 데이터 조회
  const { 
    data: allProperties = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: propertiesKeys.all,
    queryFn: fetchProperties,
    staleTime: 1000 * 60 * 10, // 10분
  });

  // 필터링 및 정렬 로직
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = [...allProperties];

    // 키워드 필터링
    if (keyword) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(keyword.toLowerCase()) ||
        property.description?.toLowerCase().includes(keyword.toLowerCase()) ||
        property.address.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // 위치 필터링
    if (location) {
      filtered = filtered.filter(property =>
        property.address.toLowerCase().includes(location.toLowerCase())
      );
    }

    // 매물 타입 필터링
    if (propertyType !== 'all') {
      filtered = filtered.filter(property =>
        property.type === propertyType
      );
    }

    // 중복 제거 (address 기준)
    const uniqueProperties = filtered.filter((property, index, self) => 
      index === self.findIndex(p => p.address === property.address)
    );

    // 정렬
    const sortedProperties = [...uniqueProperties].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          const priceA = a.price || a.deposit || a.monthly_rent || 0;
          const priceB = b.price || b.deposit || b.monthly_rent || 0;
          return priceA - priceB;
        case 'price-high':
          const priceA2 = a.price || a.deposit || a.monthly_rent || 0;
          const priceB2 = b.price || b.deposit || b.monthly_rent || 0;
          return priceB2 - priceA2;
        case 'area-large':
          return b.area - a.area;
        case 'area-small':
          return a.area - b.area;
        case 'latest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return sortedProperties;
  }, [allProperties, keyword, location, propertyType, sortBy]);

  return {
    properties: filteredAndSortedProperties,
    isLoading,
    error,
    totalCount: filteredAndSortedProperties.length,
  };
}