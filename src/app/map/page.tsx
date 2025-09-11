"use client";

import { useState, useEffect } from "react";
import { PropertyMap } from "@/components/map/property-map";
import { PropertyMarker } from "@/components/map/property-marker";
import { UnifiedSearchBar } from "@/components/search/unified-search-bar";
import { MapFilterBar } from "@/components/map/map-filter-bar";
import { generateMockProperties } from "@/lib/utils/data-normalizer";
import { Property, MapFilterOptions, SpecialFeature } from "@/types/property";
import { SearchParams } from "@/types/search";

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<MapFilterOptions>({});

  // 초기 매물 데이터 로드
  useEffect(() => {
    const loadProperties = () => {
      setIsLoading(true);
      const mockProperties = generateMockProperties();
      setProperties(mockProperties);
      setIsLoading(false);
    };

    loadProperties();
  }, []);

  const applyFilters = (baseProperties: Property[], searchParams?: SearchParams, customFilters?: MapFilterOptions) => {
    let filteredProperties = [...baseProperties];
    
    // 사용할 필터: 커스텀 필터가 있으면 사용, 없으면 현재 필터 사용
    const filtersToUse = customFilters || currentFilters;

    // 검색 조건 적용
    if (searchParams?.keyword) {
      filteredProperties = filteredProperties.filter(
        (property) =>
          property.title.toLowerCase().includes(searchParams.keyword.toLowerCase()) ||
          property.description?.toLowerCase().includes(searchParams.keyword.toLowerCase()) ||
          property.address.toLowerCase().includes(searchParams.keyword.toLowerCase())
      );
    }

    if (searchParams?.location) {
      filteredProperties = filteredProperties.filter((property) =>
        property.address.toLowerCase().includes(searchParams.location.toLowerCase())
      );
    }

    // 가격대 필터 적용
    if (filtersToUse.priceRange && Array.isArray(filtersToUse.priceRange) && filtersToUse.priceRange.length > 0) {
      filteredProperties = filteredProperties.filter((property) => {
        const price = property.price;
        return (filtersToUse.priceRange as string[]).some((range: string) => {
          switch (range) {
            case "1억이하":
              return price <= 100000000;
            case "1억-5억":
              return price > 100000000 && price <= 500000000;
            case "5억-10억":
              return price > 500000000 && price <= 1000000000;
            case "10억-20억":
              return price > 1000000000 && price <= 2000000000;
            case "20억이상":
              return price > 2000000000;
            default:
              return false;
          }
        });
      });
    } else if (filtersToUse.priceRange && typeof filtersToUse.priceRange === 'string' && filtersToUse.priceRange !== "all") {
      filteredProperties = filteredProperties.filter((property) => {
        const price = property.price;
        switch (filtersToUse.priceRange) {
          case "1억이하":
            return price <= 100000000;
          case "1억-5억":
            return price > 100000000 && price <= 500000000;
          case "5억-10억":
            return price > 500000000 && price <= 1000000000;
          case "10억-20억":
            return price > 1000000000 && price <= 2000000000;
          case "20억이상":
            return price > 2000000000;
          default:
            return true;
        }
      });
    }

    // 면적 필터 적용
    if (filtersToUse.areaRange && Array.isArray(filtersToUse.areaRange) && filtersToUse.areaRange.length > 0) {
      filteredProperties = filteredProperties.filter((property) => {
        const area = property.area;
        return (filtersToUse.areaRange as string[]).some((range: string) => {
          switch (range) {
            case "10평이하":
              return area <= 33; // 10평 = 약 33㎡
            case "10평-30평":
              return area > 33 && area <= 99;
            case "30평-50평":
              return area > 99 && area <= 165;
            case "50평-100평":
              return area > 165 && area <= 330;
            case "100평이상":
              return area > 330;
            default:
              return false;
          }
        });
      });
    } else if (filtersToUse.areaRange && typeof filtersToUse.areaRange === 'string' && filtersToUse.areaRange !== "all") {
      filteredProperties = filteredProperties.filter((property) => {
        const area = property.area;
        switch (filtersToUse.areaRange) {
          case "10평이하":
            return area <= 33; // 10평 = 약 33㎡
          case "10평-30평":
            return area > 33 && area <= 99;
          case "30평-50평":
            return area > 99 && area <= 165;
          case "50평-100평":
            return area > 165 && area <= 330;
          case "100평이상":
            return area > 330;
          default:
            return true;
        }
      });
    }

    if (filtersToUse.transactionType && Array.isArray(filtersToUse.transactionType) && filtersToUse.transactionType.length > 0) {
      filteredProperties = filteredProperties.filter((property) => 
        filtersToUse.transactionType!.includes(property.transaction_type)
      );
    } else if (filtersToUse.transactionType && typeof filtersToUse.transactionType === 'string' && filtersToUse.transactionType !== "all") {
      filteredProperties = filteredProperties.filter(
        (property) => property.transaction_type === filtersToUse.transactionType
      );
    }

    if (filtersToUse.propertyType && Array.isArray(filtersToUse.propertyType) && filtersToUse.propertyType.length > 0) {
      filteredProperties = filteredProperties.filter((property) => 
        filtersToUse.propertyType!.includes(property.type)
      );
    } else if (filtersToUse.propertyType && typeof filtersToUse.propertyType === 'string' && filtersToUse.propertyType !== "all") {
      filteredProperties = filteredProperties.filter((property) => property.type === filtersToUse.propertyType);
    }

    // 층수 필터 적용
    if (filtersToUse.floorRange && Array.isArray(filtersToUse.floorRange) && filtersToUse.floorRange.length > 0) {
      filteredProperties = filteredProperties.filter((property) => {
        const floor = property.floor;
        return (filtersToUse.floorRange as string[]).some((range: string) => {
          switch (range) {
            case "저층(1-3층)":
              return floor >= 1 && floor <= 3;
            case "중층(4-10층)":
              return floor >= 4 && floor <= 10;
            case "고층(11층이상)":
              return floor >= 11;
            case "지하층":
              return floor < 1;
            default:
              return false;
          }
        });
      });
    } else if (filtersToUse.floorRange && typeof filtersToUse.floorRange === 'string' && filtersToUse.floorRange !== "all") {
      filteredProperties = filteredProperties.filter((property) => {
        const floor = property.floor;
        switch (filtersToUse.floorRange) {
          case "저층(1-3층)":
            return floor >= 1 && floor <= 3;
          case "중층(4-10층)":
            return floor >= 4 && floor <= 10;
          case "고층(11층이상)":
            return floor >= 11;
          case "지하층":
            return floor < 1;
          default:
            return true;
        }
      });
    }

    // 편의시설 필터 적용
    if (filtersToUse.amenities && Array.isArray(filtersToUse.amenities) && filtersToUse.amenities.length > 0) {
      filteredProperties = filteredProperties.filter((property) => {
        if (!property.amenities || property.amenities.length === 0) return false;
        return (filtersToUse.amenities as string[]).some(amenity => 
          property.amenities.includes(amenity)
        );
      });
    }

    // 기타 조건 필터링 (specialFeature)
    if (filtersToUse.specialFeature && Array.isArray(filtersToUse.specialFeature) && filtersToUse.specialFeature.length > 0) {
      filteredProperties = filteredProperties.filter((property) => {
        if (!property.special_features || property.special_features.length === 0) return false;
        return (filtersToUse.specialFeature as string[]).some(feature => 
          property.special_features!.includes(feature as SpecialFeature)
        );
      });
    } else if (filtersToUse.specialFeature && typeof filtersToUse.specialFeature === 'string' && filtersToUse.specialFeature !== "all") {
      filteredProperties = filteredProperties.filter((property) => 
        property.special_features?.includes(filtersToUse.specialFeature as SpecialFeature)
      );
    }

    return filteredProperties;
  };

  const handleSearch = (params: SearchParams) => {
    setIsLoading(true);

    // Mock 데이터에서 검색 조건과 필터 적용
    const baseProperties = generateMockProperties();
    const filteredProperties = applyFilters(baseProperties, params);

    setProperties(filteredProperties);
    setIsLoading(false);
  };

  const handleFilterChange = (newFilters: MapFilterOptions) => {
    setCurrentFilters(newFilters);
    setIsLoading(true);

    // 현재 검색 조건은 유지하고 필터만 다시 적용 (새로운 필터를 직접 전달)
    const baseProperties = generateMockProperties();
    const filteredProperties = applyFilters(baseProperties, undefined, newFilters);

    setProperties(filteredProperties);
    setIsLoading(false);
  };

  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property);
  };

  const handlePropertyClick = () => {
    if (selectedProperty) {
      window.location.href = `/properties/${selectedProperty.id}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 - 필터와 검색바 나란히 배치 */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-40">
        <div className="container mx-auto py-1 px-4">
          <div className="flex items-center justify-center gap-4">
            {/* 좌측 필터 영역 - 컴팩트 버전 */}
            <div className="flex-1">
              <MapFilterBar onFilterChange={handleFilterChange} className="h-auto" />
            </div>

            {/* 우측 통합 검색바 */}
            <div className="w-96 flex-shrink-0">
              <UnifiedSearchBar onSearch={handleSearch} className="max-w-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 - 지도만 */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* 지도 영역 */}
        <div className="flex-1 relative">
          <PropertyMap properties={properties} onMarkerClick={handleMarkerClick} className="w-full h-full" />

          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <div className="mt-2 text-gray-600">매물 검색 중...</div>
              </div>
            </div>
          )}
        </div>

        {/* 매물 상세 정보 패널 */}
        {selectedProperty && (
          <div className="w-96 bg-white border-l shadow-lg overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">매물 정보</h2>
                <button onClick={() => setSelectedProperty(null)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <PropertyMarker
                property={selectedProperty}
                onClick={handlePropertyClick}
                className="w-full shadow-none border-0"
              />

              {/* 추가 정보 */}
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">상세 설명</h3>
                  <p className="text-sm text-gray-600">{selectedProperty.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">담당자 정보</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>이름: 부동산 담당자</div>
                    <div>연락처: 문의 필요</div>
                    <div>소속: Camel 부동산</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
