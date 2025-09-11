// 검색 관련 타입 정의

export interface SearchParams {
  keyword: string;
  location: string;
  propertyType?: string;
}

export interface ParsedSearchQuery {
  location: string;
  keyword: string;
  originalQuery: string;
}