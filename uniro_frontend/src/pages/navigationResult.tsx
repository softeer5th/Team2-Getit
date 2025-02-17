import React, { useEffect, useRef, useState } from "react";
import { useSuspenseQueries } from "@tanstack/react-query";

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
import { useNavigationBottomSheet } from "../hooks/useNavigationBottomSheet";

import BottomCardList from "../components/navigation/card/bottomCardList";
import { NavigationButtonRouteType } from "../data/types/route";
import NavigationNavBar from "../components/navigation/navBar/navigationNavBar";

const MAX_SHEET_HEIGHT = window.innerHeight * 0.7;
const MIN_SHEET_HEIGHT = window.innerHeight * 0.35;
const CLOSED_SHEET_HEIGHT = 0;

const INITIAL_TOP_BAR_HEIGHT = 143;
const BOTTOM_SHEET_HANDLE_HEIGHT = 40;
const PADDING_FOR_MAP_BOUNDARY = 50;

const NavigationResultPage = () => {
	const [isDetailView, setIsDetailView] = useState(false);
	const [topBarHeight, setTopBarHeight] = useState(INITIAL_TOP_BAR_HEIGHT);

	const { sheetHeight, setSheetHeight, dragControls, handleDrag, preventScroll, scrollRef, handleDragEnd } =
		useNavigationBottomSheet();
	const { university } = useUniversityInfo();
	const { origin, destination } = useRoutePoint();

	const [buttonState, setButtonState] = useState<NavigationButtonRouteType>("PEDES & SAFE");
	const [currentRouteIdx, setCurrentRouteIdx] = useState(-1);
	// Caution 마커를 위한 routeIdx state
	const [cautionRouteIdx, setCautionRouteIdx] = useState(-1);

	useRedirectUndefined<University | Building | undefined>([university, origin, destination]);

	useScrollControl();

	const [routeList, risks] = useSuspenseQueries({
		queries: [
			{
				queryKey: ["fastRoute", university?.id, origin?.nodeId ?? 1, destination?.nodeId ?? 2],
				queryFn: async () => {
					try {
						const response = await getNavigationResult(
							university?.id ?? 1001,
							origin?.nodeId ?? 1,
							destination?.nodeId ?? 2,
						);
						return response;
					} catch (e) {
						alert(`경로를 찾을 수 없습니다. (${e})`);
						return null;
					}
					// return await fetchMockJson().then((data) => {
					// 	const response = transformFastRoute(data);
					// 	return response;
					// });
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

	const resetCurrentIndex = () => {
		setCautionRouteIdx(-1);
		setCurrentRouteIdx(-1);
	};

	const changeCurrentIndex = (index: number) => {
		setCurrentRouteIdx(index);
	};

	const showDetailView = () => {
		setSheetHeight(MAX_SHEET_HEIGHT);
		setTopBarHeight(PADDING_FOR_MAP_BOUNDARY);
		resetCurrentIndex();
		setIsDetailView(true);
	};

	const hideDetailView = () => {
		setSheetHeight(CLOSED_SHEET_HEIGHT);
		setTopBarHeight(INITIAL_TOP_BAR_HEIGHT);
		resetCurrentIndex();
		setIsDetailView(false);
	};

	const handleButtonStateChange = (buttonType: NavigationButtonRouteType) => {
		setButtonState(buttonType);
	};

	const handleCautionMarkerClick = (index: number) => {
		showDetailView();
		setCurrentRouteIdx(index);
	};

	return (
		<div className="relative h-dvh w-full max-w-[450px] mx-auto">
			{/* 지도 영역 */}
			<NavigationMap
				style={{ width: "100%", height: "100%" }}
				routeResult={routeList.data!}
				buttonState={buttonState}
				isDetailView={isDetailView}
				risks={risks.data}
				topPadding={topBarHeight}
				bottomPadding={sheetHeight}
				handleCautionMarkerClick={handleCautionMarkerClick}
				currentRouteIdx={currentRouteIdx}
				setDangerRouteIdx={setCautionRouteIdx}
			/>

			<AnimatedContainer
				isVisible={!isDetailView}
				positionDelta={286}
				className="absolute top-0 left-0 w-full flex flex-col space-y-2"
				isTop={true}
				transition={{ type: "spring", damping: 20, duration: 0.3 }}
			>
				<div className="max-w-[450px] w-full min-h-[143px] bg-gray-100 flex flex-col items-center justify-center rounded-b-4xl shadow-lg">
					<NavigationDescription
						isDetailView={false}
						navigationRoute={routeList.data![buttonState]}
						buttonType={buttonState}
					/>
				</div>
				<NavigationNavBar
					route={routeList.data!}
					dataLength={routeList.data!.dataLength}
					buttonType={buttonState}
					setButtonState={handleButtonStateChange}
				/>
			</AnimatedContainer>

			<AnimatedContainer
				isVisible={!isDetailView}
				className="absolute bottom-0 left-0 w-full mb-[30px] px-4"
				positionDelta={88}
			>
				<BottomCardList
					routeList={routeList.data!}
					buttonType={buttonState}
					showDetailView={showDetailView}
					setButtonState={setButtonState}
				></BottomCardList>
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
				transition={{ type: "spring", damping: 20, duration: 0.7 }}
				motionProps={{
					drag: "y",
					dragControls,
					dragListener: false,
					dragElastic: {
						top: 0,
						bottom: 0.3,
					},
					dragConstraints: {
						top: 0,
						bottom: MIN_SHEET_HEIGHT,
					},
					onDrag: handleDrag,
					onDragEnd: handleDragEnd,
				}}
			>
				<BottomSheetHandle resetCurrentIdx={resetCurrentIndex} dragControls={dragControls} />
				<div
					ref={scrollRef}
					className="w-full overflow-y-auto"
					style={{
						height: MAX_SHEET_HEIGHT - BOTTOM_SHEET_HANDLE_HEIGHT,
					}}
					onScroll={preventScroll}
				>
					<NavigationDescription
						resetCurrentRouteIdx={resetCurrentIndex}
						isDetailView={true}
						buttonType={buttonState}
						navigationRoute={routeList.data![buttonState]}
					/>
					<RouteList
						changeCurrentRouteIdx={changeCurrentIndex}
						currentRouteIdx={currentRouteIdx}
						routes={
							routeList.data![buttonState]?.routeDetails
								? routeList.data![buttonState]?.routeDetails
								: null
						}
						cautionRouteIdx={cautionRouteIdx}
					/>
				</div>
			</AnimatedContainer>
		</div>
	);
};

export default NavigationResultPage;
