import axios from 'axios';
import { KoreaRealEstateApiParams, KoreaRealEstateProperty } from '@/types/api';
import { Property, PropertyType, TransactionType } from '@/types/property';

const API_BASE_URL = process.env.KOREA_REAL_ESTATE_BASE_URL || 'http://openapi.molit.go.kr';
const API_KEY = process.env.KOREA_REAL_ESTATE_API_KEY;

if (!API_KEY) {
  console.warn('KOREA_REAL_ESTATE_API_KEY is not set');
}

export class KoreaRealEstateApi {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = API_KEY || '';
    this.baseUrl = API_BASE_URL;
  }

  async fetchCommercialProperties(params: {
    regionCode?: string;
    dealDate?: string;
    numOfRows?: number;
    pageNo?: number;
  }) {
    if (!this.apiKey) {
      throw new Error('Korea Real Estate API key is not configured');
    }

    const queryParams = {
      serviceKey: this.apiKey,
      numOfRows: params.numOfRows || 100,
      pageNo: params.pageNo || 1,
      LAWD_CD: params.regionCode,
      DEAL_YMD: params.dealDate || this.getCurrentYearMonth(),
    };

    try {
      // 상업용 부동산 전월세 신고 조회 서비스 
      const response = await axios.get(`${this.baseUrl}/1613000/RTMSDataSvcSHRent/getRTMSDataSvcSHRent`, {
        params: queryParams,
        timeout: 10000,
        headers: {
          'Accept': 'application/xml'
        }
      });

      return this.parseResponse(response.data);
    } catch (error) {
      console.error('Korea Real Estate API Error:', error);
      throw new Error('Failed to fetch properties from Korea Real Estate API');
    }
  }

  async fetchOfficeRentData(regionCode: string, dealDate?: string) {
    return this.fetchCommercialProperties({
      regionCode,
      dealDate: dealDate || this.getCurrentYearMonth(),
    });
  }

  async fetchCommercialSaleData(regionCode: string, dealDate?: string) {
    if (!this.apiKey) {
      throw new Error('Korea Real Estate API key is not configured');
    }

    const params: KoreaRealEstateApiParams = {
      serviceKey: this.apiKey,
      LAWD_CD: regionCode,
      DEAL_YMD: dealDate || this.getCurrentYearMonth(),
    };

    try {
      const response = await axios.get(`${this.baseUrl}/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcSilvTrade`, {
        params,
        timeout: 10000,
      });

      return this.parseResponse(response.data);
    } catch (error) {
      console.error('Korea Real Estate Commercial Sale API Error:', error);
      throw new Error('Failed to fetch commercial sale data');
    }
  }

  private parseResponse(data: any): KoreaRealEstateProperty[] {
    try {
      if (!data.response?.body?.items?.item) {
        return [];
      }

      const items = Array.isArray(data.response.body.items.item) 
        ? data.response.body.items.item 
        : [data.response.body.items.item];

      return items.map((item: any) => ({
        거래금액: item.거래금액 || item.월세금액 || '',
        건축년도: item.건축년도 || '',
        년: item.년 || '',
        법정동: item.법정동 || '',
        아파트: item.시설명 || item.상가명 || item.건물명 || '',
        월: item.월 || '',
        일: item.일 || '',
        전용면적: item.전용면적 || item.면적 || '',
        지번: item.지번 || '',
        층: item.층 || '',
        지역코드: item.지역코드 || '',
      }));
    } catch (error) {
      console.error('Error parsing Korea Real Estate API response:', error);
      return [];
    }
  }

  normalizeToProperty(item: KoreaRealEstateProperty, coordinates?: { lat: number, lng: number }): Property {
    const price = this.parsePrice(item.거래금액);
    const area = this.parseArea(item.전용면적);
    const floor = this.parseFloor(item.층);
    
    return {
      id: this.generateId(item),
      type: this.guessPropertyType(item.아파트),
      transaction_type: price > 0 ? 'sale' : 'lease',
      title: item.아파트 || '상업용 부동산',
      address: `${item.법정동} ${item.지번}`,
      latitude: coordinates?.lat || 0,
      longitude: coordinates?.lng || 0,
      price: price,
      area: area,
      floor: floor,
      total_floors: floor,
      description: `${item.건축년도}년 건축`,
      images: [],
      amenities: [],
      status: 'available',
      view_count: 0,
      like_count: 0,
      created_at: `${item.년}-${item.월.padStart(2, '0')}-${item.일.padStart(2, '0')}`,
      updated_at: new Date().toISOString(),
    };
  }

  private parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    
    const cleaned = priceStr.replace(/[^\d]/g, '');
    return parseInt(cleaned) * 10000;
  }

  private parseArea(areaStr: string): number {
    if (!areaStr) return 0;
    
    const cleaned = areaStr.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  private parseFloor(floorStr: string): number {
    if (!floorStr) return 1;
    
    const cleaned = floorStr.replace(/[^\d]/g, '');
    return parseInt(cleaned) || 1;
  }

  private guessPropertyType(buildingName: string): PropertyType {
    const name = buildingName.toLowerCase();
    
    if (name.includes('오피스') || name.includes('사무실') || name.includes('빌딩')) {
      return 'office';
    }
    if (name.includes('상가') || name.includes('매장') || name.includes('점포')) {
      return 'retail';
    }
    if (name.includes('창고') || name.includes('물류')) {
      return 'warehouse';
    }
    if (name.includes('공장') || name.includes('제조')) {
      return 'factory';
    }
    
    return 'office';
  }

  private generateId(item: KoreaRealEstateProperty): string {
    return `kre_${item.지역코드}_${item.법정동}_${item.지번}_${item.년}${item.월}${item.일}`.replace(/\s+/g, '_');
  }

  private getCurrentYearMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  }

  static getRegionCodes() {
    return {
      '서울': '11',
      '부산': '26',
      '대구': '27',
      '인천': '28',
      '광주': '29',
      '대전': '30',
      '울산': '31',
      '세종': '36',
      '경기': '41',
      '강원': '42',
      '충북': '43',
      '충남': '44',
      '전북': '45',
      '전남': '46',
      '경북': '47',
      '경남': '48',
      '제주': '50',
    };
  }
}

export const koreaRealEstateApi = new KoreaRealEstateApi();