import React from "react";
import Cancel from "../../assets/icon/close.svg?react";
import CautionIcon from "../../assets/icon/cautionText.svg?react";
import SafeIcon from "../../assets/icon/safeText.svg?react";
import DestinationIcon from "../../assets/icon/destination.svg?react";
import OriginIcon from "../../assets/icon/start.svg?react";
import ResultDivider from "../../assets/icon/resultDivider.svg?react";
import { NavigationButtonRouteType, NavigationRouteList, NavigationRouteType } from "../../data/types/route";
import useRoutePoint from "../../hooks/useRoutePoint";
import { formatDistance } from "../../utils/navigation/formatDistance";
import { Link } from "react-router";
import useUniversityInfo from "../../hooks/useUniversityInfo";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

type TopBarProps = {
	isDetailView: boolean;
	navigationRoute: NavigationRouteList;
	buttonType: NavigationButtonRouteType;
};

type AnimatedValueProps = {
	value: number | string;
	className?: string;
};

const createTitle = (buttonType: NavigationButtonRouteType) => {
	if (buttonType.includes("PEDES")) return "도보 예상소요시간";
	if (buttonType.includes("MANUAL")) return "수동휠체어 예상소요시간";
	if (buttonType.includes("ELECTRIC")) return "전동휠체어 예상소요시간";
};

const AnimatedValue = ({ value, className }: AnimatedValueProps) => {
	return (
		<AnimatePresence mode="wait">
			<motion.div
				className={className}
				key={value} // value가 바뀔 때마다 컴포넌트 key가 달라지므로 재렌더 + 애니메이션
				initial={{ opacity: 0, y: -16 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 16 }}
				transition={{ duration: 0.2 }}
			>
				{value}
			</motion.div>
		</AnimatePresence>
	);
};

const NavigationDescription = ({ isDetailView, navigationRoute, buttonType }: TopBarProps) => {
	const { origin, destination } = useRoutePoint();

	const { university } = useUniversityInfo();
	const queryClient = useQueryClient();

	/** 지도 페이지로 돌아가게 될 경우, 캐시를 삭제하기 */
	const removeQuery = () => {
		queryClient.removeQueries({ queryKey: ["fastRoute", university?.id, origin?.nodeId, destination?.nodeId] });
	};

	return (
		<div className="w-full p-5">
			<div className={`w-full flex flex-row items-center ${isDetailView ? "justify-start" : "justify-between"}`}>
				<AnimatedValue
					className="text-left text-kor-body3 text-primary-500 flex-1 font-semibold"
					value={createTitle(buttonType) ?? "전동 휠체어 예상소요시간"}
				/>
				{!isDetailView && (
					<Link to="/map" onClick={removeQuery}>
						<Cancel />
					</Link>
				)}
			</div>
			<div className="mt-4"></div>
			<div className="w-full flex flex-row items-center justify-between space-x-4">
				<div className="flex flex-row items-center justify-center">
					<AnimatedValue
						value={navigationRoute?.totalCost ? Math.floor(navigationRoute.totalCost / 60) : "  -  "}
						className="text-eng-heading1 font-bold font-[SF Pro Display] mr-0.5 pb-1"
					/>

					<div className="flex items-baseline text-kor-heading1 h-full text-[16px] -mb-1">분</div>
				</div>
				<div className="h-[11px] border-[0.5px] border-gray-600" />
				<div className="flex flex-row items-center justify-center truncate">
					<AnimatedValue
						value={navigationRoute?.totalDistance ? formatDistance(navigationRoute.totalDistance) : " - m "}
					/>
				</div>
				<div className="h-[11px] border-[0.5px] border-gray-600" />
				<div className="flex flex-1 flex-row items-center justify-start ">
					{navigationRoute ? navigationRoute.hasCaution ? <CautionIcon /> : <SafeIcon /> : null}
					<span className="ml-1 text-kor-body3 text-gray-700">
						{navigationRoute
							? `가는 길에 주의 요소가 ${navigationRoute?.hasCaution ? "있어요" : "없어요"}`
							: "  배리어프리 경로가 존재하지 않습니다.  "}
					</span>
				</div>
			</div>
			<div className="w-full flex flex-row items-center justify-between mt-4">
				<div className="flex-1 flex flex-row items-start justify-start">
					<OriginIcon />
					<span className="">{origin?.buildingName}</span>
				</div>
				<ResultDivider />
				<div className="flex-1 flex flex-row items-start justify-start">
					<DestinationIcon />
					<span>{destination?.buildingName}</span>
				</div>
			</div>
		</div>
	);
};

export default NavigationDescription;
