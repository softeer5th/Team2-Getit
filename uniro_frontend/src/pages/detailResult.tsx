import React, { useEffect, useState } from "react";
import { motion, useDragControls, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

import CautionIcon from "../assets/icon/cautionText.svg?react";
import SafeIcon from "../assets/icon/safeText.svg?react";
import GoBack from "../assets/icon/goBack.svg?react";

import Map from "../component/Map";
import useScrollControl from "../hooks/useScrollControl";
import { NavigationRoute } from "../data/types/route";
import { mockNavigationRoute } from "../data/mock/hanyangRoute";
import RouteList from "../components/routeList";
import { Link, useNavigate } from "react-router";

const TITLE = "전동휠체어 예상소요시간";

const DetailResultPage = () => {
	useScrollControl();
	const [route] = useState<NavigationRoute>(mockNavigationRoute);

	const MAX_SHEET_HEIGHT = window.innerHeight * 0.7;
	const MAX_SHEET_POSITION = window.innerHeight - MAX_SHEET_HEIGHT;
	const MIN_SHEET_HEIGHT = window.innerHeight * 0.3;
	const HEADER_HEIGHT = 40;

	const dragControls = useDragControls();
	const navigate = useNavigate();

	const [isVisible, setIsVisible] = useState(true);

	const handleClick = () => {
		setIsVisible(false); // 애니메이션 실행 (이후 컴포넌트 제거됨)
		setTimeout(() => {
			navigate("/result"); // 애니메이션 후 이동
		}, 300); // transition.duration과 동일한 시간 설정
	};

	const y = useMotionValue(0);
	const smoothY = useSpring(y, { stiffness: 200, damping: 20 });

	// Map의 줌 값 (드래그할 때 자연스럽게 변함)
	const zoom = useMotionValue(1); // 기본 1 (100%)
	const smoothZoom = useSpring(zoom, { stiffness: 200, damping: 20 });

	useEffect(() => {
		const unsubscribe = smoothY.onChange((latest) => {
			const progress = latest / (MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT); // 0 ~ 1 사이의 값
			const newZoom = 1 + progress * 0.1; // 1.0 ~ 1.1 (10% 확대)
			zoom.set(newZoom);
		});
		return () => unsubscribe();
	}, [smoothY]);

	const zoomScale = useTransform(smoothZoom, (value) => `scale(${value})`);

	return (
		<div className="relative h-svh w-full max-w-[450px] mx-auto">
			<AnimatePresence>
				{isVisible && (
					<motion.div
						className="absolute top-4 left-4 z-4"
						initial={{ top: -100, opacity: 0 }}
						animate={{ top: 16, opacity: 1 }}
						exit={{ top: -100, opacity: 0 }} // 사라지는 애니메이션
						transition={{ type: "tween", duration: 0.3, delay: 0.1 }}
					>
						<button onClick={handleClick}>
							<GoBack />
						</button>
					</motion.div>
				)}
			</AnimatePresence>
			<motion.div style={{ transform: zoomScale, width: "100%", height: "100%" }}>
				<Map style={{ width: "100%", height: "100%" }} />
			</motion.div>
			<AnimatePresence>
				{isVisible && (
					<motion.div
						className="absolute bottom-0 w-full left-0 bg-white rounded-t-2xl shadow-xl overflow-auto"
						style={{
							height: MAX_SHEET_HEIGHT,
							y,
						}}
						initial={{ bottom: -MAX_SHEET_HEIGHT }}
						animate={{ bottom: 0 }}
						exit={{ bottom: -MAX_SHEET_HEIGHT }}
						transition={{ type: "spring", damping: 20, duration: 0.3 }}
						drag="y"
						dragControls={dragControls}
						dragListener={false}
						dragConstraints={{
							top: 0,
							bottom: MIN_SHEET_HEIGHT,
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
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default DetailResultPage;
