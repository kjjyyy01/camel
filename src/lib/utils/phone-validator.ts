/**
 * 한국 전화번호 유효성 검증 유틸리티
 */

export interface PhoneValidationResult {
  isValid: boolean;
  message?: string;
  normalized?: string;
}

/**
 * 전화번호 형식 정규화 (하이픈 제거, 순수 숫자만)
 */
export const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d]/g, "");
};

/**
 * 전화번호 포맷팅 (010-1234-5678 형태)
 */
export const formatPhoneNumber = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  
  if (normalized.length <= 3) {
    return normalized;
  } else if (normalized.length <= 7) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
  } else {
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 7)}-${normalized.slice(7, 11)}`;
  }
};

/**
 * 한국 전화번호 유효성 검증
 */
export const validateKoreanPhoneNumber = (phone: string): PhoneValidationResult => {
  const normalized = normalizePhoneNumber(phone);
  
  // 빈 값 체크
  if (!normalized) {
    return {
      isValid: false,
      message: "전화번호를 입력해주세요"
    };
  }

  // 길이 체크
  if (normalized.length < 10 || normalized.length > 11) {
    return {
      isValid: false,
      message: "전화번호는 10-11자리여야 합니다"
    };
  }

  // 한국 전화번호 패턴 체크
  const koreanPhonePattern = /^(010|011|016|017|018|019)\d{7,8}$/;
  
  if (!koreanPhonePattern.test(normalized)) {
    return {
      isValid: false,
      message: "올바른 한국 전화번호 형식이 아닙니다"
    };
  }

  return {
    isValid: true,
    normalized
  };
};

/**
 * 전화번호 마스킹 (개인정보 보호)
 */
export const maskPhoneNumber = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  
  if (normalized.length < 8) {
    return phone;
  }
  
  const prefix = normalized.slice(0, 3);
  const suffix = normalized.slice(-4);
  const middleLength = normalized.length - 7;
  const maskedMiddle = "*".repeat(middleLength);
  
  return formatPhoneNumber(`${prefix}${maskedMiddle}${suffix}`);
};

/**
 * 전화번호 보안 검증 (간단한 패턴 체크)
 */
export const isSecurePhoneNumber = (phone: string): PhoneValidationResult => {
  const normalized = normalizePhoneNumber(phone);
  
  // 연속된 같은 숫자 체크 (예: 1111)
  if (/(\d)\1{3,}/.test(normalized)) {
    return {
      isValid: false,
      message: "연속된 같은 숫자가 너무 많습니다"
    };
  }
  
  // 연속된 숫자 패턴 체크 (예: 1234, 9876)
  const hasSequentialNumbers = (str: string): boolean => {
    for (let i = 0; i < str.length - 3; i++) {
      const slice = str.slice(i, i + 4);
      const nums = slice.split('').map(Number);
      
      // 증가 패턴
      if (nums[0] + 1 === nums[1] && nums[1] + 1 === nums[2] && nums[2] + 1 === nums[3]) {
        return true;
      }
      
      // 감소 패턴
      if (nums[0] - 1 === nums[1] && nums[1] - 1 === nums[2] && nums[2] - 1 === nums[3]) {
        return true;
      }
    }
    return false;
  };
  
  if (hasSequentialNumbers(normalized)) {
    return {
      isValid: false,
      message: "연속된 숫자 패턴은 사용할 수 없습니다"
    };
  }
  
  return {
    isValid: true,
    normalized
  };
};