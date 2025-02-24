import React, { useCallback, useEffect, useState } from "react";
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
import { University } from "../types/university";
import { getNavigationResult } from "../api/route";
import { getAllRisks } from "../api/routes";
import useRoutePoint from "../hooks/useRoutePoint";
import { Building } from "../types/node";
import { useNavigationBottomSheet } from "../hooks/useNavigationBottomSheet";

import BottomCardList from "../components/navigation/card/bottomCardList";
import { NavigationButtonRouteType } from "../types/route";
import NavigationNavBar from "../components/navigation/navBar/navigationNavBar";
import { useAnimationControls } from "framer-motion";

const NavigationResultPage = () => {
	const CLOSED_SHEET_HEIGHT = window.innerHeight * 0.2;

	const INITIAL_TOP_BAR_HEIGHT = 200;
	const BOTTOM_SHEET_HANDLE_HEIGHT = 100;
	const PADDING_FOR_MAP_BOUNDARY = 70;

	const [isDetailView, setIsDetailView] = useState(false);
	const [topBarHeight, setTopBarHeight] = useState(INITIAL_TOP_BAR_HEIGHT);

	const { sheetHeight, setSheetHeight, dragControls, handleDrag, preventScroll, scrollRef, handleDragEnd } =
		useNavigationBottomSheet();
	const { university } = useUniversityInfo();
	const { origin, destination } = useRoutePoint();

	useRedirectUndefined<University | Building | undefined>([university, origin, destination]);

	const [currentRouteIdx, setCurrentRouteIdx] = useState(-1);
	// Caution 마커를 위한 routeIdx state
	const [cautionRouteIdx, setCautionRouteIdx] = useState(-1);

	useScrollControl();

	const [routeList, risks] = useSuspenseQueries({
		queries: [
			{
				queryKey: ["fastRoute", university?.id, origin?.nodeId ?? 1, destination?.nodeId ?? 2],
				queryFn: async () => {
					try {
						const response = await getNavigationResult(university!.id, origin!.nodeId, destination!.nodeId);
						return response;
					} catch (e) {
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
			},
		],
	});

	const controls = useAnimationControls();

	const [buttonState, setButtonState] = useState<NavigationButtonRouteType>(
		routeList.data?.defaultMode ?? "PEDES & SAFE",
	);

	const resetCurrentIndex = () => {
		setCautionRouteIdx(-1);
		setCurrentRouteIdx(-1);
	};

	const changeCurrentIndex = (index: number) => {
		setCurrentRouteIdx(index);
	};

	const showDetailView = () => {
		setIsDetailView(true);
		setSheetHeight(window.innerHeight * 0.7);
		setTopBarHeight(PADDING_FOR_MAP_BOUNDARY);
		resetCurrentIndex();
	};

	const hideDetailView = () => {
		setSheetHeight(CLOSED_SHEET_HEIGHT);
		setTopBarHeight(INITIAL_TOP_BAR_HEIGHT);
		setIsDetailView(false);
		resetCurrentIndex();
	};

	const handleButtonStateChange = (buttonType: NavigationButtonRouteType) => {
		setButtonState(buttonType);
	};

	const raiseSheet = useCallback(() => {
		new Promise<void>((resolve) => {
			controls.start({ y: 0, transition: { duration: 0.5 } });
			resolve();
		}).then(() => {
			setSheetHeight(window.innerHeight * 0.7);
			setTopBarHeight(PADDING_FOR_MAP_BOUNDARY);
		});
	}, [controls]);

	const handleCautionMarkerClick = async (index: number, isDetailView: boolean) => {
		if (isDetailView) {
			await raiseSheet();
			setTimeout(() => {
				setCurrentRouteIdx(index);
				setCautionRouteIdx(index);
			}, 500);
			return;
		}
		showDetailView();
		setCurrentRouteIdx(index);
		setTimeout(() => {
			setCautionRouteIdx(index);
		}, 800);
	};

	useEffect(() => {
		window.addEventListener("resize", hideDetailView);
		return () => {
			window.removeEventListener("resize", hideDetailView);
		};
	}, []);

	return (
		routeList.data && (
			<div className="relative h-dvh w-full  mx-auto">
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
					setCautionRouteIdx={setCautionRouteIdx}
				/>

				<AnimatedContainer
					isVisible={!isDetailView}
					positionDelta={286}
					className="absolute top-0 left-1/2 translate-x-[-50%] w-full max-w-[450px] flex flex-col space-y-2"
					isTop={true}
					transition={{ type: "spring", damping: 20, duration: 0.3 }}
				>
					<div className="w-full  min-h-[143px] bg-gray-100 flex flex-col items-center justify-center rounded-b-4xl shadow-lg">
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
					className="absolute bottom-0 left-0 w-full mb-[30px]"
					positionDelta={88}
				>
					<BottomCardList
						routeList={routeList.data!}
						buttonType={buttonState}
						showDetailView={showDetailView}
						setButtonState={setButtonState}
					></BottomCardList>
					<div
						onClick={routeList?.data[buttonState] ? showDetailView : () => {}}
						aria-disabled={routeList?.data[buttonState] ? false : true}
						className={`w-full h-15 ${routeList?.data[buttonState] ? "bg-primary-600 hover:bg-primary-700 active:bg-primary-700" : "bg-gray-500"} transition-color duration-200 flex flex-col items-center justify-center -mb-[30px] mt-4`}
					>
						<div className="text-white font-bold">상세경로 보기</div>
					</div>
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
					className="absolute bottom-0 w-full left-1/2 translate-x-[-50%] bg-white rounded-t-2xl shadow-xl overflow-auto flex items-center flex-col"
					positionDelta={window.innerHeight * 0.7}
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
							bottom: window.innerHeight * 0.35,
						},
						onDrag: handleDrag,
						onDragEnd: handleDragEnd,
					}}
					controls={controls}
				>
					<BottomSheetHandle resetCurrentIdx={resetCurrentIndex} dragControls={dragControls} />
					<div
						ref={scrollRef}
						className="w-full overflow-y-scroll overflow-x-hidden"
						style={{
							height: window.innerHeight * 0.7 - BOTTOM_SHEET_HANDLE_HEIGHT,
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
							isDetailView={isDetailView}
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
		)
	);
};

export default NavigationResultPage;
