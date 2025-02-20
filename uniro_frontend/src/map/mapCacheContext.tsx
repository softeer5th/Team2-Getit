import React, { useRef, createContext, RefObject } from "react";

type RouteCacheMap = Map<string, google.maps.Polyline>;
type MarkerCacheMap = {
	danger: Map<number, google.maps.marker.AdvancedMarkerElement>;
	caution: Map<number, google.maps.marker.AdvancedMarkerElement>;
};
interface CacheContextType {
	cachedRouteRef: RefObject<RouteCacheMap>;
	cachedMarkerRef: RefObject<MarkerCacheMap>;
	usedRouteRef: RefObject<Set<string>>;
}

export const CacheContext = createContext<CacheContextType>({
	cachedMarkerRef: { current: { danger: new Map(), caution: new Map() } },
	cachedRouteRef: { current: new Map() },
	usedRouteRef: { current: new Set() },
});

export default function CacheProvider({ children }: { children: React.ReactNode }) {
	const cachedRouteRef = useRef<RouteCacheMap>(new Map());
	const cachedMarkerRef = useRef<MarkerCacheMap>({ danger: new Map(), caution: new Map() });
	const usedRouteRef = useRef<Set<string>>(new Set());

	return (
		<CacheContext.Provider value={{ cachedRouteRef, cachedMarkerRef, usedRouteRef }}>
			{children}
		</CacheContext.Provider>
	);
}
