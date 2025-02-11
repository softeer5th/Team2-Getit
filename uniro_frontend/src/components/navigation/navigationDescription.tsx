import React from "react";
import Cancel from "../../assets/icon/close.svg?react";
import CautionIcon from "../../assets/icon/cautionText.svg?react";
import SafeIcon from "../../assets/icon/safeText.svg?react";
import DestinationIcon from "../../assets/icon/destination.svg?react";
import OriginIcon from "../../assets/icon/start.svg?react";
import ResultDivider from "../../assets/icon/resultDivider.svg?react";
import { NavigationRouteList } from "../../data/types/route";
import useRoutePoint from "../../hooks/useRoutePoint";
import { formatDistance } from "../../utils/navigation/formatDistance";
import { Link } from "react-router";
import useUniversityInfo from "../../hooks/useUniversityInfo";
import { useQueryClient } from "@tanstack/react-query";

const TITLE = "전동휠체어 예상소요시간";

type TopBarProps = {
	isDetailView: boolean;
	navigationRoute: NavigationRouteList;
};

const NavigationDescription = ({ isDetailView, navigationRoute }: TopBarProps) => {
	const { origin, destination } = useRoutePoint();
	const { totalCost, totalDistance, hasCaution } = navigationRoute;

	const { university } = useUniversityInfo();
	const queryClient = useQueryClient();

	/** 지도 페이지로 돌아가게 될 경우, 캐시를 삭제하기 */
	const removeQuery = () => {
		queryClient.removeQueries({ queryKey: ['fastRoute', university?.id, origin?.nodeId, destination?.nodeId] })
	}

	return (
		<div className="w-full p-5">
			<div className={`w-full flex flex-row items-center ${isDetailView ? "justify-start" : "justify-between"}`}>
				<span className="text-left text-kor-body3 text-primary-500 flex-1 font-semibold">{TITLE}</span>
				{!isDetailView && (
					<Link to="/map" onClick={removeQuery}>
						<Cancel />
					</Link>
				)}
			</div>
			<div className="mt-4"></div>
			<div className="w-full flex flex-row items-center justify-between space-x-4">
				<div className="flex flex-row items-center justify-center">
					<div className="flex h-full text-eng-heading1 font-bold font-[SF Pro Display] mr-0.5 pb-1">
						{Math.floor(totalCost / 60)}
					</div>
					<div className="flex items-baseline text-kor-heading1 h-full text-[16px] -mb-1">분</div>
				</div>
				<div className="h-[11px] border-[0.5px] border-gray-600" />
				<div className="flex flex-row items-center justify-center truncate">
					<span>{formatDistance(totalDistance)}</span>
				</div>
				<div className="h-[11px] border-[0.5px] border-gray-600" />
				<div className="flex flex-1 flex-row items-center justify-start ">
					{navigationRoute.hasCaution ? <CautionIcon /> : <SafeIcon />}
					<span className="ml-1 text-kor-body3 text-gray-700">
						가는 길에 주의 요소가 {hasCaution ? "있어요" : "없어요"}
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
