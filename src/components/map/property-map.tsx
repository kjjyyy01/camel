"use client";

import { useEffect, useRef, useState } from "react";
import { loadKakaoMapScript } from "@/lib/api/kakao-map";
import { Property } from "@/types/property";

interface PropertyMapProps {
  properties?: Property[];
  center?: { lat: number; lng: number };
  level?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMapLoad?: (map: any) => void;
  onMarkerClick?: (property: Property) => void;
  className?: string;
}

// 기본 서울 중심좌표
const DEFAULT_CENTER = {
  lat: 37.5665, // 서울시청
  lng: 126.978,
};

export function PropertyMap({
  properties = [],
  center = DEFAULT_CENTER,
  level = 3,
  onMapLoad,
  onMarkerClick,
  className = "w-full h-96",
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [map, setMap] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 카카오 지도 초기화
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);


        // 카카오 지도 스크립트 로드
        await loadKakaoMapScript();


        if (!mapRef.current) {
          console.warn("지도 컨테이너가 없습니다");
          return;
        }


        // 지도 생성
        if (!window.kakao?.maps) {
          throw new Error('카카오 지도 API가 로드되지 않았습니다');
        }
        
        const mapInstance = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: level,
        });


        // 지도 컨트롤 추가
        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        mapInstance.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

        const zoomControl = new window.kakao.maps.ZoomControl();
        mapInstance.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        setMap(mapInstance);
        onMapLoad?.(mapInstance);

        // 지도가 제대로 표시되도록 강제 리사이즈
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mapInstance as any).relayout();
        }, 100);

        setIsLoading(false);
      } catch (err) {
        console.error("카카오 지도 초기화 실패:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`카카오 지도 로드 실패: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    initMap();
  }, [center.lat, center.lng, level, onMapLoad]);

  // 매물 마커 표시
  useEffect(() => {
    if (!map || !window.kakao?.maps) return;

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newMarkers: any[] = [];

    properties.forEach((property) => {
      // 좌표가 유효한 매물만 마커 생성
      if (!property.latitude || !property.longitude) return;

      const markerPosition = new window.kakao.maps.LatLng(property.latitude, property.longitude);

      // 매물 유형에 따른 마커 이미지 설정
      const markerImage = getMarkerImageByType(property.type);

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        image: markerImage,
        title: property.title,
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, "click", () => {
        onMarkerClick?.(property);
      });

      marker.setMap(map);
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // 매물이 있으면 해당 영역에 맞게 지도 범위 조정
    if (properties.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();

      properties.forEach((property) => {
        if (property.latitude && property.longitude) {
          bounds.extend(new window.kakao.maps.LatLng(property.latitude, property.longitude));
        }
      });

      map.setBounds(bounds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, properties, onMarkerClick]);

  // 매물 유형별 마커 이미지 생성
  const getMarkerImageByType = (type: string) => {
    const colors = {
      office: "#3B82F6", // 파란색 - 사무실
      retail: "#EF4444", // 빨간색 - 상가
      building: "#10B981", // 초록색 - 건물
      warehouse: "#F59E0B", // 주황색 - 창고
      factory: "#8B5CF6", // 보라색 - 공장
    };

    const color = colors[type as keyof typeof colors] || "#6B7280";

    // SVG 마커 이미지 생성
    const svgMarker = `
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" fill="${color}"/>
        <circle cx="15" cy="15" r="8" fill="white"/>
        <circle cx="15" cy="15" r="5" fill="${color}"/>
      </svg>
    `;

    const encodedSvg = encodeURIComponent(svgMarker);

    return new window.kakao.maps.MarkerImage(
      `data:image/svg+xml;charset=utf-8,${encodedSvg}`,
      new window.kakao.maps.Size(30, 40),
      { offset: new window.kakao.maps.Point(15, 40) }
    );
  };


  // 지도 레벨 변경
  const setMapLevel = (newLevel: number) => {
    if (!map) return;
    map.setLevel(newLevel);
  };

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg relative`}>
        <div className="text-center p-8">
          <div className="text-blue-500 mb-2">🗺️</div>
          <div className="text-gray-600 mb-2">지도 서비스</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          
          {/* 환경 변수 설정 안내 */}
          {error.includes('API 키') && (
            <div className="text-xs text-gray-400 bg-white p-3 rounded border max-w-sm">
              <p className="font-medium mb-2">🔧 배포 환경 설정 필요:</p>
              <p>1. Vercel Dashboard 접속</p>
              <p>2. Settings → Environment Variables</p>
              <p>3. NEXT_PUBLIC_KAKAO_MAP_API_KEY 추가</p>
            </div>
          )}

          {/* Mock 지도 표시 */}
          <div className="mt-4 w-full h-64 bg-green-100 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200"></div>

            {/* Mock 매물 마커들 */}
            {properties.slice(0, 5).map((property, index) => (
              <div
                key={property.id}
                className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${30 + index * 10}%`,
                }}
                onClick={() => onMarkerClick?.(property)}
                title={property.title}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                  {property.title}
                </div>
              </div>
            ))}

            <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-xs text-gray-600">
              Mock 지도 (개발용)
            </div>
          </div>
        </div>

        {/* 매물 개수 표시 */}
        {properties.length > 0 && (
          <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-md shadow-md text-sm">
            매물 {properties.length}개
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={`${className} ${isLoading ? "opacity-50" : ""}`}
        style={{ minHeight: "700px", height: "100%" }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="mt-2 text-gray-600">지도 로딩 중...</div>
          </div>
        </div>
      )}

      {/* 매물 개수 표시 */}
      {!isLoading && properties.length > 0 && (
        <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-md shadow-md text-sm">
          매물 {properties.length}개
        </div>
      )}

      {/* 지도 컨트롤 버튼들 (옵션) */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setMapLevel(Math.max(level - 1, 1))}
          className="w-10 h-10 bg-white border rounded shadow hover:bg-gray-50 flex items-center justify-center"
          title="확대"
        >
          +
        </button>
        <button
          onClick={() => setMapLevel(Math.min(level + 1, 14))}
          className="w-10 h-10 bg-white border rounded shadow hover:bg-gray-50 flex items-center justify-center"
          title="축소"
        >
          −
        </button>
      </div>
    </div>
  );
}
