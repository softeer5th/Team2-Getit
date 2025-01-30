import React, { useCallback, useState } from "react";
import { PanInfo, useDragControls } from "framer-motion";
import TopBar from "../components/topBar";
import Button from "../components/customButton";
import GoBack from "../assets/icon/goBack.svg?react";
import RouteList from "../components/routeList";

import { mockNavigationRoute } from "../data/mock/hanyangRoute";
import { NavigationRoute } from "../data/types/route";
import useScrollControl from "../hooks/useScrollControl";
import AnimatedContainer from "../container/animatedContainer";
import NavigationMap from "../component/NavgationMap";
import NavigationDescription from "../components/navigation/navigationDescription";
import BottomSheetHandle from "../components/navigation/bottomSheetHandle";

const TITLE = "전동휠체어 예상소요시간";

// 1. 돌아가면 위치 reset ✅
// 2. 상세경로 scroll 끝까지 가능하게 하기 ❎
// 3. 레이아웃 맞추기
// 4. 코드 리팩토링 하기

const NavigationResultPage = () => {
	const MAX_SHEET_HEIGHT = window.innerHeight * 0.7;
	const MIN_SHEET_HEIGHT = window.innerHeight * 0.35;

	const HEADER_HEIGHT = 40;

	const [isDetailView, setIsDetailView] = useState(false);

	const [sheetHeight, setSheetHeight] = useState(0);
	const [topBarHeight, setTopBarHeight] = useState(143);

	const [route, setRoute] = useState<NavigationRoute>(mockNavigationRoute);
	const [totalHeight, setTotalHeight] = useState(0);

	useScrollControl();

	const dragControls = useDragControls();

	const showDetailView = () => {
		setSheetHeight(MAX_SHEET_HEIGHT);
		setTopBarHeight(50);
		setIsDetailView(true);
	};
	const hideDetailView = () => {
		setSheetHeight(0);
		setTopBarHeight(143);
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
			<TopBar isVisible={!isDetailView} />
			<NavigationMap
				style={{ width: "100%", height: "100%" }}
				routes={route}
				topPadding={topBarHeight}
				bottomPadding={sheetHeight}
			/>
			<AnimatedContainer
				isVisible={!isDetailView}
				className="absolute bottom-0 left-0 w-full mb-[30px] px-4"
				positionDelta={88}
			>
				<Button className="" onClick={showDetailView}>
					상세경로 보기
				</Button>
			</AnimatedContainer>

			<AnimatedContainer
				isVisible={isDetailView}
				className="absolute top-4 left-4 z-10"
				positionDelta={60}
				isTop={true}
			>
				<button onClick={hideDetailView}>
					<GoBack />
				</button>
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
						height: MAX_SHEET_HEIGHT - HEADER_HEIGHT - totalHeight,
						maxHeight: MAX_SHEET_HEIGHT - HEADER_HEIGHT,
					}}
				>
					<NavigationDescription isDetailView={isDetailView} />
					<RouteList
						routes={route.route}
						startBuilding={route.startBuilding}
						destBuilding={route.destinationBuilding}
					/>
				</div>
			</AnimatedContainer>
		</div>
	);
};

export default NavigationResultPage;
