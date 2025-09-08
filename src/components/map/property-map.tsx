"use client"

import { useEffect, useRef, useState } from 'react'
import { loadKakaoMapScript } from '@/lib/api/kakao-map'
import { Property } from '@/types/property'

interface PropertyMapProps {
  properties?: Property[]
  center?: { lat: number; lng: number }
  level?: number
  onMapLoad?: (map: any) => void
  onMarkerClick?: (property: Property) => void
  className?: string
}

// 기본 서울 중심좌표
const DEFAULT_CENTER = {
  lat: 37.5665, // 서울시청
  lng: 126.9780
}

export function PropertyMap({
  properties = [],
  center = DEFAULT_CENTER,
  level = 3,
  onMapLoad,
  onMarkerClick,
  className = "w-full h-96"
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 카카오 지도 초기화
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 카카오 지도 스크립트 로드
        await loadKakaoMapScript()
        
        if (!mapRef.current) return

        // 지도 생성
        const mapInstance = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: level
        })

        // 지도 컨트롤 추가
        const mapTypeControl = new window.kakao.maps.MapTypeControl()
        mapInstance.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT)

        const zoomControl = new window.kakao.maps.ZoomControl()
        mapInstance.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

        setMap(mapInstance)
        onMapLoad?.(mapInstance)

        setIsLoading(false)
      } catch (err) {
        console.warn('카카오 지도 초기화 실패 (API 키 문제):', err)
        setError('카카오 지도 API 키가 설정되지 않았습니다. 개발 중에는 Mock 데이터로 진행합니다.')
        setIsLoading(false)
      }
    }

    initMap()
  }, [center.lat, center.lng, level, onMapLoad])

  // 매물 마커 표시
  useEffect(() => {
    if (!map || !window.kakao) return

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null))

    const newMarkers: any[] = []

    properties.forEach((property) => {
      // 좌표가 유효한 매물만 마커 생성
      if (!property.location.coordinates.lat || !property.location.coordinates.lng) return

      const markerPosition = new window.kakao.maps.LatLng(
        property.location.coordinates.lat,
        property.location.coordinates.lng
      )

      // 매물 유형에 따른 마커 이미지 설정
      const markerImage = getMarkerImageByType(property.type)
      
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        image: markerImage,
        title: property.title
      })

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onMarkerClick?.(property)
      })

      marker.setMap(map)
      newMarkers.push(marker)
    })

    setMarkers(newMarkers)

    // 매물이 있으면 해당 영역에 맞게 지도 범위 조정
    if (properties.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds()
      
      properties.forEach((property) => {
        if (property.location.coordinates.lat && property.location.coordinates.lng) {
          bounds.extend(new window.kakao.maps.LatLng(
            property.location.coordinates.lat,
            property.location.coordinates.lng
          ))
        }
      })

      map.setBounds(bounds)
    }
  }, [map, properties, onMarkerClick])

  // 매물 유형별 마커 이미지 생성
  const getMarkerImageByType = (type: string) => {
    const colors = {
      office: '#3B82F6',    // 파란색 - 사무실
      retail: '#EF4444',    // 빨간색 - 상가
      building: '#10B981',  // 초록색 - 건물
      warehouse: '#F59E0B', // 주황색 - 창고
      factory: '#8B5CF6'    // 보라색 - 공장
    }

    const color = colors[type as keyof typeof colors] || '#6B7280'
    
    // SVG 마커 이미지 생성
    const svgMarker = `
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" fill="${color}"/>
        <circle cx="15" cy="15" r="8" fill="white"/>
        <circle cx="15" cy="15" r="5" fill="${color}"/>
      </svg>
    `

    const encodedSvg = encodeURIComponent(svgMarker)
    
    return new window.kakao.maps.MarkerImage(
      `data:image/svg+xml;charset=utf-8,${encodedSvg}`,
      new window.kakao.maps.Size(30, 40),
      { offset: new window.kakao.maps.Point(15, 40) }
    )
  }

  // 지도 중심 이동
  const moveToLocation = (lat: number, lng: number) => {
    if (!map) return
    
    const moveLatLng = new window.kakao.maps.LatLng(lat, lng)
    map.setCenter(moveLatLng)
  }

  // 지도 레벨 변경
  const setMapLevel = (newLevel: number) => {
    if (!map) return
    map.setLevel(newLevel)
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className={`${className} ${isLoading ? 'opacity-50' : ''}`}
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
  )
}