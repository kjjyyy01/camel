export * from './property';
export * from './api';
export * from './user';

export interface Location {
  lat: number;
  lng: number;
}

export interface MapBounds {
  sw: Location;
  ne: Location;
}

export interface FilterOptions {
  property_types: PropertyType[];
  transaction_types: TransactionType[];
  price_range: {
    min: number;
    max: number;
  };
  area_range: {
    min: number;
    max: number;
  };
  floor_range: {
    min: number;
    max: number;
  };
}

export interface SearchHistory {
  id: string;
  query: string;
  location?: Location;
  filters?: Partial<FilterOptions>;
  timestamp: string;
}

export interface Theme {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface AppConfig {
  map: {
    center: Location;
    zoom: number;
    clustering_zoom: number;
  };
  search: {
    max_results: number;
    default_radius: number;
  };
  pagination: {
    default_limit: number;
    max_limit: number;
  };
}

import { PropertyType, TransactionType } from './property';