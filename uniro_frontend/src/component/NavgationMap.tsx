import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useMap from "../hooks/useMap";
import {
	CautionRoute,
	DangerRoute,
	NavigationButtonRouteType,
	NavigationRouteList,
	NavigationRouteListRecordWithMetaData,
} from "../data/types/route";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";
import createMarkerElement from "../components/map/mapMarkers";
import { Markers } from "../constant/enum/markerEnum";
import useRoutePoint from "../hooks/useRoutePoint";
import { AdvancedMarker } from "../data/types/marker";
import { interpolate } from "../utils/interpolate";

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
}: MapProps) => {
	const { mapRef, map, AdvancedMarker, Polyline } = useMap();
	const { origin, destination } = useRoutePoint();

	const boundsRef = useRef<google.maps.LatLngBounds | null>(null);
	const dyamicMarkersRef = useRef<AdvancedMarker[]>([]);

	if (!style) {
		style = { height: "100%", width: "100%" };
	}

	// 길을 그리는 부분
	const createCompositeRoute = useCallback(
		(routeData: NavigationRouteList): PolylineSet | null => {
			if (!Polyline) return null;
			if (!origin || !destination) return null;
			if (routeData.routes.length === 0) return null;
			const { routes } = routeData;

			const bounds = new google.maps.LatLngBounds();

			bounds.extend({ lat: origin!.lat, lng: origin!.lng });
			bounds.extend({ lat: destination!.lat, lng: destination!.lng });

			// // 시작 건물과 첫번째 노드를 잇는 경로
			const startingBuildingPath: google.maps.LatLngLiteral[] = [routes[0].node1, routes[0].node1];
			// 마지막 노드와 도착 건물을 잇는 경로
			const endingBuildingPath: google.maps.LatLngLiteral[] = [
				routes[routes.length - 1].node2,
				routes[routes.length - 1].node2,
			];
			// 본 경로 (첫번째 노드와 그 이후 노드들을 잇는 경로)
			const mainPath: google.maps.LatLngLiteral[] = [routes[0].node1, ...routes.map((el) => el.node2)];

			// 경로의 bounds 업데이트
			mainPath.forEach((coord) => bounds.extend(coord));

			// // 시작 Polyline (점선)
			const startPolyline = new Polyline({
				path: startingBuildingPath,
				strokeOpacity: 1,
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

			// 본 경로 Polyline (실제 경로 선)
			const mainPolyline = new Polyline({
				path: mainPath,
				strokeOpacity: 1,
				strokeColor: "#000000",
				strokeWeight: 5.0,
				geodesic: true,
			});

			// // 종료 Polyline (점선)
			const endPolyline = new Polyline({
				path: endingBuildingPath,
				strokeOpacity: 1,
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

			return {
				startBuildingPath: startPolyline,
				endingBuildingPath: endPolyline,
				paths: mainPolyline,
				bounds,
			};
		},
		[Polyline],
	);

	const compositeRoutes: CompositeRoutesRecord = useMemo(() => {
		if (!routeResult || !Polyline) return {};
		if (!origin || !destination) return {};
		const record: CompositeRoutesRecord = {};
		Object.entries(routeResult).forEach(([key, routeData]) => {
			// key는 NavigationButtonRouteType 형식으로 가정
			if (typeof routeData !== "number" && routeData.routes.length > 0) {
				const composite = createCompositeRoute(routeData);
				if (composite) record[key as NavigationButtonRouteType] = composite;
			}
		});
		return record;
	}, [routeResult, Polyline, createCompositeRoute]);

	useEffect(() => {
		if (!map || !compositeRoutes) return;
		// 활성화된 버튼 타입에 해당하는 Composite Polyline만 지도에 추가
		const activeComposite = compositeRoutes[buttonState];

		if (activeComposite) {
			activeComposite.startBuildingPath.setMap(map);
			activeComposite.endingBuildingPath.setMap(map);
			activeComposite.paths.setMap(map);
			activeComposite.paths.setOptions(polylineConfig[buttonState]);
			map.fitBounds(activeComposite.bounds, {
				top: topPadding,
				right: 30,
				bottom: bottomPadding,
			});
		}

		return () => {
			Object.values(compositeRoutes).forEach((composite) => {
				composite!.startBuildingPath.setMap(null);
				composite!.endingBuildingPath.setMap(null);
				composite!.paths.setMap(null);
			});
		};
	}, [map, buttonState, compositeRoutes, topPadding, bottomPadding]);

	const createRiskMarkers = (
		riskData: DangerRoute[] | CautionRoute[],
		map: google.maps.Map,
		AdvancedMarker: typeof google.maps.marker.AdvancedMarkerElement,
	): AdvancedMarker[] => {
		const markers: AdvancedMarker[] = [];
		riskData.forEach((route) => {
			const marker = createAdvancedMarker(
				AdvancedMarker,
				map,
				interpolate(route.node1, route.node2, 0.5),
				createMarkerElement({
					type: Markers.DANGER,
					className: "translate-marker",
					hasAnimation: true,
				}),
			);
			markers.push(marker);
		});
		return markers;
	};

	const createStartEndMarkers = () => {
		if (!map || !origin || !destination || !AdvancedMarker) return;
		// 출발지 마커
		const originMarkerElement = createMarkerElement({
			type: Markers.ORIGIN,
			title: origin?.buildingName ?? "출발지",
			className: "translate-routemarker",
			hasAnimation: true,
		});
		const originMarker = createAdvancedMarker(AdvancedMarker, map, origin, originMarkerElement);

		// 도착지 마커
		const destinationMarkerElement = createMarkerElement({
			type: Markers.DESTINATION,
			title: destination?.buildingName ?? "도착지",
			className: "translate-routemarker",
			hasAnimation: true,
		});
		const destinationMarker = createAdvancedMarker(AdvancedMarker, map, destination, destinationMarkerElement);
		return [originMarker, destinationMarker];
	};

	useEffect(() => {
		if (!map || !risks || !AdvancedMarker) return;
		createRiskMarkers(risks.dangerRoutes, map, AdvancedMarker);
		createStartEndMarkers();
	}, [map, risks, origin, destination, AdvancedMarker]);

	// 정적 마커 그리는 부분
	const createStaticMarkers = (
		routeData: NavigationRouteList,
		map: google.maps.Map,
		AdvancedMarker: typeof google.maps.marker.AdvancedMarkerElement,
		prevMarkers?: AdvancedMarker[],
	): AdvancedMarker[] => {
		const markers: AdvancedMarker[] = [];
		const bounds = new google.maps.LatLngBounds();

		// 경로 간선 – 각 routeDetail에 대해 waypoint 마커 (주의 정보가 있으면 caution 마커)
		// 이전 마커와 현재 마커의 개수가 다르면 다른 길로 간주하고 마커를 다시 생성
		if (prevMarkers?.length !== routeData.routeDetails.length) {
			routeData.routeDetails.forEach((routeDetail) => {
				const { coordinates } = routeDetail;
				bounds.extend(coordinates);
				let markerElement = createMarkerElement({
					type: Markers.WAYPOINT,
					className: "translate-waypoint",
					hasAnimation: true,
				});
				if (routeDetail.cautionFactors && routeDetail.cautionFactors.length > 0) {
					markerElement = createMarkerElement({
						type: Markers.CAUTION,
						className: "translate-routemarker",
						hasAnimation: true,
					});
				}
				const marker = createAdvancedMarker(AdvancedMarker, map, coordinates, markerElement);
				markers.push(marker);
			});
			return markers;
		}

		// 마커 재사용 로직
		routeData.routeDetails.forEach((routeDetail, index) => {
			const { coordinates } = routeDetail;
			bounds.extend(coordinates);

			// 이전 좌표와 동일한 좌표이면 이전 마커를 그대로 사용
			if (prevMarkers && prevMarkers[index]) {
				const { position } = prevMarkers[index];
				const { lat, lng } = position!;
				if (Number(lat) === Number(coordinates.lat) && Number(lng) === Number(coordinates.lng)) {
					const markerElement = prevMarkers[index];
					markers.push(markerElement);
				}
				return;
			}
			let markerElement = createMarkerElement({
				type: Markers.WAYPOINT,
				className: "translate-waypoint",
				hasAnimation: true,
			});

			if (routeDetail.cautionFactors && routeDetail.cautionFactors.length > 0) {
				markerElement = createMarkerElement({
					type: Markers.CAUTION,
					className: "translate-routemarker",
					hasAnimation: true,
				});
			}
			const marker = createAdvancedMarker(AdvancedMarker, map, coordinates, markerElement);
			markers.push(marker);
		});
		return markers;
	};

	const staticMarkersRef = useRef<AdvancedMarker[]>([]);

	useEffect(() => {
		if (!map || !origin || !destination || !AdvancedMarker) return;

		const newMarkers = createStaticMarkers(routeResult[buttonState], map, AdvancedMarker, staticMarkersRef.current);
		// 기존 마커 제거, includes로 새로운 마커가 기존 마커에 포함되어 있는지 확인
		// 단점 : 마커가 길어지면 복잡해질 수 있지만, 깜빡임 현상을 방지할 수 있음
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
	// 동적 마커 그리는 부분
	const drawDynamicMarker = (routeResult: NavigationRouteList) => {
		if (!AdvancedMarker || !map) return;
		if (isDetailView) {
			const { routeDetails } = routeResult;
			dyamicMarkersRef.current = [];
			// [그림] 마커 찍기
			routeDetails.forEach((routeDetail, index) => {
				const { coordinates } = routeDetail;
				const markerElement = createMarkerElement({
					type: Markers.NUMBERED_WAYPOINT,
					number: index + 1,
					hasAnimation: true,
				});

				const marker = createAdvancedMarker(AdvancedMarker, map, coordinates, markerElement);

				dyamicMarkersRef.current.push(marker);
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
		if (!map || !boundsRef.current) return;
		map.fitBounds(boundsRef.current, {
			top: topPadding,
			right: 30,
			bottom: bottomPadding,
			left: 30,
		});
	}, [map, bottomPadding, topPadding]);

	useEffect(() => {
		if (!AdvancedMarker || !map) return;
		drawDynamicMarker(routeResult[buttonState]);
		return fadeOutDynamicMarker;
	}, [isDetailView, AdvancedMarker, map, routeResult, buttonState]);

	return <div id="map" ref={mapRef} style={style} />;
};

export default NavigationMap;
