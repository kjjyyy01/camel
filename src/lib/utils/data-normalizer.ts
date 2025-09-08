import { Property, PropertyType, TransactionType } from '@/types/property'
import { 
  KoreaRealEstateCommercialResponse, 
  KoreaRealEstateOfficeResponse,
  KoreaRealEstateRetailResponse 
} from '@/types/api'

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
      description: this.generateDescription(item),
      price: this.normalizePrice(item),
      deposit: this.normalizeDeposit(item),
      monthly_rent: this.normalizeMonthlyRent(item),
      maintenance_fee: this.normalizeMaintenanceFee(item),
      area: {
        total: this.normalizeArea(item.면적 || item.전용면적),
        land: this.normalizeArea(item.대지면적),
        building: this.normalizeArea(item.건물면적),
        floor: item.층 || item.해당층
      },
      location: {
        address: this.normalizeAddress(item),
        coordinates: {
          lat: parseFloat(item.위도) || 0,
          lng: parseFloat(item.경도) || 0
        },
        district: item.시군구 || item.구,
        dong: item.법정동 || item.동,
        detail: item.상세주소 || ''
      },
      building_info: {
        year_built: this.normalizeYear(item.건축년도),
        total_floors: parseInt(item.총층수) || 0,
        elevator: this.normalizeBoolean(item.엘리베이터),
        parking: this.normalizeBoolean(item.주차가능)
      },
      amenities: this.normalizeAmenities(item),
      images: [],
      contact: {
        agent_name: item.중개사명 || '',
        phone: item.연락처 || '',
        company: item.중개업체명 || ''
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      view_count: 0,
      favorite_count: 0
    }
  }

  /**
   * 매물 고유 ID 생성
   */
  private static generatePropertyId(item: any): string {
    const base = `${item.시군구 || 'unknown'}-${item.법정동 || 'unknown'}-${item.건물명 || 'unnamed'}`
    const hash = Math.abs(JSON.stringify(item).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0))
    return `${base}-${hash}`.toLowerCase().replace(/\s+/g, '-')
  }

  /**
   * 건물 용도를 PropertyType으로 매핑
   */
  private static mapToPropertyType(usage: string): PropertyType {
    if (!usage) return 'office'
    
    const usageLower = usage.toLowerCase()
    if (usageLower.includes('사무') || usageLower.includes('오피스')) return 'office'
    if (usageLower.includes('상가') || usageLower.includes('점포') || usageLower.includes('상업')) return 'retail'
    if (usageLower.includes('창고') || usageLower.includes('물류')) return 'warehouse'
    if (usageLower.includes('공장') || usageLower.includes('제조')) return 'factory'
    
    return 'building'
  }

  /**
   * 거래 구분을 TransactionType으로 매핑
   */
  private static mapToTransactionType(type: string): TransactionType {
    if (!type) return 'rent'
    
    const typeLower = type.toLowerCase()
    if (typeLower.includes('매매') || typeLower.includes('분양')) return 'sale'
    if (typeLower.includes('전세')) return 'jeonse'
    
    return 'rent'
  }

  /**
   * 매물 제목 생성
   */
  private static generateTitle(item: any): string {
    const building = item.건물명 || '건물'
    const type = this.mapToPropertyType(item.건물용도 || item.용도)
    const area = this.normalizeArea(item.면적 || item.전용면적)
    
    const typeMap = {
      office: '사무실',
      retail: '상가',
      building: '건물',
      warehouse: '창고',
      factory: '공장'
    }
    
    return `${building} ${typeMap[type]} ${area}㎡`
  }

  /**
   * 매물 설명 생성
   */
  private static generateDescription(item: any): string {
    const parts = []
    
    if (item.건축년도) parts.push(`건축년도: ${item.건축년도}년`)
    if (item.층) parts.push(`층수: ${item.층}층`)
    if (item.엘리베이터) parts.push('엘리베이터 있음')
    if (item.주차가능) parts.push('주차 가능')
    
    return parts.length > 0 ? parts.join(', ') : '상세 정보는 문의하세요.'
  }

  /**
   * 가격 정규화
   */
  private static normalizePrice(item: any): number {
    const price = item.거래금액 || item.매매가 || item.분양가격 || 0
    return this.parsePrice(price)
  }

  /**
   * 보증금 정규화
   */
  private static normalizeDeposit(item: any): number | null {
    const deposit = item.보증금 || item.전세금 || 0
    return deposit ? this.parsePrice(deposit) : null
  }

  /**
   * 월세 정규화
   */
  private static normalizeMonthlyRent(item: any): number | null {
    const rent = item.월세 || item.임대료 || 0
    return rent ? this.parsePrice(rent) : null
  }

  /**
   * 관리비 정규화
   */
  private static normalizeMaintenanceFee(item: any): number | null {
    const fee = item.관리비 || 0
    return fee ? this.parsePrice(fee) : null
  }

  /**
   * 면적 정규화 (㎡ 단위)
   */
  private static normalizeArea(area: any): number {
    if (!area) return 0
    
    // 숫자로 변환
    const numericArea = parseFloat(area.toString().replace(/[^0-9.]/g, ''))
    if (isNaN(numericArea)) return 0
    
    // 평수를 ㎡로 변환 (1평 = 3.3㎡)
    if (area.toString().includes('평')) {
      return Math.round(numericArea * 3.3)
    }
    
    return Math.round(numericArea)
  }

  /**
   * 주소 정규화
   */
  private static normalizeAddress(item: any): string {
    const parts = []
    
    if (item.시도) parts.push(item.시도)
    if (item.시군구) parts.push(item.시군구)
    if (item.법정동 || item.동) parts.push(item.법정동 || item.동)
    if (item.상세주소) parts.push(item.상세주소)
    
    return parts.join(' ')
  }

  /**
   * 건축년도 정규화
   */
  private static normalizeYear(year: any): number | null {
    if (!year) return null
    
    const numericYear = parseInt(year.toString())
    if (isNaN(numericYear) || numericYear < 1900 || numericYear > new Date().getFullYear()) {
      return null
    }
    
    return numericYear
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
   * 가격 문자열을 숫자로 변환 (만원 단위)
   */
  private static parsePrice(price: any): number {
    if (!price) return 0
    if (typeof price === 'number') return price
    
    const priceStr = price.toString()
    const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ''))
    
    if (isNaN(numericPrice)) return 0
    
    // 만원, 억원 단위 처리
    if (priceStr.includes('억')) {
      return Math.round(numericPrice * 10000)
    } else if (priceStr.includes('만')) {
      return Math.round(numericPrice)
    }
    
    // 기본값은 만원 단위로 가정
    return Math.round(numericPrice)
  }
}

