import { create } from "zustand";
import { fallbackConfig } from "../constant/fallback";

interface FallbackStore {
	fallback: React.ReactNode;
	setFallback: (fallback: React.ReactNode) => void;
}

export const useFallbackStore = create<FallbackStore>((set) => {
	return {
		fallback: fallbackConfig["/"],
		setFallback: (f) => set({ fallback: f }),
	};
});
