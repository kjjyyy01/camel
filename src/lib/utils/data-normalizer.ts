import { Property, PropertyType, TransactionType, PropertyStatus, SpecialFeature } from "@/types/property";

// Mock 데이터 생성용 타입 정의
interface MockPropertyItem {
  serialNumber?: string;
  transactionNumber?: string;
  buildingType?: string;
  usage?: string;
  transactionCategory?: string;
  contractType?: string;
  detailedAddress?: string;
  latitude?: string;
  longitude?: string;
  transactionAmount?: string;
  salePrice?: string;
  price?: number;
  deposit?: string;
  jeonseAmount?: string;
  monthlyRent?: string;
  rentalFee?: string;
  area?: string;
  exclusiveArea?: string;
  floor?: string;
  targetFloor?: string;
  totalFloors?: string;
  city?: string;
  district?: string;
  gu?: string;
  legalDong?: string;
  dong?: string;
  landNumber?: string;
  constructionYear?: string;
  elevator?: string | boolean;
  parkingAvailable?: string | boolean;
  airConditioner?: string | boolean;
  restroom?: string | boolean;
  internet?: string | boolean;
}

/**
 * Mock 데이터를 표준 Property 형식으로 변환
 */
export class DataNormalizer {
  /**
   * Mock 상업용 부동산 데이터 정규화
   */
  static normalizeCommercialProperty(item: MockPropertyItem): Property {
    return {
      id: this.generatePropertyId(item),
      type: this.mapToPropertyType(item.buildingType || item.usage || ""),
      transaction_type: this.mapToTransactionType(item.transactionCategory || item.contractType || ""),
      title: this.generateTitle(item),
      address: this.normalizeAddress(item),
      detailed_address: item.detailedAddress,
      latitude: parseFloat(item.latitude || "37.5665") || 37.5665,
      longitude: parseFloat(item.longitude || "126.978") || 126.978,
      price: this.normalizePrice(item),
      deposit: this.normalizeDeposit(item),
      monthly_rent: this.normalizeMonthlyRent(item),
      area: this.normalizeArea(item.area || item.exclusiveArea),
      floor: parseInt(item.floor || item.targetFloor || "1") || 1,
      total_floors: parseInt(item.totalFloors || "1") || 1,
      description: this.generateDescription(item),
      images: [],
      amenities: this.normalizeAmenities(item),
      status: "available" as PropertyStatus,
      view_count: Math.floor(Math.random() * 100),
      like_count: Math.floor(Math.random() * 20),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Mock 데이터 생성
   */
  private static generatePropertyId(item: MockPropertyItem): string {
    const base = item.serialNumber || item.transactionNumber || Math.random().toString(36);
    return `prop_${base.toString().replace(/[^a-zA-Z0-9]/g, "")}_${Date.now()}`;
  }

  private static generateTitle(item: MockPropertyItem): string {
    const type = this.mapToPropertyType(item.buildingType || item.usage || "");
    const area = this.normalizeArea(item.area || item.exclusiveArea);
    const location = item.legalDong || item.dong || "서울";

    const typeNames = {
      office: "사무실",
      retail: "상가",
      building: "건물",
      warehouse: "창고",
      factory: "공장",
    };

    return `${location} ${typeNames[type as keyof typeof typeNames] || "상업용"} ${area}㎡`;
  }

  private static generateDescription(item: MockPropertyItem): string {
    const parts = [];

    if (item.floor) parts.push(`${item.floor}층`);
    if (item.area || item.exclusiveArea) parts.push(`${this.normalizeArea(item.area || item.exclusiveArea)}㎡`);
    if (item.constructionYear) parts.push(`${item.constructionYear}년 건축`);

    return parts.length > 0 ? parts.join(" · ") : "상세 정보는 문의해주세요.";
  }

  private static normalizeAddress(item: MockPropertyItem): string {
    const parts = [item.city || "서울특별시", item.district || item.gu, item.legalDong || item.dong, item.landNumber].filter(
      Boolean
    );

    return parts.join(" ");
  }

  private static mapToPropertyType(buildingType: string): PropertyType {
    if (!buildingType) return "office";

    const type = buildingType.toLowerCase();

    if (type.includes("사무") || type.includes("오피스") || type.includes("office")) return "office";
    if (type.includes("상가") || type.includes("상업") || type.includes("retail")) return "retail";
    if (type.includes("건물") || type.includes("빌딩") || type.includes("building")) return "building";
    if (type.includes("창고") || type.includes("warehouse")) return "warehouse";
    if (type.includes("공장") || type.includes("factory")) return "factory";

    return "office";
  }

  private static mapToTransactionType(transactionType: string): TransactionType {
    if (!transactionType) return "lease";

    const type = transactionType.toLowerCase();

    if (type.includes("매매") || type.includes("sale")) return "sale";
    if (type.includes("전세") || type.includes("월세") || type.includes("임대") || type.includes("lease"))
      return "lease";

    return "lease";
  }

  /**
   * 가격 정규화
   */
  private static normalizePrice(item: MockPropertyItem): number {
    const salePrice = item.transactionAmount || item.salePrice || item.price || 0;
    return salePrice ? this.parsePrice(salePrice) : 0;
  }

  /**
   * 보증금 정규화
   */
  private static normalizeDeposit(item: MockPropertyItem): number | undefined {
    const deposit = item.deposit || item.jeonseAmount || 0;
    return deposit ? this.parsePrice(deposit) : undefined;
  }

  /**
   * 월세 정규화
   */
  private static normalizeMonthlyRent(item: MockPropertyItem): number | undefined {
    const rent = item.monthlyRent || item.rentalFee || 0;
    return rent ? this.parsePrice(rent) : undefined;
  }

  /**
   * 면적 정규화 (㎡ 단위)
   */
  private static normalizeArea(area: string | number | undefined): number {
    if (!area) return 0;

    let numericArea = parseFloat(area.toString().replace(/[^\d.]/g, ""));

    if (numericArea > 1000) {
      // 평수로 보이는 경우 ㎡로 변환 (1평 = 3.3㎡)
      numericArea = numericArea * 3.3;
    }

    return Math.round(numericArea * 100) / 100;
  }

  /**
   * 편의시설 정규화
   */
  private static normalizeAmenities(item: MockPropertyItem): string[] {
    const amenities: string[] = [];

    if (this.normalizeBoolean(item.elevator)) amenities.push("엘리베이터");
    if (this.normalizeBoolean(item.parkingAvailable)) amenities.push("주차장");
    if (this.normalizeBoolean(item.airConditioner)) amenities.push("에어컨");
    if (this.normalizeBoolean(item.restroom)) amenities.push("화장실");
    if (this.normalizeBoolean(item.internet)) amenities.push("인터넷");

    return amenities;
  }

  /**
   * Boolean 값 정규화
   */
  private static normalizeBoolean(value: string | boolean | undefined): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const lowerValue = value.toLowerCase();
      return lowerValue === "true" || lowerValue === "있음" || lowerValue === "가능" || lowerValue === "y";
    }
    return false;
  }

