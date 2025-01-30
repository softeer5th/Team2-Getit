import React, { useEffect, useState } from "react";
import { motion, useDragControls, useMotionValue, useSpring, useTransform } from "framer-motion";
import TopBar from "../components/topBar";
import Map from "../component/Map";
import Button from "../components/customButton";
import CautionIcon from "../assets/icon/cautionText.svg?react";
import SafeIcon from "../assets/icon/safeText.svg?react";
import GoBack from "../assets/icon/goBack.svg?react";
import RouteList from "../components/routeList";

import { mockNavigationRoute } from "../data/mock/hanyangRoute";
import { NavigationRoute } from "../data/types/route";
import useScrollControl from "../hooks/useScrollControl";
import AnimatedContainer from "../container/animatedContainer";
import NavigationMap from "../component/NavgationMap";

const TITLE = "전동휠체어 예상소요시간";

const MergedRoutePage = () => {
	useScrollControl();

	const [isDetailView, setIsDetailView] = useState(false);

	const [route, _] = useState<NavigationRoute>(mockNavigationRoute);

	const MAX_SHEET_HEIGHT = window.innerHeight * 0.7; // 최대로 올렸을 때 시트 높이
	const MIN_SHEET_HEIGHT = window.innerHeight * 0.3; // 최소로 내렸을 때 시트 높이
	const HEADER_HEIGHT = 40;

	const dragControls = useDragControls();
	const y = useMotionValue(0);
	const smoothY = useSpring(y, { stiffness: 200, damping: 20 });
	const zoom = useMotionValue(1);
	const smoothZoom = useSpring(zoom, { stiffness: 200, damping: 20 });
	const zoomScale = useTransform(smoothZoom, (value) => `scale(${value})`);

	useEffect(() => {
		const unsubscribe = smoothY.onChange((latest) => {
			const progress = latest / (MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT);
			const newZoom = 1 + progress * 0.1;
			zoom.set(newZoom);
		});
		return () => unsubscribe();
	}, [smoothY, zoom]);

	const showDetailView = () => setIsDetailView(true);
	const hideDetailView = () => setIsDetailView(false);

	useEffect(() => {
		console.log(route);
	}, []);

	return (
		<div className="relative h-svh w-full max-w-[450px] mx-auto">
			<TopBar isDetailView={isDetailView} />
			<motion.div
				style={{
					transform: zoomScale,
					width: "100%",
					height: "100%",
				}}
			>
				<NavigationMap
					style={{ width: "100%", height: "100%" }}
					routes={route}
					startBuilding={route.startBuilding}
					destinationBuilding={route.destinationBuilding}
				/>
			</motion.div>
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
				}}
			>
				<div
					className="w-full h-[40px] flex flex-col justify-center items-center cursor-grab"
					style={{ touchAction: "none" }}
					onPointerDown={(e) => dragControls.start(e)}
				>
					<div className="w-1/6 h-[4px] bg-[#CACACA] rounded-full" />
				</div>
				<div className="w-full overflow-y-scroll" style={{ height: MAX_SHEET_HEIGHT - HEADER_HEIGHT }}>
					<div className="w-full px-4">
						<div className="flex flex-row items-center justify-between mb-4">
							<div className="text-kor-body3 text-primary-500 font-semibold">{TITLE}</div>
						</div>
						<div className="w-full flex flex-row items-center justify-between space-x-4 mb-6">
							<div className="flex flex-1 flex-row items-center justify-center">
								<div className="text-eng-heading1 font-bold mr-1 pb-1">{route.totalCost}</div>
								<div className="text-[16px] -mb-1">분</div>
							</div>
							<div className="h-[11px] border-[0.5px] border-gray-600" />
							<div className="flex flex-1 flex-row items-center justify-center">
								<span>{route.totalDistance}m</span>
							</div>
							<div className="h-[11px] border-[0.5px] border-gray-600" />
							<div className="flex flex-row items-center justify-center">
								{route.hasCaution ? <CautionIcon /> : <SafeIcon />}
								<span className="ml-2 text-gray-700">
									가는 길에 주의 요소가 {route.hasCaution ? "있어요" : "없어요"}
								</span>
							</div>
						</div>
					</div>
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

export default MergedRoutePage;
