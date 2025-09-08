"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Building } from "lucide-react";
import { KakaoMapApi } from "@/lib/api/kakao-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyType } from "@/types/property";

interface SearchBarProps {
  onSearch?: (params: SearchParams) => void;
  className?: string;
}

interface SearchParams {
  keyword: string;
  location: string;
  propertyType: PropertyType | "all";
}

const PROPERTY_TYPE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "office", label: "사무실" },
  { value: "retail", label: "상가" },
  { value: "building", label: "건물" },
] as const;

const POPULAR_LOCATIONS = [
  "강남구",
  "서초구",
  "마포구",
  "종로구",
  "중구",
  "영등포구",
  "용산구",
  "성동구",
  "광진구",
  "송파구",
];

export function SearchBar({ onSearch, className }: SearchBarProps) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType | "all">("all");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const kakaoMapApi = useRef(new KakaoMapApi());
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 위치 자동완성 검색
  const searchLocationSuggestions = async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const results = await kakaoMapApi.current.searchByKeyword(query, { size: 5 });
      const suggestions = results.map(result => result.place_name).slice(0, 5);
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.warn('위치 검색 실패:', error);
      setLocationSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // 위치 입력 처리
  const handleLocationChange = (value: string) => {
    setLocation(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocationSuggestions(value);
    }, 300);
  };

  const handleSearch = () => {
    const params: SearchParams = {
      keyword: keyword.trim(),
      location: location.trim(),
      propertyType,
    };

    onSearch?.(params);
    setShowLocationSuggestions(false);

    // 최근 검색어 저장 (로컬 스토리지)
    if (keyword.trim()) {
      const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      const newSearches = [keyword.trim(), ...recentSearches.filter((s: string) => s !== keyword.trim())].slice(0, 10);
      localStorage.setItem("recentSearches", JSON.stringify(newSearches));
    }
  };

  // 정리 함수
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 자동완성 목록 결합 (카카오 API + 인기 지역)
  const getLocationSuggestions = () => {
    const filteredPopular = POPULAR_LOCATIONS.filter((loc) => 
      loc.toLowerCase().includes(location.toLowerCase())
    );
    
    // 카카오 API 결과와 인기 지역 합치기 (중복 제거)
    const allSuggestions = [...locationSuggestions, ...filteredPopular];
    const uniqueSuggestions = Array.from(new Set(allSuggestions));
    
    return uniqueSuggestions.slice(0, 8); // 최대 8개
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="flex flex-col md:flex-row gap-2 p-4 bg-white rounded-lg shadow-lg border">
        {/* 키워드 검색 */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="원하는 매물을 검색하세요 (예: 강남역 오피스텔)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* 지역 선택 */}
        <div className="relative md:w-48">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <Input
              placeholder="지역을 입력하세요"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => setShowLocationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
              onKeyDown={handleKeyPress}
              className="pl-10 h-12"
            />
          </div>

          {/* 지역 자동완성 */}
          {showLocationSuggestions && (getLocationSuggestions().length > 0 || isLoadingSuggestions) && (
            <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-50 mt-1">
              {isLoadingSuggestions && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  검색 중...
                </div>
              )}
              {getLocationSuggestions().map((loc, index) => (
                <button
                  key={`${loc}-${index}`}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                  onClick={() => {
                    setLocation(loc);
                    setShowLocationSuggestions(false);
                  }}
                >
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                    {loc}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 매물 유형 선택 */}
        <div className="md:w-36">
          <Select value={propertyType} onValueChange={(value) => setPropertyType(value as PropertyType | "all")}>
            <SelectTrigger className="h-12 min-h-12">
              <Building className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 검색 버튼 */}
        <Button onClick={handleSearch} className="h-12 px-8 bg-primary hover:bg-primary/90">
          검색
        </Button>
      </div>
    </div>
  );
}
