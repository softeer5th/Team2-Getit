import { create } from "zustand";
import { Building } from "../data/types/node";
import { persist } from "zustand/middleware";

interface RouteStore {
	origin: Building | undefined;
	setOrigin: (origin: Building | undefined) => void;
	destination: Building | undefined;
	setDestination: (destination: Building | undefined) => void;
	switchBuilding: () => void;
}

/** 출발지, 도착지 관리 전역 상태 */
const useRoutePoint = create(
	persist<RouteStore>(
		(set) => ({
			origin: undefined,
			setOrigin: (newOrigin: Building | undefined) => set(() => ({ origin: newOrigin })),
			destination: undefined,
			setDemoBuildingInfo: (building: Building) => set(() => ({ origin: building, destination: building })),

			setDestination: (newDestination: Building | undefined) => set(() => ({ destination: newDestination })),
			switchBuilding: () => set(({ origin, destination }) => ({ origin: destination, destination: origin })),
		}),
		{
			name: "route-point",
		},
	),
);

export default useRoutePoint;
