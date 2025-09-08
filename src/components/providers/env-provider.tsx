"use client";

import { useEffect } from 'react';
import { logEnvironmentStatus } from '@/lib/utils/env-validator';

/**
 * 환경 변수 상태를 체크하고 로깅하는 프로바이더
 * 배포 환경에서 디버깅에 도움이 됩니다.
 */
export function EnvProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 환경 변수 검증은 명시적으로 요청했을 때만 실행
    if (localStorage.getItem('debug-env') === 'true') {
      logEnvironmentStatus();
    }
  }, []);

  return <>{children}</>;
}