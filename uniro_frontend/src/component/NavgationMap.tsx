import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import useMap from "../hooks/useMap";
import {
	CautionRoute,
	DangerRoute,
	NavigationButtonRouteType,
	NavigationRouteList,
	NavigationRouteListRecordWithMetaData,
	RouteDetail,
} from "../types/route";
import { Markers } from "../constant/enum/markerEnum";
import useRoutePoint from "../hooks/useRoutePoint";
import { AdvancedMarker } from "../types/marker";
import { Direction } from "framer-motion";
import { createRiskMarkers } from "../utils/markers/createRiskMarker";
import MapContext from "../map/mapContext";
import createMarkerElement from "../utils/markers/createMarkerElement";

type MapProps = {
	style?: React.CSSProperties;
	routeResult: NavigationRouteListRecordWithMetaData;
	risks: {
		dangerRoutes: DangerRoute[];
		cautionRoutes: CautionRoute[];
	};
	buttonState: NavigationButtonRouteType;
	isDetailView: boolean;
	topPadding?: number;
	bottomPadding?: number;
	currentRouteIdx: number;
	handleCautionMarkerClick: (index: number, isDetailView: boolean) => void;
	setCautionRouteIdx: Dispatch<SetStateAction<number>>;
};

// TODO: useEffect로 경로가 모두 로딩된 이후에 마커가 생성되도록 수정하기
// TODO: 경로 로딩 완료시 살짝 zoomIn 하는 부분 구현하기

const polylineConfig = {
	"PEDES & SAFE": { strokeColor: "#0252c9" },
	"PEDES & CAUTION": { strokeColor: "0252c9" },
	"ELECTRIC & SAFE": { strokeColor: "#00c5b8" },
	"ELECTRIC & CAUTION": { strokeColor: "#ff8000" },
	"MANUAL & SAFE": { strokeColor: "#00c5b8" },
	"MANUAL & CAUTION": { strokeColor: "#ff8000" },
};
const dashSymbol = {
	path: "M 0,-1 0,1",
	strokeOpacity: 1,
	scale: 3,
};

interface PolylineSet {
	startBuildingPath: google.maps.Polyline;
	endingBuildingPath: google.maps.Polyline;
	paths: google.maps.Polyline;
	bounds: google.maps.LatLngBounds;
}

type CompositeRoutesRecord = Partial<Record<NavigationButtonRouteType, PolylineSet>>;

