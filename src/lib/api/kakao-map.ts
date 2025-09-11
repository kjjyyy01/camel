import axios from 'axios';
import { KakaoMapSearchResult } from '@/types/api';
import { Location } from '@/types';


const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

// 환경 변수 체크
if (typeof window !== 'undefined' && !KAKAO_MAP_API_KEY) {
  console.error('카카오 지도 API 키가 설정되지 않았습니다.');
}

export class KakaoMapApi {
  private restApiKey: string;
  private baseUrl = 'https://dapi.kakao.com';

  constructor() {
    this.restApiKey = KAKAO_REST_API_KEY || '';
  }

  private getHeaders() {
    return {
      'Authorization': `KakaoAK ${this.restApiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async searchByKeyword(query: string, options?: {
    x?: number;
    y?: number;
    radius?: number;
    page?: number;
    size?: number;
  }) {
    if (!this.restApiKey) {
      throw new Error('Kakao REST API key is not configured');
    }

    try {
      const params = {
        query,
        page: options?.page || 1,
        size: options?.size || 15,
        x: options?.x,
        y: options?.y,
        radius: options?.radius,
      };

      const response = await axios.get(`${this.baseUrl}/v2/local/search/keyword.json`, {
        headers: this.getHeaders(),
        params,
        timeout: 10000,
      });

      return response.data.documents as KakaoMapSearchResult[];
    } catch (error) {
      console.error('Kakao Map Search Error:', error);
      throw new Error('Failed to search locations');
    }
  }

  async searchByAddress(address: string) {
    if (!this.restApiKey) {
      throw new Error('Kakao REST API key is not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/v2/local/search/address.json`, {
        headers: this.getHeaders(),
        params: { query: address },
        timeout: 10000,
      });

      return response.data.documents;
    } catch (error) {
      console.error('Kakao Address Search Error:', error);
      throw new Error('Failed to search address');
    }
  }

  async geocoding(address: string): Promise<Location | null> {
    try {
      const results = await this.searchByAddress(address);
      
      if (results && results.length > 0) {
        const result = results[0];
        return {
          lat: parseFloat(result.y),
          lng: parseFloat(result.x),
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding Error:', error);
      return null;
    }
  }

  async reverseGeocoding(lat: number, lng: number) {
    if (!this.restApiKey) {
      throw new Error('Kakao REST API key is not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/v2/local/geo/coord2address.json`, {
        headers: this.getHeaders(),
        params: {
          x: lng,
          y: lat,
          input_coord: 'WGS84',
        },
        timeout: 10000,
      });

      return response.data.documents;
    } catch (error) {
      console.error('Reverse Geocoding Error:', error);
      throw new Error('Failed to get address from coordinates');
    }
  }

  async searchSubwayStations(query: string) {
    return this.searchByKeyword(`${query} 지하철역`, {
      size: 10,
    });
  }

  async searchCommercialAreas(query: string) {
    return this.searchByKeyword(`${query} 상가 오피스`, {
      size: 15,
    });
  }

  async getDistanceMatrix(origins: Location[], destinations: Location[]) {
    if (!this.restApiKey) {
      throw new Error('Kakao REST API key is not configured');
    }

    try {
      const originStr = origins.map(loc => `${loc.lng},${loc.lat}`).join('|');
      const destStr = destinations.map(loc => `${loc.lng},${loc.lat}`).join('|');

      const response = await axios.get(`${this.baseUrl}/v2/local/search/keyword.json`, {
        headers: this.getHeaders(),
        params: {
          origins: originStr,
          destinations: destStr,
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('Distance Matrix Error:', error);
      throw new Error('Failed to calculate distances');
    }
  }

  parseSearchResult(result: KakaoMapSearchResult): {
    id: string;
    name: string;
    address: string;
    roadAddress: string;
    location: Location;
    category: string;
    phone?: string;
    distance?: string;
  } {
    return {
      id: result.id,
      name: result.place_name,
      address: result.address_name,
      roadAddress: result.road_address_name,
      location: {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x),
      },
      category: result.category_group_name,
      phone: result.phone,
      distance: result.distance,
    };
  }

  static isMapApiLoaded(): boolean {
    return typeof window !== 'undefined' && !!window.kakao?.maps;
  }

  static getMapApiKey(): string | undefined {
    return KAKAO_MAP_API_KEY;
  }

  static createMapScriptUrl(): string {
    if (!KAKAO_MAP_API_KEY) {
      throw new Error('Kakao Map API key is not configured');
    }
    
    return `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&libraries=services,clusterer&autoload=false`;
  }
}

export const kakaoMapApi = new KakaoMapApi();

export const loadKakaoMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (KakaoMapApi.isMapApiLoaded()) {
      resolve();
      return;
    }

    try {
      const scriptUrl = KakaoMapApi.createMapScriptUrl();
      
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = scriptUrl;
      
      script.onload = () => {
        if (!window.kakao) {
          reject(new Error('카카오 객체를 찾을 수 없습니다'));
          return;
        }
        
        window.kakao.maps.load(() => {
          resolve();
        });
      };
      
      script.onerror = () => {
        reject(new Error('카카오 지도 API 스크립트 로드에 실패했습니다'));
      };

      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
};