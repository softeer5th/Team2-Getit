import React, { useCallback, useEffect, useState } from "react";
import { PanInfo, useDragControls } from "framer-motion";
import { useSuspenseQuery } from "@tanstack/react-query";

import Button from "../components/customButton";
import RouteList from "../components/navigation/route/routeList";
import NavigationDescription from "../components/navigation/navigationDescription";
import BottomSheetHandle from "../components/navigation/bottomSheet/bottomSheetHandle";
import NavigationMap from "../component/NavgationMap";
import BackButton from "../components/map/backButton";
import AnimatedContainer from "../container/animatedContainer";
import { mockNavigationRoute } from "../data/mock/hanyangRoute";
import { NavigationRoute } from "../data/types/route";
import { getMockTest } from "../utils/fetch/mockFetch";

import useScrollControl from "../hooks/useScrollControl";
import useLoading from "../hooks/useLoading";
import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import AnimatedSheetContainer from "../container/animatedSheetContainer";

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

	const [isLoading, showLoading, hideLoading] = useLoading();
	const [route, setRoute] = useState<NavigationRoute>(mockNavigationRoute);

	useScrollControl();

	const { data, status } = useSuspenseQuery({
		queryKey: ["test"],
		queryFn: getMockTest,
	});
	const { university } = useUniversityInfo();
	useRedirectUndefined<string | undefined>([university]);

	useEffect(() => {
		console.log("status", status);
	}, [status]);

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
		<div className="relative h-svh w-full max-w-[450px] mx-auto">
			{/* 지도 영역 */}
			<NavigationMap
				style={{ width: "100%", height: "100%" }}
				routes={route}
				topPadding={topBarHeight}
				bottomPadding={sheetHeight}
			/>

			<AnimatedContainer
				isVisible={!isDetailView && !isLoading}
				positionDelta={286}
				className="absolute top-0 z-10 max-w-[450px] w-full min-h-[143px] bg-gray-100 flex flex-col items-center justify-center rounded-b-4xl shadow-lg"
				isTop={true}
				transition={{ type: "spring", damping: 20, duration: 0.3 }}
			>
				<NavigationDescription isDetailView={false} />
			</AnimatedContainer>

			<AnimatedContainer
				isVisible={!isDetailView && !isLoading}
				className="absolute bottom-0 left-0 w-full mb-[30px] px-4"
				positionDelta={88}
			>
				<Button onClick={showDetailView}>상세경로 보기</Button>
			</AnimatedContainer>

			<AnimatedContainer
				isVisible={isDetailView && !isLoading}
				className="absolute top-4 left-4 z-10"
				positionDelta={60}
				isTop={true}
			>
				<BackButton onClick={hideDetailView} />
			</AnimatedContainer>

			<AnimatedSheetContainer
				isVisible={isDetailView && !isLoading}
				height={sheetHeight}
				className="bg-white rounded-t-2xl shadow-xl"
				transition={{ type: "tween", duration: 0.3 }}
				motionProps={{
					drag: "y",
					dragControls,
					dragListener: false,
					dragConstraints: {
						top: 0,
						bottom: 0,
					},
					onDrag: handleDrag,
					onDragEnd: handleDrag,
				}}
			>
				<BottomSheetHandle dragControls={dragControls} />

				<div
					className="w-full overflow-y-auto"
					style={{
						height: sheetHeight - BOTTOM_SHEET_HANDLE_HEIGHT,
					}}
				>
					<NavigationDescription isDetailView={true} />
					<RouteList
						routes={route.route}
						originBuilding={route.originBuilding}
						destinationBuilding={route.destinationBuilding}
					/>
				</div>
			</AnimatedSheetContainer>
		</div>
	);
};

export default NavigationResultPage;
