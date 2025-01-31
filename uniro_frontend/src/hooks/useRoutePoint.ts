import { create } from "zustand";
import { Building } from "../data/types/node";

interface RouteStore {
	origin: Building | undefined;
	setOrigin: (origin: Building | undefined) => void;
	destination: Building | undefined;
	setDestination: (destination: Building | undefined) => void;
	switchBuilding: () => void;
}

/** 출발지, 도착지 관리 전역 상태 */
const useRoutePoint = create<RouteStore>((set) => ({
	origin: undefined,
	setOrigin: (newOrigin: Building | undefined) => set(() => ({ origin: newOrigin })),
	destination: undefined,
	setDestination: (newDestination: Building | undefined) => set(() => ({ destination: newDestination })),
	switchBuilding: () => set(({ origin, destination }) => ({ origin: destination, destination: origin })),
}));

export default useRoutePoint;
