"use client";

import { useEffect } from 'react';
import { logEnvironmentStatus } from '@/lib/utils/env-validator';

/**
 * 환경 변수 상태를 체크하고 로깅하는 프로바이더
 * 배포 환경에서 디버깅에 도움이 됩니다.
 */
export function EnvProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 개발 모드이거나 콘솔에서 환경 변수 상태를 확인하고 싶을 때만 실행
    if (process.env.NODE_ENV === 'development' || localStorage.getItem('debug-env') === 'true') {
      logEnvironmentStatus();
    }
  }, []);

  return <>{children}</>;
}