import { Property, PropertyType, TransactionType, PropertyStatus } from '@/types/property'

/**
 * Korea Real Estate API 응답을 표준 Property 형식으로 변환
 */
export class DataNormalizer {
  /**
   * 상업용 부동산 데이터 정규화
   */
  static normalizeCommercialProperty(item: any): Property {
    return {
      id: this.generatePropertyId(item),
      type: this.mapToPropertyType(item.건물용도 || item.용도),
      transaction_type: this.mapToTransactionType(item.거래구분 || item.계약구분),
      title: this.generateTitle(item),
      address: this.normalizeAddress(item),
      detailed_address: item.상세주소,
      latitude: parseFloat(item.위도) || 37.5665,
      longitude: parseFloat(item.경도) || 126.9780,
      price: this.normalizePrice(item),
      deposit: this.normalizeDeposit(item),
      monthly_rent: this.normalizeMonthlyRent(item),
      area: this.normalizeArea(item.면적 || item.전용면적),
      floor: item.층 || item.해당층 || 1,
      total_floors: item.총층수 || 1,
      description: this.generateDescription(item),
      images: [],
      amenities: this.normalizeAmenities(item),
      status: 'available' as PropertyStatus,
      view_count: Math.floor(Math.random() * 100),
      like_count: Math.floor(Math.random() * 20),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Mock 데이터 생성
   */
  private static generatePropertyId(item: any): string {
    const base = item.일련번호 || item.거래번호 || Math.random().toString(36)
    return `prop_${base.toString().replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`
  }

  private static generateTitle(item: any): string {
    const type = this.mapToPropertyType(item.건물용도 || item.용도)
    const area = this.normalizeArea(item.면적 || item.전용면적)
    const location = item.법정동 || item.동 || '서울'
    
    const typeNames = {
      'office': '사무실',
      'retail': '상가',
      'building': '건물',
      'warehouse': '창고',
      'factory': '공장'
    }
    
    return `${location} ${typeNames[type as keyof typeof typeNames] || '상업용'} ${area}㎡`
  }

  private static generateDescription(item: any): string {
    const parts = []
    
    if (item.층) parts.push(`${item.층}층`)
    if (item.면적 || item.전용면적) parts.push(`${this.normalizeArea(item.면적 || item.전용면적)}㎡`)
    if (item.건축년도) parts.push(`${item.건축년도}년 건축`)
    
    return parts.length > 0 ? parts.join(' · ') : '상세 정보는 문의해주세요.'
  }

  private static normalizeAddress(item: any): string {
    const parts = [
      item.시도 || '서울특별시',
      item.시군구 || item.구,
      item.법정동 || item.동,
      item.지번
    ].filter(Boolean)
    
    return parts.join(' ')
  }

  private static mapToPropertyType(buildingType: string): PropertyType {
    if (!buildingType) return 'office'
    
    const type = buildingType.toLowerCase()
    
    if (type.includes('사무') || type.includes('오피스') || type.includes('office')) return 'office'
    if (type.includes('상가') || type.includes('상업') || type.includes('retail')) return 'retail'
    if (type.includes('건물') || type.includes('빌딩') || type.includes('building')) return 'building'
    if (type.includes('창고') || type.includes('warehouse')) return 'warehouse'
    if (type.includes('공장') || type.includes('factory')) return 'factory'
    
    return 'office'
  }

  private static mapToTransactionType(transactionType: string): TransactionType {
    if (!transactionType) return 'lease'
    
    const type = transactionType.toLowerCase()
    
    if (type.includes('매매') || type.includes('sale')) return 'sale'
    if (type.includes('전세') || type.includes('월세') || type.includes('임대') || type.includes('lease')) return 'lease'
    
    return 'lease'
  }

  /**
   * 가격 정규화
   */
  private static normalizePrice(item: any): number {
    const salePrice = item.거래금액 || item.매매가격 || item.price || 0
    return salePrice ? this.parsePrice(salePrice) : 0
  }

  /**
   * 보증금 정규화
   */
  private static normalizeDeposit(item: any): number | undefined {
    const deposit = item.보증금 || item.전세금 || 0
    return deposit ? this.parsePrice(deposit) : undefined
  }

  /**
   * 월세 정규화
   */
  private static normalizeMonthlyRent(item: any): number | undefined {
    const rent = item.월세 || item.임대료 || 0
    return rent ? this.parsePrice(rent) : undefined
  }

  /**
   * 면적 정규화 (㎡ 단위)
   */
  private static normalizeArea(area: any): number {
    if (!area) return 0
    
    let numericArea = parseFloat(area.toString().replace(/[^\d.]/g, ''))
    
    if (numericArea > 1000) {
      // 평수로 보이는 경우 ㎡로 변환 (1평 = 3.3㎡)
      numericArea = numericArea * 3.3
    }
    
    return Math.round(numericArea * 100) / 100
  }

  /**
   * 편의시설 정규화
   */
  private static normalizeAmenities(item: any): string[] {
    const amenities: string[] = []
    
    if (this.normalizeBoolean(item.엘리베이터)) amenities.push('엘리베이터')
    if (this.normalizeBoolean(item.주차가능)) amenities.push('주차장')
    if (this.normalizeBoolean(item.에어컨)) amenities.push('에어컨')
    if (this.normalizeBoolean(item.화장실)) amenities.push('화장실')
    if (this.normalizeBoolean(item.인터넷)) amenities.push('인터넷')
    
    return amenities
  }

  /**
   * Boolean 값 정규화
   */
  private static normalizeBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase()
      return lowerValue === 'true' || lowerValue === '있음' || lowerValue === '가능' || lowerValue === 'y'
    }
    return false
  }

