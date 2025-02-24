import { useContext, useEffect, useRef, useState } from "react";
import useMap from "../hooks/useMap";
import { Building, NodeId } from "../types/node";
import MapBottomSheet from "../components/map/mapBottomSheet";
import { MapTopBuildingSheet, MapTopRouteSheet } from "../components/map/TopSheet";
import { CautionToggleButton, DangerToggleButton, ReportButton } from "../components/map/floatingButtons";
import useRoutePoint from "../hooks/useRoutePoint";
import useSearchBuilding from "../hooks/useSearchBuilding";
import Button from "../components/customButton";
import { AdvancedMarker } from "../types/marker";
import { CoreRoutesList, RouteId, RoutePointType } from "../types/route";
import { RoutePoint } from "../constant/enum/routeEnum";
import { Markers } from "../constant/enum/markerEnum";
import { createUniversityMarker } from "../utils/markers/createAdvanedMarker";
import toggleMarkers from "../utils/markers/toggleMarkers";
import { useNavigate } from "react-router";
import useModal from "../hooks/useModal";
import ReportModal from "../components/map/reportModal";
import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import { University } from "../types/university";
import { CautionIssueType, DangerIssueType, MarkerTypes } from "../types/enum";
import { CautionIssue, DangerIssue } from "../constant/enum/reportEnum";
import { Coord } from "../types/coord";
import AnimatedContainer from "../container/animatedContainer";
import Loading from "../components/loading/loading";
import createMarkerElement from "../utils/markers/createMarkerElement";
import MapContext from "../map/mapContext";

/** API 호출 */
import { useSuspenseQueries } from "@tanstack/react-query";
import { getAllRisks } from "../api/routes";
import { getAllBuildings } from "../api/nodes";
import { getAllRoutes, getNavigationResult } from "../api/route";
import useQueryError from "../hooks/useQueryError";
import { CacheContext } from "../map/mapCacheContext";
import removeAllListener from "../utils/map/removeAllListener";

export type SelectedMarkerTypes = {
	type: MarkerTypes;
	id: NodeId | RouteId;
	element: AdvancedMarker;
	property?: Building;
	factors?: DangerIssueType[] | CautionIssueType[];
};

const BOTTOM_SHEET_HEIGHT = 377;

