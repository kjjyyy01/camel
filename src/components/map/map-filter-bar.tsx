"use client";

import { useState } from "react";
import { FilterIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { MapFilterOptions } from "@/types/property";
import Swal from "sweetalert2";

interface MapFilterBarProps {
  onFilterChange?: (filters: MapFilterOptions) => void;
  className?: string;
}

// 필터 옵션 정의
const PRICE_RANGE_OPTIONS: MultiSelectOption[] = [
  { value: "1억이하", label: "1억 이하" },
  { value: "1억-5억", label: "1억 - 5억" },
  { value: "5억-10억", label: "5억 - 10억" },
  { value: "10억-20억", label: "10억 - 20억" },
  { value: "20억이상", label: "20억 이상" },
];

const AREA_RANGE_OPTIONS: MultiSelectOption[] = [
  { value: "10평이하", label: "10평 이하" },
  { value: "10평-30평", label: "10평 - 30평" },
  { value: "30평-50평", label: "30평 - 50평" },
  { value: "50평-100평", label: "50평 - 100평" },
  { value: "100평이상", label: "100평 이상" },
];

const TRANSACTION_TYPE_OPTIONS: MultiSelectOption[] = [
  { value: "sale", label: "매매" },
  { value: "lease", label: "임대" },
  { value: "jeonse", label: "전세" },
  { value: "rent", label: "월세" },
  { value: "both", label: "매매/임대" },
];

const PROPERTY_TYPE_OPTIONS: MultiSelectOption[] = [
  { value: "office", label: "사무실" },
  { value: "retail", label: "상가" },
  { value: "building", label: "건물" },
  { value: "warehouse", label: "창고" },
  { value: "factory", label: "공장" },
];

const AMENITY_OPTIONS: MultiSelectOption[] = [
  { value: "엘리베이터", label: "엘리베이터" },
  { value: "주차장", label: "주차장" },
  { value: "에어컨", label: "에어컨" },
  { value: "인터넷", label: "인터넷" },
  { value: "CCTV", label: "CCTV" },
  { value: "회의실", label: "회의실" },
  { value: "화장실", label: "화장실" },
  { value: "보안시설", label: "보안시설" },
  { value: "소방시설", label: "소방시설" },
  { value: "무선인터넷", label: "무선인터넷" },
];

const SPECIAL_FEATURES_OPTIONS: MultiSelectOption[] = [
  { value: "급매", label: "급매" },
  { value: "큰길가", label: "큰길가" },
  { value: "역세권", label: "역세권" },
];

const FLOOR_RANGE_OPTIONS: MultiSelectOption[] = [
  { value: "저층(1-3층)", label: "저층(1-3층)" },
  { value: "중층(4-10층)", label: "중층(4-10층)" },
  { value: "고층(11층이상)", label: "고층(11층이상)" },
  { value: "지하층", label: "지하층" },
];

export function MapFilterBar({ onFilterChange, className }: MapFilterBarProps) {
  const [filters, setFilters] = useState<MapFilterOptions>({
    priceRange: [],
    areaRange: [],
    transactionType: [],
    propertyType: [],
    floorRange: [],
    amenities: [],
    specialFeature: [],
  });

  const updateFilter = (key: keyof MapFilterOptions, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const resetFilters = () => {
    const resetFilters: MapFilterOptions = {
      priceRange: [],
      areaRange: [],
      transactionType: [],
      propertyType: [],
      floorRange: [],
      amenities: [],
      specialFeature: [],
    };
    Swal.fire({
      title: "필터 초기화",
      text: "필터가 초기화되었습니다.",
      icon: "success",
    });
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  // 활성화된 필터 개수 계산
  const activeFilterCount = Object.entries(filters).filter(([, value]) => {
    return Array.isArray(value) && value.length > 0;
  }).length;

  return (
    <div className={`bg-white rounded-lg p-2 ${className}`}>
      <div className="flex items-center gap-2">
        {/* 헤더 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1">
            <FilterIcon className="h-4 w-4 text-gray-600" />
          </div>
          <span className="font-medium text-gray-900 text-sm">필터</span>

          {/* 초기화 버튼 - 항상 표시 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-gray-500 hover:text-gray-700 h-7 px-2"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            초기화
          </Button>
        </div>

        {/* 필터 옵션들 - 가로 배열 */}
        <div className="flex items-center gap-2 flex-1">
          {/* 가격대 */}
          <div className="w-[110px] flex-shrink-0">
            <MultiSelect
              options={PRICE_RANGE_OPTIONS}
              value={Array.isArray(filters.priceRange) ? filters.priceRange : []}
              onChange={(value) => updateFilter("priceRange", value)}
              placeholder="가격대"
              className="h-9 text-sm w-full min-w-0"
            />
          </div>

          {/* 평형별 */}
          <div className="w-[110px] flex-shrink-0">
            <MultiSelect
              options={AREA_RANGE_OPTIONS}
              value={Array.isArray(filters.areaRange) ? filters.areaRange : []}
              onChange={(value) => updateFilter("areaRange", value)}
              placeholder="평형별"
              className="h-9 text-sm w-full min-w-0"
            />
          </div>

          {/* 거래방식 */}
          <div className="w-[110px] flex-shrink-0">
            <MultiSelect
              options={TRANSACTION_TYPE_OPTIONS}
              value={Array.isArray(filters.transactionType) ? filters.transactionType : []}
              onChange={(value) => updateFilter("transactionType", value)}
              placeholder="거래방식"
              className="h-9 text-sm w-full min-w-0"
            />
          </div>

          {/* 매물유형 */}
          <div className="w-[110px] flex-shrink-0">
            <MultiSelect
              options={PROPERTY_TYPE_OPTIONS}
              value={Array.isArray(filters.propertyType) ? filters.propertyType : []}
              onChange={(value) => updateFilter("propertyType", value)}
              placeholder="매물유형"
              className="h-9 text-sm w-full min-w-0"
            />
          </div>

          {/* 편의시설 */}
          <div className="w-[110px] flex-shrink-0">
            <MultiSelect
              options={AMENITY_OPTIONS}
              value={Array.isArray(filters.amenities) ? filters.amenities : []}
              onChange={(value) => updateFilter("amenities", value)}
              placeholder="편의시설"
              className="h-9 text-sm w-full min-w-0"
            />
          </div>

          {/* 층수 */}
          <div className="w-[110px] flex-shrink-0">
            <MultiSelect
              options={FLOOR_RANGE_OPTIONS}
              value={Array.isArray(filters.floorRange) ? filters.floorRange : []}
              onChange={(value) => updateFilter("floorRange", value)}
              placeholder="층수"
              className="h-9 text-sm w-full min-w-0"
            />
          </div>

          {/* 기타 조건 */}
          <div className="w-[110px] flex-shrink-0">
            <MultiSelect
              options={SPECIAL_FEATURES_OPTIONS}
              value={Array.isArray(filters.specialFeature) ? filters.specialFeature : []}
              onChange={(value) => updateFilter("specialFeature", value)}
              placeholder="기타"
              className="h-9 text-sm w-full min-w-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
