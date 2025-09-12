import { Property, MapFilterOptions, SpecialFeature } from '@/types/property';
import { SearchParams } from '@/types/search';

export function applyFilters(
  baseProperties: Property[], 
  searchParams?: Partial<SearchParams>, 
  customFilters?: MapFilterOptions
): Property[] {
  let filteredProperties = [...baseProperties];
  
  const filtersToUse = customFilters || {};

  // 검색 조건 적용
  if (searchParams?.keyword) {
    filteredProperties = filteredProperties.filter(
      (property) =>
        property.title.toLowerCase().includes(searchParams.keyword!.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchParams.keyword!.toLowerCase()) ||
        property.address.toLowerCase().includes(searchParams.keyword!.toLowerCase())
    );
  }

  if (searchParams?.location) {
    filteredProperties = filteredProperties.filter((property) =>
      property.address.toLowerCase().includes(searchParams.location!.toLowerCase())
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
}