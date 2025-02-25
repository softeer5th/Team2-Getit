import { create } from "zustand";
import { Building } from "../types/node";

export type SearchMode = "BUILDING" | "ORIGIN" | "DESTINATION";

interface SearchModeStore {
	searchMode: SearchMode;
	setSearchMode: (mode: SearchMode) => void;
	building: Building | undefined;
	setBuilding: (newBuilding: Building | undefined) => void;
}

/** 건물 리스트에서 건물을 출발지, 도착지로 결정하는 경우 */
const useSearchBuilding = create<SearchModeStore>((set) => ({
	searchMode: "BUILDING",
	setSearchMode: (newMode: SearchMode) => set(() => ({ searchMode: newMode })),
	building: undefined,
	setBuilding: (newBuilding: Building | undefined) => set(() => ({ building: newBuilding })),
}));

export default useSearchBuilding;
