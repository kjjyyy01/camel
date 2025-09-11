# 🚀 Camel 배포 가이드

## Vercel 배포 시 환경 변수 설정

### 1. 필수 환경 변수
다음 환경 변수들은 반드시 설정해야 합니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your-kakao-map-api-key
```

### 2. Vercel에서 환경 변수 설정하는 방법

1. **Vercel Dashboard** 접속 → 프로젝트 선택
2. **Settings** 탭 클릭
3. **Environment Variables** 메뉴 선택
4. 위의 필수 환경 변수들을 하나씩 추가

### 3. 카카오 지도 API 키 발급 방법

1. [카카오 개발자센터](https://developers.kakao.com/) 접속
2. **내 애플리케이션** → **애플리케이션 추가하기**
3. **앱 키** → **JavaScript 키** 복사
4. **플랫폼** → **Web** → 사이트 도메인 등록
   - 로컬: `http://localhost:3000`
   - 배포: `https://your-domain.vercel.app`

### 4. 환경 변수 검증 기능

배포된 사이트에서 카카오 지도가 보이지 않는다면:

1. **개발자 도구 콘솔** 확인
2. 환경 변수 상태를 확인하려면 콘솔에서:
   ```javascript
   localStorage.setItem('debug-env', 'true');
   ```
3. 페이지 새로고침 후 콘솔 메시지 확인

### 5. 선택적 환경 변수
필요에 따라 추가할 수 있는 환경 변수들:

```bash
NEXT_PUBLIC_KAKAO_REST_API_KEY=your-kakao-rest-api-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
```

## 배포 후 확인사항

✅ 카카오 지도가 정상적으로 표시되는지 확인  
✅ 매물 마커가 지도에 표시되는지 확인  
✅ 사용자 인증 기능 동작 확인  
✅ 매물 검색 및 필터링 동작 확인  
✅ 반응형 디자인 동작 확인  

## 문제 해결

### 카카오 지도가 보이지 않을 때
1. 환경 변수가 올바르게 설정되었는지 확인
2. 카카오 개발자센터에서 도메인이 등록되었는지 확인
3. API 키 권한이 활성화되었는지 확인

### Mock 데이터 관련 문제
현재 실제 부동산 API 대신 Mock 데이터를 사용합니다. 프로덕션에서는:
1. Supabase 연동을 통한 실제 데이터베이스 데이터 사용