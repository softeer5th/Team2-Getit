import React, { useRef, createContext, RefObject } from "react";
import { Markers } from "../constant/enum/markerEnum";

type RouteCacheMap = Map<string, google.maps.Polyline>;
// type MarkerCacheMap = {
// 	danger: Map<number, google.maps.marker.AdvancedMarkerElement>;
// 	caution: Map<number, google.maps.marker.AdvancedMarkerElement>;
// };

type MarkerCacheMap = Map<
	string,
	{ type: Markers.CAUTION | Markers.DANGER; element: google.maps.marker.AdvancedMarkerElement }
>;

interface CacheContextType {
	cachedRouteRef: RefObject<RouteCacheMap>;
	cachedMarkerRef: RefObject<MarkerCacheMap>;
	usedRouteRef: RefObject<Set<string>>;
	usedMarkerRef: RefObject<Set<string>>;
}

export const CacheContext = createContext<CacheContextType>({
	cachedMarkerRef: { current: new Map() },
	cachedRouteRef: { current: new Map() },
	usedRouteRef: { current: new Set() },
	usedMarkerRef: { current: new Set() },
});

export default function CacheProvider({ children }: { children: React.ReactNode }) {
	const cachedRouteRef = useRef<RouteCacheMap>(new Map());
	const cachedMarkerRef = useRef<MarkerCacheMap>(new Map());
	const usedRouteRef = useRef<Set<string>>(new Set());
	const usedMarkerRef = useRef<Set<string>>(new Set());

	return (
		<CacheContext.Provider value={{ cachedRouteRef, cachedMarkerRef, usedRouteRef, usedMarkerRef }}>
			{children}
		</CacheContext.Provider>
	);
}