export default function MapPage() {
	const { createPolyline, createAdvancedMarker, createPolygon } = useContext(MapContext);
	const { cachedMarkerRef, cachedRouteRef, usedRouteRef, usedMarkerRef } = useContext(CacheContext);
	const { map, mapRef } = useMap();
	const [zoom, setZoom] = useState<number>(16);
	const prevZoom = useRef<number>(16);

	const {
		cautionMarkerElement,
		dangerMarkerElement,
		buildingMarkerElement,
		selectedBuildingMarkerElement,
		originMarkerElementWithName,
		destinationMarkerElementWithName,
	} = createMarkerElement();

	const [selectedMarker, setSelectedMarker] = useState<SelectedMarkerTypes>();
	const buildingBoundary = useRef<google.maps.LatLngBounds | null>(null);
	const [buildingMarkers, setBuildingMarkers] = useState<{ element: AdvancedMarker; nodeId: NodeId; name: string }[]>(
		[],
	);

	const [dangerMarkers, setDangerMarkers] = useState<{ element: AdvancedMarker; routeId: RouteId }[]>([]);
	const [isDangerAcitve, setIsDangerActive] = useState<boolean>(false);

	const [cautionMarkers, setCautionMarkers] = useState<{ element: AdvancedMarker; routeId: RouteId }[]>([]);
	const [isCautionAcitve, setIsCautionActive] = useState<boolean>(false);

	const [universityMarker, setUniversityMarker] = useState<AdvancedMarker>();

	const { origin, setOrigin, destination, setDestination } = useRoutePoint();
	const { building: selectedBuilding, setBuilding, searchMode, setSearchMode } = useSearchBuilding();

	const [_, isOpen, open, close] = useModal();

	const { university } = useUniversityInfo();

	useRedirectUndefined<University | undefined>([university]);

	const polylines = useRef<google.maps.Polyline[]>([]);
	const polygon = useRef<google.maps.Polygon>();

	const navigate = useNavigate();
	if (!university) return;

	const [FailModal, { status, data, isFetching, refetch: findFastRoute }] = useQueryError(
		{
			queryKey: ["fastRoute", university.id, origin?.nodeId, destination?.nodeId],
			queryFn: () =>
				getNavigationResult(
					university.id,
					origin ? origin?.nodeId : -1,
					destination ? destination?.nodeId : -1,
				),
			enabled: false,
			retry: 0,
		},
		undefined,
		() => {
			navigate("/result");
		},
		{
			fallback: {
				400: {
					mainTitle: "잘못된 요청입니다.",
					subTitle: ["새로고침 후 다시 시도 부탁드립니다."],
				},
				404: {
					mainTitle: "해당 경로를 찾을 수 없습니다.",
					subTitle: ["해당 건물이 길이랑 연결되지 않았습니다."],
				},
				422: {
					mainTitle: "해당 경로를 찾을 수 없습니다.",
					subTitle: ["위험 요소 버튼을 클릭하여,", "통행할 수 없는 원인을 파악하실 수 있습니다."],
				},
			},
		},
	);

	const results = useSuspenseQueries({
		queries: [
			{ queryKey: [university.id, "risks"], queryFn: () => getAllRisks(university.id) },
			{
				queryKey: [university.id, "buildings"],
				queryFn: () =>
					getAllBuildings(university.id, {
						leftUpLat: 35,
						leftUpLng: 126,
						rightDownLat: 38,
						rightDownLng: 130,
					}),
				refetchInterval: 300000,
			},
			{
				queryKey: ["routes", university.id],
				queryFn: () => getAllRoutes(university.id),
				refetchInterval: 300000,
			},
		],
	});

	const [risks, buildings, routes] = results;

	const moveToBound = (coord: Coord, padding?: number | google.maps.Padding) => {
		buildingBoundary.current = new google.maps.LatLngBounds();
		buildingBoundary.current.extend(coord);
		map?.fitBounds(buildingBoundary.current, padding);
	};

	const exitBound = () => {
		buildingBoundary.current = null;
	};

	const initMap = () => {
		if (!map || !university) return;
		map.setCenter(university.centerPoint);
		map.addListener("click", (e: unknown) => {
			exitBound();
			setSelectedMarker(undefined);
		});
		map.addListener("zoom_changed", () => {
			setZoom((prev) => {
				const curZoom = map.getZoom() as number;
				prevZoom.current = prev;

				return curZoom;
			});
		});

		const centerMarker = createAdvancedMarker({
			map: map,
			position: university.centerPoint,
			content: createUniversityMarker(university ? university.name : ""),
		});

		setUniversityMarker(centerMarker);
	};

	const addBuildings = () => {
		if (!map) return;

		const buildingList = buildings.data;
		const buildingMarkersWithID: { nodeId: NodeId; element: AdvancedMarker; name: string }[] = [];

		for (const building of buildingList) {
			const { nodeId, lat, lng, buildingName } = building;

			const buildingMarker = createAdvancedMarker(
				{
					map: map,
					position: new google.maps.LatLng(lat, lng),
					content: buildingMarkerElement({ className: "translate-building" }),
				},
				(self) => {
					setSelectedMarker({
						id: nodeId,
						type: Markers.BUILDING,
						element: self,
						property: building,
					});
				},
			);
			if (!buildingMarker) return;

			buildingMarkersWithID.push({ nodeId: nodeId ? nodeId : -1, element: buildingMarker, name: buildingName });
		}

		setBuildingMarkers(buildingMarkersWithID);
	};

	const onClickRiskMarker = (
		self: AdvancedMarker,
		routeId: RouteId,
		type: MarkerTypes,
		factors: DangerIssueType[] | CautionIssueType[],
	) => {
		setSelectedMarker((prevMarker) => {
			if (prevMarker && prevMarker.id === routeId) {
				return undefined;
			}
			return {
				id: routeId,
				type: type,
				element: self,
				factors: factors,
			};
		});
	};

	const addRiskMarker = () => {
		if (!map) return;

		let isReDraw = false;

		if (usedMarkerRef.current!.size !== 0) isReDraw = true;

		const usedKeys = new Set();

		const { dangerRoutes, cautionRoutes } = risks.data;

		/** 위험 마커 생성 */
		const dangerMarkersWithId: { routeId: RouteId; element: AdvancedMarker }[] = [];

		for (const route of dangerRoutes) {
			const { routeId, node1, node2, dangerFactors } = route;

			const key = `DANGER_${routeId}`;

			const cachedDangerMarker = cachedMarkerRef.current!.get(key);

			if (cachedDangerMarker) {
				if (!isReDraw) {
					usedMarkerRef.current!.add(key);
				} else {
					usedKeys.add(key);
				}

				removeAllListener(cachedDangerMarker);
				cachedDangerMarker.map = zoom <= 16 ? null : map;
				cachedDangerMarker.addListener("click", () =>
					onClickRiskMarker(cachedDangerMarker, routeId, Markers.DANGER, dangerFactors),
				);
				dangerMarkersWithId.push({ routeId, element: cachedDangerMarker });

				continue;
			}

			const dangerMarker = createAdvancedMarker(
				{
					map: null,
					position: {
						lat: (node1.lat + node2.lat) / 2,
						lng: (node1.lng + node2.lng) / 2,
					},
					content: dangerMarkerElement({}),
				},
				(self) => onClickRiskMarker(self, routeId, Markers.DANGER, dangerFactors),
			);
			if (!dangerMarker) continue;

			cachedMarkerRef.current!.set(key, dangerMarker);
			dangerMarkersWithId.push({ routeId, element: dangerMarker });
		}
		setDangerMarkers(dangerMarkersWithId);

		/** 주의 마커 생성 */
		const cautionMarkersWithId: { routeId: RouteId; element: AdvancedMarker }[] = [];

		for (const route of cautionRoutes) {
			const { routeId, node1, node2, cautionFactors } = route;

			const key = `CAUTION_${routeId}`;

			const cachedCautionMarker = cachedMarkerRef.current!.get(key);

			if (cachedCautionMarker) {
				if (!isReDraw) {
					usedMarkerRef.current!.add(key);
				} else {
					usedKeys.add(key);
				}

				removeAllListener(cachedCautionMarker);
				cachedCautionMarker.addListener("click", () =>
					onClickRiskMarker(cachedCautionMarker, routeId, Markers.CAUTION, cautionFactors),
				);
				cachedCautionMarker.map = zoom <= 16 ? null : map;
				cautionMarkersWithId.push({ routeId, element: cachedCautionMarker });

				continue;
			}

			const cautionMarker = createAdvancedMarker(
				{
					map: null,
					position: {
						lat: (node1.lat + node2.lat) / 2,
						lng: (node1.lng + node2.lng) / 2,
					},
					content: cautionMarkerElement({}),
				},
				(self) => onClickRiskMarker(self, routeId, Markers.CAUTION, cautionFactors),
			);

			if (!cautionMarker) continue;

			cachedMarkerRef.current!.set(key, cautionMarker);
			cautionMarkersWithId.push({ routeId, element: cautionMarker });
		}
		setCautionMarkers(cautionMarkersWithId);

		if (isReDraw) {
			// @ts-expect-error : Difference Method need Polyfill
			const deleteKeys = usedMarkerRef.current!.difference(usedKeys) as Set<string>;

			deleteKeys.forEach((key) => {
				cachedMarkerRef.current!.get(key)!.map = null;
				cachedMarkerRef.current!.delete(key);
			});
		}
	};

	const toggleCautionButton = () => {
		if (!map || !university) return;
		if (zoom <= 16) {
			map.setOptions({
				zoom: 17,
				center: university.centerPoint,
			});
		}
		setIsCautionActive((isActive) => {
			toggleMarkers(
				!isActive,
				cautionMarkers.map((marker) => marker.element),
				map,
			);
			return !isActive;
		});
	};
	const toggleDangerButton = () => {
		if (!map || !university) return;
		if (zoom <= 16) {
			map.setOptions({
				zoom: 17,
				center: university.centerPoint,
			});
		}
		setIsDangerActive((isActive) => {
			toggleMarkers(
				!isActive,
				dangerMarkers.map((marker) => marker.element),
				map,
			);
			return !isActive;
		});
	};

	/** 선택된 마커의 출처 (Marker, List), Type을 비교하여 출발지, 도착지 지정 */
	const selectRoutePoint = (type?: RoutePointType) => {
		if (!selectedMarker || !selectedMarker.property || selectedMarker.type !== Markers.BUILDING) return;

		if (type) {
			switch (type) {
				case RoutePoint.ORIGIN:
					if (selectedMarker.id === destination?.nodeId) setDestination(undefined);
					setOrigin(selectedMarker.property);
					break;
				case RoutePoint.DESTINATION:
					if (selectedMarker.id === origin?.nodeId) setOrigin(undefined);
					setDestination(selectedMarker.property);
					break;
			}
		} else {
			if (!origin) setOrigin(selectedMarker.property);
			else setDestination(selectedMarker.property);
		}

		exitBound();
		setSelectedMarker(undefined);
	};

	/** isSelect(Marker 선택 시) Marker Content 변경, 지도 이동, BottomSheet 열기 */
	const changeMarkerStyle = (marker: SelectedMarkerTypes | undefined, isSelect: boolean) => {
		if (!map || !marker) return;

		marker.element.zIndex = isSelect ? 100 : 1;

		switch (marker.type) {
			case Markers.CAUTION:
				if (isSelect) {
					marker.element.content = cautionMarkerElement({
						factors: (marker.factors as CautionIssueType[]).map((key) => CautionIssue[key]),
					});
					return;
				} else {
					marker.element.content = cautionMarkerElement({});
					return;
				}
			case Markers.DANGER:
				if (isSelect) {
					marker.element.content = dangerMarkerElement({
						factors: (marker.factors as DangerIssueType[]).map((key) => DangerIssue[key]),
					});
					return;
				} else {
					marker.element.content = dangerMarkerElement({});
					return;
				}
			case Markers.BUILDING:
				if (!marker.property) return;

				if (marker.id === origin?.nodeId || marker.id === destination?.nodeId) return;

				if (isSelect) {
					marker.element.content = selectedBuildingMarkerElement({ name: marker.property.buildingName });
					return;
				} else {
					marker.element.content = buildingMarkerElement({
						name: marker.property.buildingName,
						className: "translate-namedmarker",
					});
					return;
				}
		}
	};

	const findBuildingMarker = (id: NodeId): AdvancedMarker | undefined => {
		const matchedMarker = buildingMarkers.find((el) => el.nodeId === id)?.element;

		return matchedMarker;
	};

	const drawPolygon = () => {
		const polygonPath = university.areaPolygon;
		const areaPolygon = createPolygon({
			map: map,
			paths: polygonPath,
			fillColor: "#ff2d55",
			fillOpacity: 0.1,
			strokeColor: "#ff2d55",
			strokeOpacity: 0.5,
		});

		polygon.current = areaPolygon;
	};

	/** 초기 렌더링 시, 건물 | 위험 | 주의 마커 생성 */
	useEffect(() => {
		initMap();
		addBuildings();
		drawPolygon();
	}, [map]);

	/** 선택된 마커가 있는 경우 */
	useEffect(() => {
		changeMarkerStyle(selectedMarker, true);
		return () => {
			changeMarkerStyle(selectedMarker, false);
		};
	}, [selectedMarker]);

	/** 빌딩 리스트에서 넘어온 경우, 일치하는 BuildingMarkerElement를 탐색 */
	useEffect(() => {
		if (buildingMarkers.length === 0 || !selectedBuilding || !selectedBuilding.nodeId) return;
		if (!selectedMarker) {
			const matchedMarker = findBuildingMarker(selectedBuilding.nodeId);

			if (!matchedMarker) return;
			if (searchMode === "BUILDING") {
				setSelectedMarker({
					id: selectedBuilding.nodeId,
					type: Markers.BUILDING,
					element: matchedMarker,
					property: selectedBuilding,
				});
				return;
			}
			if (searchMode === "ORIGIN") {
				setOrigin(selectedBuilding);
				moveToBound(selectedBuilding);
				return;
			}
			if (searchMode === "DESTINATION") {
				setDestination(selectedBuilding);
				moveToBound(selectedBuilding);
			}
		}
	}, [selectedBuilding, buildingMarkers]);

	/** 출발지 결정 시, Marker Content 변경 */
	useEffect(() => {
		if (!origin || !origin.nodeId) return;

		const originMarker = findBuildingMarker(origin.nodeId);

		if (!originMarker) return;
		if (searchMode === "BUILDING") setSearchMode("ORIGIN");

		originMarker.map = map;

		originMarker.content = originMarkerElementWithName({ name: origin.buildingName });

		if (origin !== undefined && destination === undefined) {
			moveToBound(origin);
			map?.setZoom(prevZoom.current);
		}

		return () => {
			const curZoom = map?.getZoom() as number;

			const originMarker = findBuildingMarker(origin.nodeId);
			if (!originMarker) return;

			originMarker.content =
				curZoom <= 16
					? buildingMarkerElement({ className: "translate-building" })
					: buildingMarkerElement({ name: origin.buildingName, className: "translate-namedmarker" });
		};
	}, [origin, buildingMarkers]);

	/** 도착지 결정 시, Marker Content 변경 */
	useEffect(() => {
		if (!destination || !destination.nodeId) return;

		const destinationMarker = findBuildingMarker(destination.nodeId);

		if (!destinationMarker) return;
		if (searchMode === "BUILDING") setSearchMode("DESTINATION");

		destinationMarker.map = map;

		destinationMarker.content = destinationMarkerElementWithName({
			name: destination.buildingName,
		});

		if (destination !== undefined && origin === undefined) {
			moveToBound(destination);
			map?.setZoom(prevZoom.current);
		}

		return () => {
			const curZoom = map?.getZoom() as number;

			const destinationMarker = findBuildingMarker(destination.nodeId);
			if (!destinationMarker) return;

			destinationMarker.content =
				curZoom <= 16
					? buildingMarkerElement({ className: "translate-building" })
					: buildingMarkerElement({ name: destination.buildingName, className: "translate-namedmarker" });
		};
	}, [destination, buildingMarkers]);

	/** 출발 도착 설정시, 출발 도착지가 한 눈에 보이도록 지도 조정 */
	useEffect(() => {
		if (!map) return;
		if (origin && destination) {
			setSearchMode("DESTINATION");
			const newBound = new google.maps.LatLngBounds();
			newBound.extend(origin);
			newBound.extend(destination);
			map?.fitBounds(newBound, {
				top: 146,
				left: 50,
				right: 50,
				bottom: 75,
			});
		}
	}, [map, origin, destination]);

	useEffect(() => {
		if (selectedMarker && selectedMarker.type === Markers.BUILDING && selectedMarker.property) {
			moveToBound(
				{ lat: selectedMarker.property.lat, lng: selectedMarker.property.lng },
				{
					top: 0,
					right: 0,
					bottom: BOTTOM_SHEET_HEIGHT,
					left: 0,
				},
			);
			setBuilding(selectedMarker.property as Building);
		}

		return () => {
			setBuilding(undefined);
		};
	}, [selectedMarker]);

	const toggleBuildingMarker = (isTitleShown: boolean) => {
		if (isTitleShown) {
			buildingMarkers
				.filter(
					(el) =>
						el.nodeId !== destination?.nodeId &&
						el.nodeId !== origin?.nodeId &&
						el.nodeId !== selectedMarker?.id,
				)
				.forEach(
					(marker) => (marker.element.content = buildingMarkerElement({ className: "translate-building" })),
				);
			return;
		}

		buildingMarkers
			.filter(
				(el) =>
					el.nodeId !== destination?.nodeId &&
					el.nodeId !== origin?.nodeId &&
					el.nodeId !== selectedMarker?.id,
			)
			.forEach(
				(marker) =>
					(marker.element.content = buildingMarkerElement({
						name: marker.name,
						className: "translate-namedmarker",
					})),
			);
	};

	useEffect(() => {
		if (!map) return;

		if (prevZoom.current >= 17 && zoom <= 16) {
			if (isCautionAcitve) {
				toggleMarkers(
					false,
					cautionMarkers.map((marker) => marker.element),
					map,
				);
			}
			if (isDangerAcitve) {
				toggleMarkers(
					false,
					dangerMarkers.map((marker) => marker.element),
					map,
				);
			}

			toggleMarkers(true, universityMarker ? [universityMarker] : [], map);
			polylines.current.forEach((el) => el.setMap(null));
			polygon.current?.setMap(map);
			toggleBuildingMarker(true);
		} else if (prevZoom.current <= 16 && zoom >= 17) {
			if (isCautionAcitve) {
				toggleMarkers(
					true,
					cautionMarkers.map((marker) => marker.element),
					map,
				);
			}
			if (isDangerAcitve) {
				toggleMarkers(
					true,
					dangerMarkers.map((marker) => marker.element),
					map,
				);
			}
			toggleMarkers(false, universityMarker ? [universityMarker] : [], map);
			polylines.current.forEach((el) => el.setMap(map));
			polygon.current?.setMap(null);
			toggleBuildingMarker(false);
		}
	}, [map, zoom]);

	const drawRoute = (coreRouteList: CoreRoutesList) => {
		if (!map || !cachedRouteRef.current) return;

		let isReDraw = false;

		if (usedRouteRef.current!.size !== 0) isReDraw = true;

		const usedKeys = new Set();

		const tempLines = [];

		for (const coreRoutes of coreRouteList) {
			const { coreNode1Id, coreNode2Id, routes: edges } = coreRoutes;

			const subNodes = [edges[0].node1, ...edges.map((el) => el.node2)];

			const key =
				coreNode1Id < coreNode2Id
					? `${edges[0].routeId}_${edges.slice(-1)[0].routeId}`
					: `${edges.slice(-1)[0].routeId}_${edges[0].routeId}`;

			const cachedPolyline = cachedRouteRef.current.get(key);

			if (cachedPolyline) {
				if (!isReDraw) {
					usedRouteRef.current!.add(key);
				} else {
					usedKeys.add(key);
				}

				removeAllListener(cachedPolyline);
				cachedPolyline.setMap(zoom <= 16 ? null : map);
				tempLines.push(cachedPolyline);
				continue;
			}

			const routePolyLine = createPolyline({
				map: null,
				path: subNodes.map((el) => {
					return { lat: el.lat, lng: el.lng };
				}),

				strokeColor: "#3585fc",
			});
			if (!routePolyLine) continue;
			tempLines.push(routePolyLine);

			if (cachedRouteRef.current) {
				cachedRouteRef.current.set(key, routePolyLine);
			}
		}
		if (isReDraw) {
			// @ts-expect-error : Difference Method need Polyfill
			const deleteKeys = usedRouteRef.current!.difference(usedKeys) as Set<string>;

			deleteKeys.forEach((key) => {
				cachedRouteRef.current!.get(key)?.setMap(null);
				cachedRouteRef.current!.delete(key);
			});
		}

		polylines.current = tempLines;
	};

	useEffect(() => {
		addRiskMarker();
	}, [risks.data, map]);

	useEffect(() => {
		drawRoute(routes.data);
	}, [routes.data, map]);

	useEffect(() => {
		usedRouteRef.current?.clear();
		usedMarkerRef.current?.clear();

		return () => {
			usedRouteRef.current?.clear();
			usedMarkerRef.current?.clear();
		};
	}, []);

	return (
		<div className="relative flex flex-col h-dvh w-full mx-auto justify-center">
			<MapTopBuildingSheet
				isVisible={(selectedMarker?.type === Markers.BUILDING ? false : true) && searchMode === "BUILDING"}
			/>
			<MapTopRouteSheet
				isVisible={(selectedMarker?.type === Markers.BUILDING ? false : true) && searchMode !== "BUILDING"}
			/>
			<div ref={mapRef} className="w-full h-full" />
			<MapBottomSheet
				selectRoutePoint={selectRoutePoint}
				selectedMarker={selectedMarker}
				isVisible={selectedMarker?.type === Markers.BUILDING ? true : false}
			/>
			{/* 출발지랑 도착지가 존재하는 경우 길찾기 버튼 보이기 */}
			<AnimatedContainer
				isVisible={origin !== undefined && destination !== undefined && origin.nodeId !== destination.nodeId}
				positionDelta={200}
				transition={{
					duration: 0.3,
					type: "spring",
					damping: 20,
				}}
				className=""
			>
				<div
					onClick={() => findFastRoute()}
					className="max-w-[450px] absolute left-1/2 translate-x-[-50%] bottom-6 space-y-2 w-full px-4"
				>
					<Button variant="primary">길찾기</Button>
				</div>
			</AnimatedContainer>

			{/* 출발지랑 도착지가 존재하지 않거나, 같은 경우 기존 Button UI 보이기 */}
			<AnimatedContainer
				isVisible={!(origin !== undefined && destination !== undefined && origin.nodeId !== destination.nodeId)}
				positionDelta={200}
				transition={{
					duration: 0.3,
					type: "spring",
					damping: 20,
				}}
				className=""
			>
				<div className="absolute right-4 bottom-6 space-y-2">
					<ReportButton onClick={open} />
				</div>
				<div className="absolute right-4 bottom-[90px] space-y-2">
					<CautionToggleButton isActive={isCautionAcitve} onClick={toggleCautionButton} />
					<DangerToggleButton isActive={isDangerAcitve} onClick={toggleDangerButton} />
				</div>
			</AnimatedContainer>

			{isOpen && <ReportModal close={close} />}
			<FailModal />
			<Loading isLoading={isFetching} loadingContent="경로를 탐색중입니다" />
		</div>
	);
}
