import { create } from "zustand";
import { Building } from "../data/types/node";

interface SearchModeStore {
	mode: "origin" | "destination";
	setMode: (mode: "origin" | "destination") => void;
	building: Building | undefined;
	setBuilding: (newBuilding: Building) => void;
}

const useSearchMode = create<SearchModeStore>((set) => ({
	mode: "origin",
	setMode: (newMode: "origin" | "destination") => set(() => ({ mode: newMode })),
	building: undefined,
	setBuilding: (newBuilding: Building) => set(() => ({ building: newBuilding })),
}));

export default useSearchMode;
