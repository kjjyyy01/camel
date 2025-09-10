/**
 * 환경 변수 검증 유틸리티
 * 배포 환경에서 필수 환경 변수가 설정되었는지 확인
 */

interface EnvConfig {
  required: string[];
  optional: string[];
}

const ENV_CONFIG: EnvConfig = {
  required: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_KAKAO_MAP_API_KEY"],
  optional: ["NEXT_PUBLIC_KAKAO_REST_API_KEY", "NEXT_PUBLIC_KOREA_REAL_ESTATE_API_KEY", "NEXT_PUBLIC_API_BASE_URL"],
};

export function validateEnvironmentVariables() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // 클라이언트에서는 NEXT_PUBLIC_ 환경 변수만 접근 가능
  const getEnvValue = (key: string) => {
    if (typeof window !== "undefined") {
      // 클라이언트 환경: NEXT_PUBLIC_ 변수만 접근 가능
      return (window as any).env?.[key] || process.env[key];
    }
    // 서버 환경: 모든 환경 변수 접근 가능
    return process.env[key];
  };

  // 필수 환경 변수 체크
  ENV_CONFIG.required.forEach((key) => {
    const value = getEnvValue(key);
    if (!value) {
      missing.push(key);
    }
  });

  // 선택적 환경 변수 체크
  ENV_CONFIG.optional.forEach((key) => {
    const value = getEnvValue(key);
    if (!value) {
      warnings.push(key);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

export function logEnvironmentStatus() {
  if (typeof window !== "undefined") {
    const validation = validateEnvironmentVariables();

    if (validation.isValid) {
      console.log("✅ 모든 필수 환경 변수가 설정되었습니다.");
    } else {
      console.error("❌ 누락된 필수 환경 변수:", validation.missing);
      console.log("📝 Vercel에서 다음 환경 변수를 설정해주세요:");
      validation.missing.forEach((key) => {
        console.log(`   - ${key}`);
      });
    }

    if (validation.warnings.length > 0) {
      console.warn("⚠️  누락된 선택적 환경 변수:", validation.warnings);
    }

    // 배포 환경 정보
    console.log("🌐 환경 정보:", {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? "배포됨" : "로컬",
      VERCEL_ENV: process.env.VERCEL_ENV || "로컬",
    });
  }
}

/**
 * 카카오 지도 API 키 검증
 */
export function isKakaoMapApiKeyValid(): boolean {
  const apiKey =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY
      : process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
  return !!(apiKey && apiKey.length > 10);
}

/**
 * Supabase 설정 검증
 */
export function isSupabaseConfigValid(): boolean {
  const url =
    typeof window !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url.includes("supabase") && key.length > 50);
}
