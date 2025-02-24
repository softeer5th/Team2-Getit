import { MouseEvent, useContext, useEffect, useState } from "react";
import useMap from "../hooks/useMap";
import { CoreRoute, CoreRoutesList, RouteId } from "../types/route";
import { Markers } from "../constant/enum/markerEnum";
import { ClickEvent } from "../types/event";
import { LatLngToLiteral } from "../utils/coordinates/coordinateTransform";
import findNearestSubEdge from "../utils/polylines/findNearestEdge";
import centerCoordinate from "../utils/coordinates/centerCoordinate";
import Button from "../components/customButton";
import { Link } from "react-router";
import { ReportRiskMessage } from "../constant/enum/messageEnum";
import AnimatedContainer from "../container/animatedContainer";

import BackButton from "../components/map/backButton";

import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import { University } from "../types/university";
import { useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { getAllRoutes } from "../api/route";
import { getAllRisks } from "../api/routes";
import useReportRisk from "../hooks/useReportRisk";
import { CautionIssueType, DangerIssueType } from "../types/enum";
import { CautionIssue, DangerIssue } from "../constant/enum/reportEnum";
import TutorialModal from "../components/map/tutorialModal";
import createMarkerElement from "../utils/markers/createMarkerElement";
import MapContext from "../map/mapContext";
import { CacheContext } from "../map/mapCacheContext";
import removeAllListener from "../utils/map/removeAllListener";
import useReportedRisk from "../hooks/useReportRiskResult";
import { interpolate } from "../utils/interpolate";
import { MarkerTypesWithElement, AdvancedMarker } from "../types/marker";

interface reportMarkerTypes extends MarkerTypesWithElement {
	route: RouteId;
	factors?: DangerIssueType[] | CautionIssueType[];
}

export default function ReportRiskPage() {
	const { cachedRouteRef, cachedMarkerRef, usedRouteRef, usedMarkerRef } = useContext(CacheContext);
	const { createPolyline, createAdvancedMarker } = useContext(MapContext);
	const { map, mapRef } = useMap({ zoom: 18, minZoom: 17 });

	const [reportMarker, setReportMarker] = useState<reportMarkerTypes>();

	const [message, setMessage] = useState<ReportRiskMessage>(ReportRiskMessage.DEFAULT);
	const { setReportRouteId } = useReportRisk();
	const { reportedData, clearReportedRouteData } = useReportedRisk();
	const { university } = useUniversityInfo();
	const [isTutorialShown, setIsTutorialShown] = useState<boolean>(true);
	const { dangerMarkerElement, cautionMarkerElement, reportMarkerElement } = createMarkerElement();

	const queryClient = useQueryClient();

	useRedirectUndefined<University | undefined>([university]);

	if (!university) return;

	const closeTutorial = () => {
		setIsTutorialShown(false);
		setMessage(ReportRiskMessage.DEFAULT);
	};

	const openTutorial = () => {
		setIsTutorialShown(true);
	};

	const result = useSuspenseQueries({
		queries: [
			{
				queryKey: ["routes", university.id],
				queryFn: () => getAllRoutes(university.id),
			},
			{ queryKey: [university.id, "risks"], queryFn: () => getAllRisks(university.id) },
		],
	});

	const [routes, risks] = result;

	const reportRisk = (e: MouseEvent<HTMLAnchorElement>) => {
		if (!reportMarker) {
			e.preventDefault();
			return;
		}

		setReportRouteId(reportMarker.route);
	};

	const resetMarker = (prevMarker: MarkerTypesWithElement) => {
		if (prevMarker.type === Markers.REPORT) {
			prevMarker.element.map = null;
			return;
		}

		if (prevMarker.type === Markers.CAUTION) {
			prevMarker.element.content = cautionMarkerElement({});
			return;
		}

		if (prevMarker.type === Markers.DANGER) {
			prevMarker.element.content = dangerMarkerElement({});
			return;
		}

		return;
	};

	const onClickRiskMarker = (
		self: AdvancedMarker,
		type: Markers.DANGER | Markers.CAUTION,
		routeId: RouteId,
		factors: DangerIssueType[] | CautionIssueType[],
	) => {
		setReportMarker((prevMarker) => {
			if (prevMarker) resetMarker(prevMarker);

			return {
				type: type,
				element: self,
				route: routeId,
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
				cachedDangerMarker.map = map;
				cachedDangerMarker.addListener("click", () =>
					onClickRiskMarker(cachedDangerMarker, Markers.DANGER, routeId, dangerFactors),
				);

				continue;
			}

			const dangerMarker = createAdvancedMarker(
				{
					map: map,
					position: {
						lat: (node1.lat + node2.lat) / 2,
						lng: (node1.lng + node2.lng) / 2,
					},
					content: dangerMarkerElement({}),
				},
				(self) => onClickRiskMarker(self, Markers.DANGER, routeId, dangerFactors),
			);
			if (!dangerMarker) continue;

			cachedMarkerRef.current!.set(key, dangerMarker);
		}

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
					onClickRiskMarker(cachedCautionMarker, Markers.CAUTION, routeId, cautionFactors),
				);
				cachedCautionMarker.map = map;

				continue;
			}

			const cautionMarker = createAdvancedMarker(
				{
					map: map,
					position: {
						lat: (node1.lat + node2.lat) / 2,
						lng: (node1.lng + node2.lng) / 2,
					},
					content: cautionMarkerElement({}),
				},

				(self) => onClickRiskMarker(self, Markers.CAUTION, routeId, cautionFactors),
			);

			if (!cautionMarker) continue;

			cachedMarkerRef.current!.set(key, cautionMarker);
		}

		if (isReDraw) {
			// @ts-expect-error : Difference Method need Polyfill
			const deleteKeys = usedMarkerRef.current!.difference(usedKeys) as Set<string>;

			deleteKeys.forEach((key) => {
				cachedMarkerRef.current!.get(key)!.map = null;
				cachedMarkerRef.current!.delete(key);
			});
		}
	};

	const onClickPolyline = (self: google.maps.Polyline, e: ClickEvent, edges: CoreRoute[]) => {
		const point = LatLngToLiteral(e.latLng);
		const { edge: nearestEdge } = findNearestSubEdge(edges, point);

		const newReportMarker = createAdvancedMarker({
			map: map,
			position: centerCoordinate(nearestEdge.node1, nearestEdge.node2),
			content: reportMarkerElement({}),
		});

		if (!newReportMarker) return;

		setReportMarker((prevMarker) => {
			if (prevMarker) resetMarker(prevMarker);

			return {
				type: Markers.REPORT,
				element: newReportMarker,
				route: nearestEdge.routeId,
			};
		});
	};

	const drawRoute = (coreRouteList: CoreRoutesList) => {
		if (!map || !cachedRouteRef.current) return;

		let isReDraw = false;

		if (usedRouteRef.current!.size !== 0) isReDraw = true;

		const usedKeys = new Set();

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
				cachedPolyline.setMap(map);
				cachedPolyline.addListener("click", (e: ClickEvent) => onClickPolyline(cachedPolyline, e, edges));
				continue;
			}

			const routePolyLine = createPolyline(
				{
					map: map,
					path: subNodes.map((el) => {
						return { lat: el.lat, lng: el.lng };
					}),
					strokeColor: "#3585fc",
				},
				(self, e) => onClickPolyline(self, e, edges),
			);

			if (!routePolyLine) continue;

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
	};

	const findRouteById = (routesList: CoreRoutesList, targetRouteId: RouteId): CoreRoute | undefined => {
		for (const coreRoutes of routesList) {
			const foundRoute = coreRoutes.routes.find((route) => route.routeId === targetRouteId);
			if (foundRoute) {
				return foundRoute;
			}
		}
		return undefined;
	};

	const moveToMarker = () => {
		if (!map) return;
		const { routeId } = reportedData;
		const route = findRouteById(routes.data, routeId!);
		if (!route) return;
		const node1 = route.node1;
		const node2 = route.node2;
		const reportedCoord = interpolate({ lat: node1.lat, lng: node1.lng }, { lat: node2.lat, lng: node2.lng }, 0.5);
		map.setCenter(reportedCoord);
		clearReportedRouteData();
	};

	useEffect(() => {
		if (reportedData?.routeId !== undefined) {
			const foundRoute = findRouteById(routes.data, reportedData.routeId!);
			if (!foundRoute) return;

			queryClient.setQueryData(
				[university.id, "risks"],
				(prev: { dangerRoutes: CoreRoute[]; cautionRoutes: CoreRoute[] }) => {
					let newDangerRoutes = prev.dangerRoutes;
					let newCautionRoutes = prev.cautionRoutes;

					if (reportedData.dangerFactors.length > 0) {
						if (!newDangerRoutes.some((route) => route.routeId === foundRoute.routeId)) {
							newDangerRoutes = [...newDangerRoutes, foundRoute];
						}
					} else {
						newDangerRoutes = newDangerRoutes.filter((route) => route.routeId !== foundRoute.routeId);
					}

					if (reportedData.cautionFactors.length > 0) {
						if (!newCautionRoutes.some((route) => route.routeId === foundRoute.routeId)) {
							newCautionRoutes = [...newCautionRoutes, foundRoute];
						}
					} else {
						newCautionRoutes = newCautionRoutes.filter((route) => route.routeId !== foundRoute.routeId);
					}

					return { dangerRoutes: newDangerRoutes, cautionRoutes: newCautionRoutes };
				},
			);
		}

		if (map) {
			if (reportedData?.routeId !== undefined) moveToMarker();
			else map.setCenter(university.centerPoint);

			map.addListener("click", () => {
				setReportMarker((prevMarker) => {
					if (prevMarker) {
						setMessage(ReportRiskMessage.DEFAULT);
						resetMarker(prevMarker);
					} else {
						setMessage(ReportRiskMessage.ERROR);
						openTutorial();
					}
					return undefined;
				});
			});
		}
	}, [map]);

	/** isSelect(Marker 선택 시) Marker Content 변경, 지도 이동, BottomSheet 열기 */
	const changeMarkerStyle = (marker: reportMarkerTypes | undefined, isSelect: boolean) => {
		if (!map || !marker) return;

		marker.element.zIndex = isSelect ? 100 : 1;

		switch (marker.type) {
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
		}
	};

	/** 선택된 마커가 있는 경우 */
	useEffect(() => {
		if (!reportMarker) return;

		if (reportMarker.type === Markers.REPORT) setMessage(ReportRiskMessage.CREATE);
		else if (reportMarker.type === Markers.DANGER || reportMarker.type === Markers.CAUTION)
			setMessage(ReportRiskMessage.UPDATE);
		else setMessage(ReportRiskMessage.DEFAULT);

		changeMarkerStyle(reportMarker, true);
		return () => {
			changeMarkerStyle(reportMarker, false);
		};
	}, [reportMarker]);

	useEffect(() => {
		drawRoute(routes.data);
	}, [map, routes.data]);

	useEffect(() => {
		addRiskMarker();
	}, [map, risks.data]);

	useEffect(() => {
		usedRouteRef.current?.clear();
		usedMarkerRef.current?.clear();

		return () => {
			usedRouteRef.current?.clear();
			usedMarkerRef.current?.clear();
		};
	}, []);

	return (
		<div className="relative w-full h-dvh">
			<AnimatedContainer
				className="w-full h-[57px] absolute top-0 z-20"
				positionDelta={57}
				isTop={true}
				isVisible={!isTutorialShown}
				transition={{ type: "spring", damping: 20 }}
			>
				<div className="w-full h-full flex items-center justify-center bg-black opacity-50 py-3 px-4">
					<p className="text-gray-100">{message}</p>
				</div>
			</AnimatedContainer>

			{isTutorialShown && <TutorialModal onClose={closeTutorial} messages={[message]} />}

			<BackButton className="absolute top-[73px] left-4 z-5" />
			<div ref={mapRef} className="w-full h-full" />
			<AnimatedContainer
				isVisible={reportMarker ? true : false}
				className="absolute w-full bottom-6 px-4"
				positionDelta={88}
				transition={{ duration: 0.6 }}
			>
				<Link to={"/form"} onClick={reportRisk}>
					<Button>제보하기</Button>
				</Link>
			</AnimatedContainer>
		</div>
	);
}