  /**
   * 가격 문자열을 숫자로 변환 (만원 단위)
   */
  private static parsePrice(price: any): number {
    if (typeof price === 'number') return price
    
    const priceStr = price.toString().replace(/[^\d]/g, '')
    const numericPrice = parseInt(priceStr) || 0
    
    // 만원 단위로 가정
    return numericPrice * 10000
  }
}

// Mock 데이터 캐시
let cachedMockProperties: Property[] | null = null;

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

  const properties: Property[] = []
  
  const types: PropertyType[] = ['office', 'retail', 'building', 'warehouse', 'factory']
  const transactionTypes: TransactionType[] = ['sale', 'lease']
  const areas = [
    { name: '강남구', lat: 37.5175896, lng: 127.0467972 },
    { name: '서초구', lat: 37.4836236, lng: 127.0327667 },
    { name: '마포구', lat: 37.5589584, lng: 126.9089841 },
    { name: '용산구', lat: 37.5322295, lng: 126.9909697 },
    { name: '종로구', lat: 37.5735884, lng: 126.9794068 }
  ]
  
  for (let i = 0; i < count; i++) {
    // 시드 기반으로 일관된 난수 생성
    const area = areas[Math.floor(seededRandom(i + 1) * areas.length)]
    const type = types[Math.floor(seededRandom(i + 10) * types.length)]
    const transactionType = transactionTypes[Math.floor(seededRandom(i + 20) * transactionTypes.length)]
    const buildingArea = Math.floor(seededRandom(i + 30) * 500) + 50
    const floor = Math.floor(seededRandom(i + 40) * 20) + 1
    
    properties.push({
      id: `mock_${i}`,
      type,
      transaction_type: transactionType,
      title: `${area.name} ${getTypeNameKorean(type)} ${buildingArea}㎡`,
      address: `서울특별시 ${area.name} ${Math.floor(seededRandom(i + 50) * 999) + 1}번지`,
      detailed_address: `${floor}층`,
      latitude: area.lat + (seededRandom(i + 60) - 0.5) * 0.01,
      longitude: area.lng + (seededRandom(i + 70) - 0.5) * 0.01,
      price: transactionType === 'sale' ? Math.floor(seededRandom(i + 80) * 500000) + 50000 : 0,
      deposit: transactionType === 'lease' ? Math.floor(seededRandom(i + 90) * 50000) + 5000 : undefined,
      monthly_rent: transactionType === 'lease' ? Math.floor(seededRandom(i + 100) * 1000) + 100 : undefined,
      area: buildingArea,
      floor,
      total_floors: floor + Math.floor(seededRandom(i + 110) * 10) + 1,
      description: `깔끔하고 현대적인 ${getTypeNameKorean(type)}입니다. 교통이 편리하고 주변 상권이 발달되어 있습니다.`,
      images: [],
      amenities: ['주차장', '엘리베이터', '에어컨'].slice(0, Math.floor(seededRandom(i + 120) * 3) + 1),
      status: 'available',
      view_count: Math.floor(seededRandom(i + 130) * 1000),
      like_count: Math.floor(seededRandom(i + 140) * 100),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }
  
  // 생성된 데이터를 캐시에 저장
  cachedMockProperties = properties;
  
  return properties.slice(0, count);
}

/**
 * Mock 데이터 캐시 초기화 (테스트나 개발용)
 */
export function clearMockPropertiesCache() {
  cachedMockProperties = null;
}

function getTypeNameKorean(type: PropertyType): string {
  const names = {
    'office': '사무실',
    'retail': '상가',
    'building': '건물',
    'warehouse': '창고',
    'factory': '공장'
  }
  return names[type] || '상업용'
}