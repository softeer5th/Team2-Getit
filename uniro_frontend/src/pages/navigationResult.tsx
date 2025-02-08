import React, { useCallback, useState } from "react";
import { PanInfo, useDragControls } from "framer-motion";
import { useSuspenseQueries } from "@tanstack/react-query";

import Button from "../components/customButton";
import RouteList from "../components/navigation/route/routeList";
import NavigationDescription from "../components/navigation/navigationDescription";
import BottomSheetHandle from "../components/navigation/bottomSheet/bottomSheetHandle";
import NavigationMap from "../component/NavgationMap";
import BackButton from "../components/map/backButton";
import AnimatedContainer from "../container/animatedContainer";

import useScrollControl from "../hooks/useScrollControl";
import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import AnimatedSheetContainer from "../container/animatedSheetContainer";
import { University } from "../data/types/university";
import { getNavigationResult } from "../api/route";
import { getAllRisks } from "../api/routes";
import useRoutePoint from "../hooks/useRoutePoint";
import { Building } from "../data/types/node";
import { useLocation } from "react-router";

const MAX_SHEET_HEIGHT = window.innerHeight * 0.7;
const MIN_SHEET_HEIGHT = window.innerHeight * 0.35;
const CLOSED_SHEET_HEIGHT = 0;

const INITIAL_TOP_BAR_HEIGHT = 143;
const BOTTOM_SHEET_HANDLE_HEIGHT = 40;
const PADDING_FOR_MAP_BOUNDARY = 50;

const NavigationResultPage = () => {
	const [isDetailView, setIsDetailView] = useState(false);
	const [sheetHeight, setSheetHeight] = useState(CLOSED_SHEET_HEIGHT);
	const [topBarHeight, setTopBarHeight] = useState(INITIAL_TOP_BAR_HEIGHT);
	const location = useLocation();

	const { university } = useUniversityInfo();
	const { origin, destination, setOriginCoord, setDestinationCoord } = useRoutePoint();

	// TEST용 Link
	const { search } = location;
	const params = new URLSearchParams(search);

	const originId = params.get("node1Id");
	const destinationId = params.get("node2Id");

	useRedirectUndefined<University | Building | undefined>([university, origin, destination]);

	useScrollControl();

	// Cache를 위한 Key를 지정하기 위해서 추가한 코드
	const requestOriginId = originId ? Number(originId) : origin?.nodeId;
	const requestDestinationId = destinationId ? Number(destinationId) : destination?.nodeId;

	const result = useSuspenseQueries({
		queries: [
			{
				queryKey: ["fastRoute", university?.id, requestOriginId, requestDestinationId],
				queryFn: async () => {
					try {
						const response = await getNavigationResult(
							university?.id ?? 1001,
							requestOriginId,
							requestDestinationId,
						);
						setOriginCoord(response.routes[0].node1.lng, response.routes[0].node1.lat);
						setDestinationCoord(
							response.routes[response.routes.length - 1].node1.lng,
							response.routes[response.routes.length - 1].node1.lat,
						);
						return response;
					} catch (e) {
						return alert("경로를 찾을 수 없습니다.");
					}
				},
				retry: 1,
				staleTime: 0,
			},
			{
				queryKey: [university?.id, "risks"],
				queryFn: () => getAllRisks(university?.id ?? 1001),
				retry: 1,
				staleTime: 0,
			},
		],
	});

	const dragControls = useDragControls();

	const showDetailView = () => {
		setSheetHeight(MAX_SHEET_HEIGHT);
		setTopBarHeight(PADDING_FOR_MAP_BOUNDARY);
		setIsDetailView(true);
	};

	const hideDetailView = () => {
		setSheetHeight(CLOSED_SHEET_HEIGHT);
		setTopBarHeight(INITIAL_TOP_BAR_HEIGHT);
		setIsDetailView(false);
	};

	const handleDrag = useCallback((event: Event, info: PanInfo) => {
		setSheetHeight((prev) => {
			const newHeight = prev - info.delta.y;
			return Math.min(Math.max(newHeight, MIN_SHEET_HEIGHT), MAX_SHEET_HEIGHT);
		});
	}, []);

	return (
		<div className="relative h-dvh w-full max-w-[450px] mx-auto">
			{/* 지도 영역 */}
			<NavigationMap
				style={{ width: "100%", height: "100%" }}
				routeResult={result[0].data!}
				isDetailView={isDetailView}
				risks={result[1].data}
				topPadding={topBarHeight}
				bottomPadding={sheetHeight}
			/>

			<AnimatedContainer
				isVisible={!isDetailView}
				positionDelta={286}
				className="absolute top-0 z-10 max-w-[450px] w-full min-h-[143px] bg-gray-100 flex flex-col items-center justify-center rounded-b-4xl shadow-lg"
				isTop={true}
				transition={{ type: "spring", damping: 20, duration: 0.3 }}
			>
				<NavigationDescription isDetailView={false} navigationRoute={result[0].data!} />
			</AnimatedContainer>

			<AnimatedContainer
				isVisible={!isDetailView}
				className="absolute bottom-0 left-0 w-full mb-[30px] px-4"
				positionDelta={88}
			>
				<Button onClick={showDetailView}>상세경로 보기</Button>
			</AnimatedContainer>

			<AnimatedContainer
				isVisible={isDetailView}
				className="absolute top-4 left-4 z-10"
				positionDelta={60}
				isTop={true}
			>
				<BackButton onClick={hideDetailView} />
			</AnimatedContainer>

			<AnimatedContainer
				isVisible={isDetailView}
				className="absolute bottom-0 w-full left-0 bg-white rounded-t-2xl shadow-xl overflow-auto"
				positionDelta={MAX_SHEET_HEIGHT}
				transition={{ type: "spring", damping: 20, duration: 0.3 }}
				motionProps={{
					drag: "y",
					dragControls,
					dragListener: false,
					dragConstraints: {
						top: 0,
						bottom: MIN_SHEET_HEIGHT,
					},
					onDrag: handleDrag,
					onDragEnd: handleDrag,
				}}
			>
				<BottomSheetHandle dragControls={dragControls} />
				<div
					className="w-full overflow-y-auto"
					style={{
						height: MAX_SHEET_HEIGHT - BOTTOM_SHEET_HANDLE_HEIGHT,
					}}
				>
					<NavigationDescription isDetailView={true} navigationRoute={result[0].data!} />
					<RouteList routes={result[0].data!.routeDetails} />
				</div>
			</AnimatedContainer>
		</div>
	);
};

export default NavigationResultPage;
