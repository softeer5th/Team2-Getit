import { create } from "zustand";
import { universityRecord } from "../constant/university";

interface UniversityRecordStore {
  universityRecord: Record<string, google.maps.LatLngLiteral>;
  currentUniversity: string;
  getUniversityNameList: () => string[];
  setCurrentUniversity: (newUniversity: string) => void;
  setUniversityRecord: (
    newUniversityRecord: Record<string, google.maps.LatLngLiteral>
  ) => void;
  getCurrentUniversityLngLat: () => google.maps.LatLngLiteral;
}

const useSearchBuilding = create<UniversityRecordStore>((set, get) => ({
  universityRecord: universityRecord,
  currentUniversity: Object.keys(universityRecord)[0],
  getUniversityNameList: () => Object.keys(get().universityRecord),
  setUniversityRecord: (newUniversityRecord) =>
    set({ universityRecord: newUniversityRecord }),
  setCurrentUniversity: (newUniversity) =>
    set({ currentUniversity: newUniversity }),
  getCurrentUniversityLngLat: () =>
    get().universityRecord[get().currentUniversity] ||
    universityRecord["한양대학교"],
}));

export default useSearchBuilding;