/**
 * Mock 데이터 생성 (API 승인 대기 중 테스트용)
 */
export const generateMockProperties = (): Property[] => {
  return [
    {
      id: 'mock-gangnam-office-1',
      type: 'office',
      transaction_type: 'rent',
      title: '강남역 프리미엄 오피스텔',
      description: '지하철역 도보 5분, 최고급 시설',
      price: 0,
      deposit: 5000,
      monthly_rent: 300,
      maintenance_fee: 15,
      area: {
        total: 85,
        land: null,
        building: null,
        floor: '12층'
      },
      location: {
        address: '서울특별시 강남구 역삼동',
        coordinates: { lat: 37.4979, lng: 127.0276 },
        district: '강남구',
        dong: '역삼동',
        detail: '강남역 12번 출구 도보 5분'
      },
      building_info: {
        year_built: 2018,
        total_floors: 20,
        elevator: true,
        parking: true
      },
      amenities: ['엘리베이터', '주차장', '에어컨', '인터넷'],
      images: [],
      contact: {
        agent_name: '김부동산',
        phone: '02-1234-5678',
        company: '강남부동산'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      view_count: 156,
      favorite_count: 23
    },
    {
      id: 'mock-hongdae-retail-1',
      type: 'retail',
      transaction_type: 'jeonse',
      title: '홍대입구 1층 상가',
      description: '유동인구 많은 번화가, 음식점 최적',
      price: 0,
      deposit: 15000,
      monthly_rent: null,
      maintenance_fee: 25,
      area: {
        total: 45,
        land: null,
        building: null,
        floor: '1층'
      },
      location: {
        address: '서울특별시 마포구 서교동',
        coordinates: { lat: 37.5563, lng: 126.9236 },
        district: '마포구',
        dong: '서교동',
        detail: '홍대입구역 9번 출구 앞'
      },
      building_info: {
        year_built: 2015,
        total_floors: 5,
        elevator: false,
        parking: false
      },
      amenities: ['에어컨', '화장실'],
      images: [],
      contact: {
        agent_name: '이중개사',
        phone: '02-9876-5432',
        company: '홍대부동산'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      view_count: 89,
      favorite_count: 12
    }
  ]
}