const NavigationMap = ({
	style,
	routeResult,
	risks,
	isDetailView,
	buttonState,
	topPadding = 0,
	bottomPadding = 0,
	currentRouteIdx,
	handleCautionMarkerClick,
}: MapProps) => {
	const { createAdvancedMarker, createPolyline } = useContext(MapContext);
	const { mapRef, map } = useMap();

	const PADDING_FOR_MAP_BOUNDARY = window.innerWidth * 0.1;

	const {
		originMarkerElementWithName,
		destinationMarkerElementWithName,
		waypointMarkerElement,
		numberedWaypointMarkerElement,
		cautionMarkerElement,
	} = createMarkerElement();

	const buttonStateRef = useRef(buttonState);
	const isDetailViewRef = useRef(isDetailView);

	useEffect(() => {
		isDetailViewRef.current = isDetailView;
	}, [isDetailView]);

	// Listener들이 항상 최신 buttonStateRef를 참조하도록 ref 사용
	useEffect(() => {
		buttonStateRef.current = buttonState;
	}, [buttonState]);

	const { origin, destination } = useRoutePoint();

	const boundsRef = useRef<google.maps.LatLngBounds | null>(null);
	const dyamicMarkersRef = useRef<AdvancedMarker[]>([]);

	if (!style) {
		style = { height: "100%", width: "100%" };
	}

	// 길을 그리는 Method
	const createCompositeRoute = useCallback(
		(routeData: NavigationRouteList): PolylineSet | null => {
			if (!origin || !destination) return null;
			if (routeData.routes.length === 0) return null;
			const { routes } = routeData;

			const bounds = new google.maps.LatLngBounds();

			bounds.extend({ lat: origin!.lat, lng: origin!.lng });
			bounds.extend({ lat: destination!.lat, lng: destination!.lng });

			// // 시작 건물과 첫번째 노드를 잇는 경로
			const startingBuildingPath: google.maps.LatLngLiteral[] = [origin, routes[0].node1];
			// 마지막 노드와 도착 건물을 잇는 경로
			const endingBuildingPath: google.maps.LatLngLiteral[] = [routes[routes.length - 1].node2, destination];
			// 본 경로 (첫번째 노드와 그 이후 노드들을 잇는 경로)
			const mainPath: google.maps.LatLngLiteral[] = [routes[0].node1, ...routes.map((el) => el.node2)];

			// 경로의 bounds 업데이트
			mainPath.forEach((coord) => bounds.extend(coord));

			// // 시작 Polyline (점선)
			const startPolyline = createPolyline({
				path: startingBuildingPath,
				strokeOpacity: 0,
				strokeColor: "#000000",
				icons: [
					{
						icon: dashSymbol,
						offset: "0",
						repeat: "20px",
					},
				],
				geodesic: true,
			});
			// 종료 Polyline (점선)
			const endPolyline = createPolyline({
				path: endingBuildingPath,
				strokeOpacity: 0,
				strokeColor: "#000000",
				icons: [
					{
						icon: dashSymbol,
						offset: "2",
						repeat: "20px",
					},
				],
				geodesic: true,
			});

			// 본 경로 Polyline (실제 경로 선)
			const mainPolyline = createPolyline({
				path: mainPath,
				strokeOpacity: 1,
				strokeColor: "#000000",
				strokeWeight: 5.0,
				geodesic: true,
			});

			return {
				startBuildingPath: startPolyline!,
				endingBuildingPath: endPolyline!,
				paths: mainPolyline!,
				bounds,
			};
		},
		[origin, destination],
	);

	const compositeRoutes: CompositeRoutesRecord = useMemo(() => {
		if (!routeResult) return {};
		if (!origin || !destination) return {};
		const record: CompositeRoutesRecord = {};

		Object.entries(routeResult).forEach(([key, routeData]) => {
			// key는 NavigationButtonRouteType 형식으로 가정
			if (typeof routeData === "object" && "routes" in routeData && routeData.routes.length > 0) {
				const composite = createCompositeRoute(routeData);
				if (composite) record[key as NavigationButtonRouteType] = composite;
			}
		});
		return record;
	}, [routeResult]);

	useEffect(() => {
		if (!map || !compositeRoutes) return;
		// 활성화된 버튼 타입에 해당하는 Composite Polyline만 지도에 추가
		const activeComposite = compositeRoutes[buttonState];

		if (activeComposite) {
			activeComposite.startBuildingPath.setMap(map);
			activeComposite.endingBuildingPath.setMap(map);
			activeComposite.paths.setMap(map);
			activeComposite.paths.setOptions(polylineConfig[buttonState as keyof typeof polylineConfig]);
		}

		return () => {
			Object.values(compositeRoutes).forEach((composite) => {
				composite!.startBuildingPath.setMap(null);
				composite!.endingBuildingPath.setMap(null);
				composite!.paths.setMap(null);
			});
		};
	}, [map, buttonState, compositeRoutes]);

	useEffect(() => {
		if (!map) return;
		const activeBounds = compositeRoutes[buttonState]?.bounds;

		if (!activeBounds) return;

		map.fitBounds(activeBounds!, {
			top: topPadding,
			right: PADDING_FOR_MAP_BOUNDARY,
			bottom: bottomPadding,
			left: PADDING_FOR_MAP_BOUNDARY,
		});
		return () => {
			map.fitBounds(activeBounds!, {
				top: topPadding,
				right: PADDING_FOR_MAP_BOUNDARY,
				bottom: bottomPadding,
				left: PADDING_FOR_MAP_BOUNDARY,
			});
		};
	}, [map, bottomPadding, topPadding, currentRouteIdx, buttonState, compositeRoutes]);

	const createStartEndMarkers = () => {
		if (!map || !origin || !destination) return;
		// 출발지 마커
		const originMarkerElement = originMarkerElementWithName({
			name: origin?.buildingName,
			hasAnimation: true,
		});

		const originMarker = createAdvancedMarker(
			{
				map: map,
				position: origin,
				content: originMarkerElement,
			},
			() => {
				handleCautionMarkerClick(0, isDetailViewRef.current);
			},
		);

		// 도착지 마커
		const destinationMarkerElement = destinationMarkerElementWithName({
			name: destination?.buildingName,
			hasAnimation: true,
		});
		const destinationMarker = createAdvancedMarker(
			{
				map: map,
				position: destination,
				content: destinationMarkerElement,
			},
			() => {
				handleCautionMarkerClick(
					routeResult[buttonStateRef.current].routeDetails.length,
					isDetailViewRef.current,
				);
			},
		);

		// bounds 업데이트
		boundsRef.current?.extend(origin);
		boundsRef.current?.extend(destination);

		return [originMarker, destinationMarker];
	};

	const areCoordinatesEqual = (
		coord1: google.maps.LatLng | google.maps.LatLngLiteral | google.maps.LatLngAltitudeLiteral,
		coord2: google.maps.LatLng | google.maps.LatLngLiteral | google.maps.LatLngAltitudeLiteral,
	) => {
		return coord1.lat === coord2.lat && coord1.lng === coord2.lng;
	};

	const areMarkersEqual = (
		prevMarker: AdvancedMarker,
		newMarkerData: { coordinates: google.maps.LatLngLiteral; type: Markers; hasAnimation: boolean },
	) => {
		const prevPosition = prevMarker.position!;
		return areCoordinatesEqual(prevPosition, newMarkerData.coordinates);
	};

	const createStaticMarkers = (
		routeData: NavigationRouteList,
		map: google.maps.Map,
		prevMarkers: AdvancedMarker[] = [],
	): AdvancedMarker[] => {
		const markers: AdvancedMarker[] = [];
		const bounds = new google.maps.LatLngBounds();

		if (!routeData?.routeDetails) return markers;

		routeData.routeDetails.forEach((routeDetail, index) => {
			const { coordinates } = routeDetail;
			bounds.extend(coordinates);
			const markerType =
				routeDetail.cautionFactors && routeDetail.cautionFactors.length > 0
					? Markers.CAUTION
					: Markers.WAYPOINT;
			const hasAnimation = true;
			const newMarkerData = { coordinates, type: markerType, hasAnimation };

			// 2. 기존 마커가 있고, 좌표와 타입이 동일하면 재사용
			if (prevMarkers[index] && areMarkersEqual(prevMarkers[index], newMarkerData)) {
				const existingMarker = prevMarkers[index];
				existingMarker.position = coordinates;
				markers.push(existingMarker);
			} else {
				// 3. 기존 마커가 없거나 일치하지 않으면 새로 생성
				const markerElement =
					markerType === Markers.WAYPOINT
						? waypointMarkerElement({
								hasAnimation: true,
							})
						: cautionMarkerElement({
								hasAnimation: true,
							});

				const marker = createAdvancedMarker(
					{
						map: map,
						position: coordinates,
						content: markerElement,
					},
					() => {
						handleCautionMarkerClick(index + 1, isDetailViewRef.current);
					},
				);
				if (marker) markers.push(marker);
			}
		});

		return markers;
	};

	const staticMarkersRef = useRef<AdvancedMarker[]>([]);

	useEffect(() => {
		if (!map || !origin || !destination) return;

		const newMarkers = createStaticMarkers(routeResult[buttonState], map, staticMarkersRef.current);
		// 기존 마커 제거, includes로 새로운 마커가 기존 마커에 포함되어 있는지 확인
		// 단점 : 마커가 길어지면 복잡해질 수 있지만, 깜박임 현상을 방지하고 repaint를 줄일 수 있는 장점이 있음.
		staticMarkersRef.current.forEach((oldMarker) => {
			if (!newMarkers.includes(oldMarker)) {
				oldMarker.map = null; // 지도에서 제거
			}
		});

		staticMarkersRef.current = [];
		staticMarkersRef.current = newMarkers;

		const currentRoute = routeResult[buttonState];
		if (!currentRoute) return;
	}, [map, buttonState, routeResult]);

	useEffect(() => {
		if (!map || !risks) return;
		createRiskMarkers(risks.dangerRoutes, map, createAdvancedMarker);
		createStartEndMarkers();
	}, [map, risks, origin, destination, createAdvancedMarker]);

	// 동적 마커 그리는 부분
	const drawDynamicMarker = (routeResult: NavigationRouteList) => {
		if (!map) return;
		if (isDetailView) {
			const { routeDetails } = routeResult;
			dyamicMarkersRef.current = [];
			// [그림] 마커 찍기
			routeDetails.forEach((routeDetail, index) => {
				if (index === routeDetails.length - 1) return;
				const { coordinates } = routeDetail;
				const markerElement = numberedWaypointMarkerElement({
					number: index + 1,
					hasAnimation: true,
				});

				const marker = createAdvancedMarker(
					{
						map: map,
						position: coordinates,
						content: markerElement,
					},
					() => {
						handleCautionMarkerClick(index + 1, isDetailViewRef.current);
					},
				);

				if (marker) dyamicMarkersRef.current.push(marker);
			});
		}
	};

	const fadeOutDynamicMarker = () => {
		dyamicMarkersRef.current.forEach((marker) => {
			const markerElement = marker.content as HTMLElement;
			if (markerElement) {
				markerElement.classList.add("fade-out");
				setTimeout(() => {
					marker.map = null;
				}, 300);
			} else {
				marker.map = null;
			}
		});
		dyamicMarkersRef.current = [];
	};

	useEffect(() => {
		if (!map) return;
		if (currentRouteIdx === -1) return;
		const currentRoute = routeResult[buttonState];
		if (!currentRoute) return;

		const addOriginAndDestination = (routes: RouteDetail[]) => {
			return [
				{
					dist: 0,
					directionType: "origin" as Direction,
					coordinates: { lat: origin!.lat, lng: origin!.lng },
					cautionFactors: [],
				},
				...routes.slice(0, -1),
				{
					dist: 0,
					directionType: "finish" as Direction,
					coordinates: { lat: destination!.lat, lng: destination!.lng },
					cautionFactors: [],
				},
			];
		};

		// 다음 구간까지의 길을 합쳐서 bounds를 계산
		const { routeDetails } = currentRoute;
		const modifiedRouteDetails = addOriginAndDestination(routeDetails);
		const currentRouteDetail = modifiedRouteDetails[currentRouteIdx];

		const bounds = new google.maps.LatLngBounds();
		bounds.extend(currentRouteDetail.coordinates);
		if (currentRouteIdx !== modifiedRouteDetails.length - 1) {
			const nextRouteDetail = modifiedRouteDetails[currentRouteIdx + 1];
			bounds.extend(nextRouteDetail.coordinates);
		}
		boundsRef.current = bounds;
		map.fitBounds(bounds, {
			top: topPadding,
			right: PADDING_FOR_MAP_BOUNDARY,
			bottom: bottomPadding,
			left: PADDING_FOR_MAP_BOUNDARY,
		});
	}, [map, currentRouteIdx, buttonState, routeResult]);

	useEffect(() => {
		if (!map) return;
		drawDynamicMarker(routeResult[buttonState]);
		return fadeOutDynamicMarker;
	}, [isDetailView, map, routeResult, buttonState]);
	return <div id="map" ref={mapRef} style={style} />;
};

export default NavigationMap;
