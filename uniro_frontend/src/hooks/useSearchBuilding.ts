import { create } from "zustand";
import { Building } from "../data/types/node";
import { RoutePointType } from "../data/types/route";
import { RoutePoint } from "../constant/enums";

interface SearchModeStore {
	mode: RoutePointType;
	setMode: (mode: RoutePointType) => void;
	building: Building | undefined;
	setBuilding: (newBuilding: Building) => void;
}

/** 건물 리스트에서 건물을 출발지, 도착지로 결정하는 경우 */
const useSearchBuilding = create<SearchModeStore>((set) => ({
	mode: RoutePoint.ORIGIN,
	setMode: (newMode: RoutePointType) => set(() => ({ mode: newMode })),
	building: undefined,
	setBuilding: (newBuilding: Building) => set(() => ({ building: newBuilding })),
}));

export default useSearchBuilding;