  /**
   * 가격 문자열을 숫자로 변환 (만원 단위)
   */
  private static parsePrice(price: string | number): number {
    if (typeof price === "number") return price;

    const priceStr = price.toString().replace(/[^\d]/g, "");
    const numericPrice = parseInt(priceStr) || 0;

    // 만원 단위로 가정
    return numericPrice * 10000;
  }
}


// 시드 기반 난수 생성 함수 (일관된 결과를 위해)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Mock 매물 데이터 생성 (캐시됨)
 */
export function generateMockProperties(count = 20): Property[] {
  // 개발 중에는 매번 새로운 데이터로 생성 (가격 수정 반영)
  // if (cachedMockProperties) {
  //   return cachedMockProperties.slice(0, count);
  // }

  const properties: Property[] = [];

  const types: PropertyType[] = ["office", "retail", "building", "warehouse", "factory"];
  const transactionTypes: TransactionType[] = ["sale", "lease"];
  const areas = [
    { name: "강남구", lat: 37.5175896, lng: 127.0467972 },
    { name: "서초구", lat: 37.4836236, lng: 127.0327667 },
    { name: "마포구", lat: 37.5589584, lng: 126.9089841 },
    { name: "용산구", lat: 37.5322295, lng: 126.9909697 },
    { name: "종로구", lat: 37.5735884, lng: 126.9794068 },
  ];

  for (let i = 0; i < count; i++) {
    // 시드 기반으로 일관된 난수 생성
    const area = areas[Math.floor(seededRandom(i + 1) * areas.length)];
    const type = types[Math.floor(seededRandom(i + 10) * types.length)];
    const transactionType = transactionTypes[Math.floor(seededRandom(i + 20) * transactionTypes.length)];
    const buildingArea = Math.floor(seededRandom(i + 30) * 500) + 50;
    const floor = Math.floor(seededRandom(i + 40) * 20) + 1;

    properties.push({
      id: `mock_${i}`,
      type,
      transaction_type: transactionType,
      title: `${area.name} ${getTypeNameKorean(type)} ${buildingArea}㎡`,
      address: `서울특별시 ${area.name} ${Math.floor(seededRandom(i + 50) * 999) + 1}번지`,
      detailed_address: `${floor}층`,
      latitude: area.lat + (seededRandom(i + 60) - 0.5) * 0.01,
      longitude: area.lng + (seededRandom(i + 70) - 0.5) * 0.01,
      price: transactionType === "sale" ? Math.floor(seededRandom(i + 80) * 500000) + 50000 : 0,
      deposit: transactionType === "lease" ? Math.floor(seededRandom(i + 90) * 50000) + 5000 : undefined,
      monthly_rent: transactionType === "lease" ? Math.floor(seededRandom(i + 100) * 1000) + 100 : undefined,
      area: buildingArea,
      floor,
      total_floors: floor + Math.floor(seededRandom(i + 110) * 10) + 1,
      description: `깔끔하고 현대적인 ${getTypeNameKorean(type)}입니다. 교통이 편리하고 주변 상권이 발달되어 있습니다.`,
      images: generatePropertyImages(type, i),
      amenities: generateRandomAmenities(i + 120),
      status: "available",
      special_features: generateSpecialFeatures(i + 150),
      view_count: Math.floor(seededRandom(i + 130) * 1000),
      like_count: Math.floor(seededRandom(i + 140) * 100),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }


  return properties.slice(0, count);
}

/**
 * Mock 데이터 캐시 초기화 (테스트나 개발용)
 */
export function clearMockPropertiesCache() {
  // 캐시가 제거되었으므로 빈 함수로 유지
}

function getTypeNameKorean(type: PropertyType): string {
  const names = {
    office: "사무실",
    retail: "상가",
    building: "건물",
    warehouse: "창고",
    factory: "공장",
  };
  return names[type] || "상업용";
}

/**
 * 특수 조건 랜덤 생성
 */
function generateSpecialFeatures(seed: number): SpecialFeature[] {
  const allFeatures: SpecialFeature[] = ['급매', '큰길가', '역세권'];
  const selectedFeatures: SpecialFeature[] = [];
  
  // 각 특수 조건별로 확률 설정
  const featureProbabilities = {
    '급매': 0.15,  // 15% 확률
    '큰길가': 0.25, // 25% 확률  
    '역세권': 0.30  // 30% 확률
  };
  
  allFeatures.forEach((feature, index) => {
    if (seededRandom(seed + index + 100) < featureProbabilities[feature]) {
      selectedFeatures.push(feature);
    }
  });
  
  return selectedFeatures;
}

/**
 * 편의시설 랜덤 생성
 */
function generateRandomAmenities(seed: number): string[] {
  const allAmenities = [
    '엘리베이터', '주차장', '에어컨', '화장실', '인터넷',
    '보안시설', 'CCTV', '소방시설', '비상구',
    '카페테리아', '회의실', '라운지', '복합기', '프린터',
    '무선인터넷', '전용화장실', '공용화장실'
  ];
  
  const amenityCount = Math.floor(seededRandom(seed) * 6) + 2; // 2-7개
  const selectedAmenities: string[] = [];
  
  // 기본 편의시설은 높은 확률로 포함
  const basicAmenities = ['엘리베이터', '주차장', '화장실', '인터넷'];
  basicAmenities.forEach((amenity, index) => {
    if (seededRandom(seed + index + 100) > 0.3) { // 70% 확률
      selectedAmenities.push(amenity);
    }
  });
  
  // 추가 편의시설 랜덤 선택
  const remainingAmenities = allAmenities.filter(a => !selectedAmenities.includes(a));
  for (let i = 0; i < Math.min(amenityCount - selectedAmenities.length, remainingAmenities.length); i++) {
    const randomIndex = Math.floor(seededRandom(seed + i + 200) * remainingAmenities.length);
    const selectedAmenity = remainingAmenities[randomIndex];
    if (!selectedAmenities.includes(selectedAmenity)) {
      selectedAmenities.push(selectedAmenity);
      remainingAmenities.splice(randomIndex, 1);
    }
  }
  
  return selectedAmenities;
}

/**
 * 매물 타입에 따른 이미지 생성
 */
function generatePropertyImages(type: PropertyType, seed: number): string[] {
  const imageCount = Math.floor(seededRandom(seed + 200) * 4) + 2; // 2-5개 이미지
  const images: string[] = [];

  // 무료 이미지 서비스를 활용한 realistic한 이미지들
  const imageCategories = {
    office: [
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop",
    ],
    retail: [
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop",
    ],
    building: [
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop",
    ],
    warehouse: [
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop",
    ],
    factory: [
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop",
    ],
  };

  const typeImages = imageCategories[type] || imageCategories.office;

  for (let i = 0; i < imageCount; i++) {
    const imageIndex = Math.floor(seededRandom(seed + 300 + i) * typeImages.length);
    images.push(typeImages[imageIndex]);
  }

  return images;
}
