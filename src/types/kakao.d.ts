// 카카오 지도 API 타입 선언
interface KakaoLatLng {
  getLat(): number
  getLng(): number
}

interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void
  getCenter(): KakaoLatLng
  setLevel(level: number): void
  getLevel(): number
  setBounds(bounds: KakaoLatLngBounds): void
  getBounds(): KakaoLatLngBounds
  addControl(control: unknown, position: unknown): void
  removeControl(control: unknown): void
  panTo(latlng: KakaoLatLng): void
  panBy(dx: number, dy: number): void
}

interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void
  getSouthWest(): KakaoLatLng
  getNorthEast(): KakaoLatLng
  isEmpty(): boolean
}

interface KakaoMarker {
  setPosition(latlng: KakaoLatLng): void
  getPosition(): KakaoLatLng
  setMap(map: KakaoMap | null): void
  getMap(): KakaoMap | null
  setImage(image: KakaoMarkerImage): void
  getImage(): KakaoMarkerImage
  setTitle(title: string): void
  getTitle(): string
  setVisible(visible: boolean): void
  getVisible(): boolean
  setZIndex(zIndex: number): void
  getZIndex(): number
}

interface KakaoMarkerImage {
  src: string
  size: KakaoSize
  options?: {
    offset?: KakaoPoint
    alt?: string
    coords?: string
    shape?: string
  }
}

interface KakaoSize {
  width: number
  height: number
}

interface KakaoPoint {
  x: number
  y: number
}

interface KakaoInfoWindow {
  open(map: KakaoMap, marker?: KakaoMarker): void
  close(): void
  setPosition(latlng: KakaoLatLng): void
  getPosition(): KakaoLatLng
  setContent(content: string | HTMLElement): void
  getContent(): string | HTMLElement
}

interface KakaoControlPosition {
  TOP: unknown
  TOPLEFT: unknown
  TOPRIGHT: unknown
  LEFT: unknown
  RIGHT: unknown
  BOTTOMLEFT: unknown
  BOTTOM: unknown
  BOTTOMRIGHT: unknown
}

interface KakaoMapsEvent {
  addListener(target: unknown, type: string, handler: (...args: unknown[]) => void): void
  removeListener(target: unknown, type: string, handler: (...args: unknown[]) => void): void
  trigger(target: unknown, type: string, data?: unknown): void
  preventMap(): void
}

declare global {
  interface Window {
    kakao: {
      maps: {
        Map: new (container: HTMLElement, options: {
          center: KakaoLatLng
          level: number
          mapTypeId?: unknown
          draggable?: boolean
          scrollwheel?: boolean
          disableDoubleClick?: boolean
          disableDoubleClickZoom?: boolean
          projectionId?: string
        }) => KakaoMap
        
        LatLng: new (lat: number, lng: number) => KakaoLatLng
        LatLngBounds: new () => KakaoLatLngBounds
        
        Marker: new (options: {
          position: KakaoLatLng
          image?: KakaoMarkerImage
          title?: string
          draggable?: boolean
          clickable?: boolean
          zIndex?: number
          opacity?: number
        }) => KakaoMarker
        
        InfoWindow: new (options?: {
          content?: string | HTMLElement
          position?: KakaoLatLng
          removable?: boolean
          zIndex?: number
          altitude?: number
          range?: number
        }) => KakaoInfoWindow
        
        CustomOverlay: new (options: {
          position: KakaoLatLng
          content: string | HTMLElement
          xAnchor?: number
          yAnchor?: number
          zIndex?: number
          clickable?: boolean
        }) => {
          setPosition(latlng: KakaoLatLng): void
          getPosition(): KakaoLatLng
          setContent(content: string | HTMLElement): void
          getContent(): string | HTMLElement
          setMap(map: KakaoMap | null): void
          getMap(): KakaoMap | null
        }
        
        MapTypeControl: new () => {
          getPosition(): unknown
        }
        
        ZoomControl: new () => {
          getPosition(): unknown
        }
        
        ControlPosition: KakaoControlPosition
        event: KakaoMapsEvent
        
        services: {
          Geocoder: new () => {
            addressSearch(address: string, callback: (result: unknown[], status: unknown) => void): void
            coord2Address(lng: number, lat: number, callback: (result: unknown[], status: unknown) => void): void
          }
          Places: new () => {
            keywordSearch(keyword: string, callback: (result: unknown[], status: unknown) => void, options?: unknown): void
            categorySearch(category: string, callback: (result: unknown[], status: unknown) => void, options?: unknown): void
          }
        }
        
        MarkerImage: new (src: string, size: KakaoSize, options?: {
          offset?: KakaoPoint
          alt?: string
          coords?: string
          shape?: string
        }) => KakaoMarkerImage
        
        Size: new (width: number, height: number) => KakaoSize
        Point: new (x: number, y: number) => KakaoPoint
        load: (callback: () => void) => void
      }
    }
  }
}

export {}