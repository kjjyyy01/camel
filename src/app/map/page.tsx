"use client";

import { useState, useEffect } from "react";
import { PropertyMap } from "@/components/map/property-map";
import { PropertyMarker } from "@/components/map/property-marker";
import { SearchBar } from "@/components/search/search-bar";
import { generateMockProperties } from "@/lib/utils/data-normalizer";
import { Property } from "@/types/property";

interface SearchParams {
  keyword: string;
  location: string;
  propertyType: string;
}

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    
    // Mock 데이터에서 검색 조건 적용
    let filteredProperties = generateMockProperties();

    if (params.keyword) {
      filteredProperties = filteredProperties.filter(
        (property) =>
          property.title.toLowerCase().includes(params.keyword.toLowerCase()) ||
          property.description?.toLowerCase().includes(params.keyword.toLowerCase()) ||
          property.address.toLowerCase().includes(params.keyword.toLowerCase())
      );
    }

    if (params.location) {
      filteredProperties = filteredProperties.filter((property) =>
        property.address.toLowerCase().includes(params.location.toLowerCase())
      );
    }

    if (params.propertyType !== "all") {
      filteredProperties = filteredProperties.filter((property) => property.type === params.propertyType);
    }

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
      {/* 상단 검색바 */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-40">
        <div className="container mx-auto py-4 px-4">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* 지도 및 매물 정보 */}
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
          <div className="w-96 bg-white border-l shadow-lg overflow-y-auto">
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
