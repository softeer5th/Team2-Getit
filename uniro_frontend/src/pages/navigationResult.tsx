import React, { useState } from "react";
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
import { University } from "../data/types/university";
import { getNavigationResult } from "../api/route";
import { getAllRisks } from "../api/routes";
import useRoutePoint from "../hooks/useRoutePoint";
import { Building } from "../data/types/node";
import { useLocation } from "react-router";
import { useNavigationBottomSheet } from "../hooks/useNavigationBottomSheet";

import ElectricIcon from "../assets/route/detail/electric.svg?react";
import WheelChairIcon from "../assets/route/detail/wheelchair.svg?react";
import BottomCardList from "../components/navigation/card/bottomCardList";
import BottomCard from "../components/navigation/card/bottomCard";

const MAX_SHEET_HEIGHT = window.innerHeight * 0.7;
const MIN_SHEET_HEIGHT = window.innerHeight * 0.35;
const CLOSED_SHEET_HEIGHT = 0;

const INITIAL_TOP_BAR_HEIGHT = 143;
const BOTTOM_SHEET_HANDLE_HEIGHT = 40;
const PADDING_FOR_MAP_BOUNDARY = 50;

const NavigationResultPage = () => {
	const [isDetailView, setIsDetailView] = useState(false);
	const [topBarHeight, setTopBarHeight] = useState(INITIAL_TOP_BAR_HEIGHT);

	const { sheetHeight, setSheetHeight, dragControls, handleDrag, preventScroll, scrollRef } =
		useNavigationBottomSheet();
	const { university } = useUniversityInfo();
	const { origin, destination, setOriginCoord, setDestinationCoord } = useRoutePoint();

	// TEST용 Link
	const location = useLocation();
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
						return response;
					} catch (e) {
						alert(`경로를 찾을 수 없습니다. (${e})`);
						return null;
					}
				},
				retry: 1,
				staleTime: 0,
				gcTime: 0,
			},
			{
				queryKey: [university?.id, "risks"],
				queryFn: () => getAllRisks(university?.id ?? 1001),
				retry: 1,
				staleTime: 0,
				gcTime: 0,
			},
		],
	});

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
				className="absolute top-0 left-0 w-full flex flex-col space-y-2"
				isTop={true}
				transition={{ type: "spring", damping: 20, duration: 0.3 }}
			>
				<div className="max-w-[450px] w-full min-h-[143px] bg-gray-100 flex flex-col items-center justify-center rounded-b-4xl shadow-lg">
					<NavigationDescription isDetailView={false} navigationRoute={result[0].data!} />
				</div>
				<div className="z-10 w-full flex flex-row items-center justify-start space-x-2 mt-2 px-2 overflow-x-scroll overflow-y-hidden whitespace-nowrap">
					<div className="scroll-snap-x mandatory flex flex-row min-w-max items-center justify-center bg-blue-600 rounded-xl py-2 px-4 text-gray-100 text-kor-body3 font-light">
						<ElectricIcon className="w-5 h-5 mr-1" />
						도보 3분
					</div>
					<div className="flex flex-row min-w-max items-center justify-center bg-blue-300 rounded-xl py-2 px-4 text-gray-100 text-kor-body3 font-light">
						<ElectricIcon className="w-5 h-5 mr-1" />
						전동휠체어 3분
					</div>
					<div className="flex flex-row min-w-max items-center justify-center bg-blue-300 rounded-xl py-2 px-4 text-gray-100 text-kor-body3 font-light">
						<WheelChairIcon className="w-5 h-5 mr-1" />
						휠체어 3분
					</div>
				</div>
			</AnimatedContainer>

			<AnimatedContainer
				isVisible={!isDetailView}
				className="absolute bottom-0 left-0 w-full mb-[30px] px-4"
				positionDelta={88}
			>
				<BottomCardList></BottomCardList>
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
					ref={scrollRef}
					className="w-full overflow-y-auto"
					style={{
						height: MAX_SHEET_HEIGHT - BOTTOM_SHEET_HANDLE_HEIGHT,
					}}
					onScroll={preventScroll}
				>
					<NavigationDescription isDetailView={true} navigationRoute={result[0].data!} />
					<RouteList routes={result[0].data!.routeDetails} />
				</div>
			</AnimatedContainer>
		</div>
	);
};

export default NavigationResultPage;
