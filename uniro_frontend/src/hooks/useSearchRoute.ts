import { create } from "zustand";
import { Building } from "../data/types/node";

interface RouteStore {
	origin: Building | undefined;
	setOrigin: (origin: Building | undefined) => void;
	destination: Building | undefined;
	setDestination: (destination: Building | undefined) => void;
	switchBuilding: () => void;
}

const useSearchRoute = create<RouteStore>((set) => ({
	origin: undefined,
	setOrigin: (newOrigin: Building | undefined) => set(() => ({ origin: newOrigin })),
	destination: undefined,
	setDestination: (newDestination: Building | undefined) => set(() => ({ destination: newDestination })),
	switchBuilding: () => set(({ origin, destination }) => ({ origin: destination, destination: origin })),
}));

export default useSearchRoute;
