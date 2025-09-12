"use client";

import { useState, useEffect } from "react";
import { PropertyMap } from "@/components/map/property-map";
import { PropertyMarker } from "@/components/map/property-marker";
import { HorizontalFilterBar } from "@/components/common/horizontal-filter-bar";
import { generateMockProperties } from "@/lib/utils/data-normalizer";
import { applyFilters } from "@/lib/utils/property-filter";
import { Property, MapFilterOptions } from "@/types/property";
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

  const handleSearch = (params: SearchParams) => {
    setIsLoading(true);

    // Mock 데이터에서 검색 조건과 필터 적용
    const baseProperties = generateMockProperties();
    const filteredProperties = applyFilters(baseProperties, params, currentFilters);

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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 상단 헤더 - 통합 필터 바 */}
      <div className="bg-white shadow-sm border-b z-40 flex-shrink-0">
        <div className="container mx-auto py-3 px-4">
          <HorizontalFilterBar
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            showSearch={true}
            className="max-w-none"
            searchPlaceholder="지역, 매물 검색... (예: 강남 사무실, 서초 상가)"
          />
        </div>
      </div>

      {/* 메인 컨텐츠 영역 - 지도만 */}
      <div className="flex flex-1 overflow-hidden">
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
