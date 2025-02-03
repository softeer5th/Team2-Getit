import { UniversityLatLng, UniversityRecord } from "../data/types/university";

const universities: UniversityLatLng[] = [
  { name: "한양대학교", latlng: { lat: 37.5585, lng: 127.0458 } },
  { name: "인하대학교", latlng: { lat: 37.4509, lng: 126.6539 } },
  { name: "고려대학교", latlng: { lat: 37.5906, lng: 127.0324 } },
  { name: "서울시립대학교", latlng: { lat: 37.5834, lng: 127.058 } },
  { name: "이화여자대학교", latlng: { lat: 37.5618, lng: 126.946 } },
];

const universityRecord: UniversityRecord = universities.reduce(
  (acc, { name, latlng }) => {
    acc[name] = latlng;
    return acc;
  },
  {} as UniversityRecord
);

export { universities, universityRecord };
