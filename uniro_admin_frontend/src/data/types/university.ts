export interface UniversityLatLng {
  name: string;
  latlng: google.maps.LatLngLiteral;
}

export type UniversityRecord = Record<string, google.maps.LatLngLiteral>;
