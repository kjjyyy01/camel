// 통합 검색 문자열을 파싱해서 지역과 키워드로 분리하는 유틸리티

interface ParsedSearch {
  location: string;
  keyword: string;
  originalQuery: string;
}

// 한국 행정구역 및 일반적인 지역명
const LOCATION_KEYWORDS = [
  // 서울 25구
  '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구',
  '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구',
  '용산구', '은평구', '종로구', '중구', '중랑구',
  
  // 간단한 지역명 (구 빼고)
  '강남', '강동', '강북', '강서', '관악', '광진', '구로', '금천', '노원', '도봉',
  '동대문', '동작', '마포', '서대문', '서초', '성동', '성북', '송파', '양천', '영등포',
  '용산', '은평', '종로', '중구', '중랑',
  
  // 주요 역/동 지역
  '강남역', '신촌', '홍대', '명동', '이태원', '압구정', '청담', '삼성동', '역삼동', '논현동',
  '신사동', '잠실', '건대', '대학로', '인사동', '가로수길',
  
  // 경기도 주요 지역
  '수원', '성남', '고양', '용인', '부천', '안산', '안양', '남양주', '화성', '평택',
  '의정부', '시흥', '파주', '광명', '김포', '군포', '오산', '이천', '양주', '구리',
  
  // 기타 광역시
  '부산', '대구', '인천', '광주', '대전', '울산', '세종'
];

// 매물 관련 키워드
const PROPERTY_KEYWORDS = [
  // 매물 유형
  '사무실', '사무공간', '오피스', '사무실임대', '사무텔',
  '상가', '상가임대', '점포', '매장', '상점', '가게',
  '창고', '물류창고', '공장', '공장임대',
  '토지', '임야', '전답', '대지',
  '건물', '빌딩', '상업시설',
  
  // 거래 유형
  '임대', '매매', '전세', '월세', '렌트', '리스',
  
  // 기타 부동산 관련
  '부동산', '매물', '임대물건', '공실'
];

/**
 * 통합 검색 문자열을 파싱해서 지역명과 키워드로 분리
 */
export function parseSearchQuery(query: string): ParsedSearch {
  const trimmedQuery = query.trim().toLowerCase();
  
  if (!trimmedQuery) {
    return {
      location: '',
      keyword: '',
      originalQuery: query
    };
  }

  let detectedLocation = '';
  let remainingKeyword = trimmedQuery;

  // 1. 지역명 찾기 - 더 구체적인 지역명부터 체크 (예: '강남구'가 '강남'보다 먼저)
  const sortedLocations = [...LOCATION_KEYWORDS].sort((a, b) => b.length - a.length);
  
  for (const location of sortedLocations) {
    const locationLower = location.toLowerCase();
    if (trimmedQuery.includes(locationLower)) {
      detectedLocation = location;
      // 찾은 지역명을 제거하고 나머지를 키워드로 사용
      remainingKeyword = trimmedQuery.replace(locationLower, '').trim();
      break;
    }
  }

  // 2. 남은 텍스트에서 부동산 관련 키워드 정리
  // 여러 공백을 하나로 합치고, 앞뒤 공백 제거
  remainingKeyword = remainingKeyword.replace(/\s+/g, ' ').trim();

  return {
    location: detectedLocation,
    keyword: remainingKeyword,
    originalQuery: query
  };
}

/**
 * 검색어에 대한 자동완성 제안 생성
 */
export function generateSearchSuggestions(query: string, limit: number = 8): string[] {
  const trimmedQuery = query.trim().toLowerCase();
  
  if (!trimmedQuery) {
    return [
      '강남 사무실',
      '서초 상가',
      '마포 임대',
      '종로 오피스',
      '영등포 창고',
      '송파 매장'
    ].slice(0, limit);
  }

  const suggestions: string[] = [];
  
  // 1. 지역명이 포함된 경우 매물 타입 제안
  const detectedLocation = LOCATION_KEYWORDS.find(loc => 
    trimmedQuery.includes(loc.toLowerCase())
  );
  
  if (detectedLocation) {
    // 매물 타입 제안
    PROPERTY_KEYWORDS.slice(0, 4).forEach(propertyType => {
      const suggestion = `${detectedLocation} ${propertyType}`;
      if (suggestion.toLowerCase().includes(trimmedQuery)) {
        suggestions.push(suggestion);
      }
    });
  } else {
    // 지역명이 없는 경우 지역 + 현재 키워드 조합 제안
    LOCATION_KEYWORDS.slice(0, 4).forEach(location => {
      suggestions.push(`${location} ${query.trim()}`);
    });
  }

  // 2. 매물 타입이 포함된 경우 지역 제안
  const detectedProperty = PROPERTY_KEYWORDS.find(prop => 
    trimmedQuery.includes(prop.toLowerCase())
  );
  
  if (detectedProperty) {
    LOCATION_KEYWORDS.slice(0, 4).forEach(location => {
      const suggestion = `${location} ${detectedProperty}`;
      if (!suggestions.includes(suggestion) && 
          suggestion.toLowerCase().includes(trimmedQuery)) {
        suggestions.push(suggestion);
      }
    });
  }

  // 3. 인기 검색어 조합
  const popularCombinations = [
    '강남 사무실 임대',
    '서초 상가 매매',
    '마포 오피스텔',
    '종로 점포',
    '영등포 창고',
    '송파 빌딩'
  ];

  popularCombinations.forEach(combination => {
    if (combination.toLowerCase().includes(trimmedQuery) && 
        !suggestions.includes(combination)) {
      suggestions.push(combination);
    }
  });

  return suggestions.slice(0, limit);
}

/**
 * 매물 타입 키워드인지 확인
 */
export function isPropertyKeyword(keyword: string): boolean {
  return PROPERTY_KEYWORDS.some(prop => 
    keyword.toLowerCase().includes(prop.toLowerCase())
  );
}

/**
 * 지역명 키워드인지 확인
 */
export function isLocationKeyword(keyword: string): boolean {
  return LOCATION_KEYWORDS.some(loc => 
    keyword.toLowerCase().includes(loc.toLowerCase())
  );
}