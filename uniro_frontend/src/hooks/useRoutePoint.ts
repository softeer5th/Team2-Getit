import { create } from "zustand";
import { Building } from "../data/types/node";

const originMockInfo = {
	buildingName: "5호관",
	buildingImageUrl: "",
	phoneNumber: "",
	address: "인하로 100",
	nodeId: 1,
	lng: 127.042012,
	lat: 37.557643,
};

const destMockInfo = {
	buildingName: "하이테크",
	buildingImageUrl: "",
	phoneNumber: "",
	address: "인하로 100",
	nodeId: 2,
	lng: 127.042012,
	lat: 37.557643,
};

interface RouteStore {
	origin: Building;
	setOrigin: (origin: Building | undefined) => void;
	destination: Building;
	setDemoBuildingInfo: (building: Building) => void;
	setDestination: (destination: Building | undefined) => void;
	setOriginCoord: (lng: number, lat: number) => void;
	setDestinationCoord: (lng: number, lat: number) => void;
	switchBuilding: () => void;
}

/** 출발지, 도착지 관리 전역 상태 */
const useRoutePoint = create<RouteStore>((set) => ({
	origin: originMockInfo,
	setOrigin: (newOrigin: Building | undefined) => set(() => ({ origin: newOrigin })),
	destination: destMockInfo,
	setDemoBuildingInfo: (building: Building) => set(() => ({ origin: building, destination: building })),
	setOriginCoord: (lng: number, lat: number) => set(({ origin }) => ({ origin: { ...origin, lng, lat } })),
	setDestinationCoord: (lng: number, lat: number) =>
		set(({ destination }) => ({ destination: { ...destination, lng, lat } })),
	setDestination: (newDestination: Building | undefined) => set(() => ({ destination: newDestination })),
	switchBuilding: () => set(({ origin, destination }) => ({ origin: destination, destination: origin })),
}));

export default useRoutePoint;
