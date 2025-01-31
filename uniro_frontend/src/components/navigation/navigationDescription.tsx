import React, { useState } from "react";
import Cancel from "../../assets/icon/close.svg?react";
import CautionIcon from "../../assets/icon/cautionText.svg?react";
import SafeIcon from "../../assets/icon/safeText.svg?react";
import DestinationIcon from "../../assets/icon/destination.svg?react";
import OriginIcon from "../../assets/icon/start.svg?react";
import ResultDivider from "../../assets/icon/resultDivider.svg?react";
import { NavigationRoute } from "../../data/types/route";
import { mockNavigationRoute } from "../../data/mock/hanyangRoute";
const TITLE = "전동휠체어 예상소요시간";

type TopBarProps = {
	isDetailView: boolean;
};

const NavigationDescription = ({ isDetailView }: TopBarProps) => {
	const [route, _] = useState<NavigationRoute>(mockNavigationRoute);

	return (
		<div className="w-full p-5">
			<div className={`w-full flex flex-row items-center ${isDetailView ? "justify-start" : "justify-between"}`}>
				<span className="text-left text-kor-body3 text-primary-500 flex-1 font-semibold">{TITLE}</span>
				{!isDetailView && <Cancel />}
			</div>
			<div className="mt-4"></div>
			<div className="w-full flex flex-row items-center justify-between space-x-4">
				<div className="flex flex-row items-center justify-center">
					<div className="flex h-full text-eng-heading1 font-bold font-[SF Pro Display] mr-0.5 pb-1">
						{route.totalCost}
					</div>
					<div className="flex items-baseline text-kor-heading1 h-full text-[16px] -mb-1">분</div>
				</div>
				<div className="h-[11px] border-[0.5px] border-gray-600" />
				<div className="flex flex-row items-center justify-center">
					<span>{`${route.totalDistance}m`}</span>
				</div>
				<div className="h-[11px] border-[0.5px] border-gray-600" />
				<div className="flex flex-1 flex-row items-center justify-start ">
					{route.hasCaution ? <CautionIcon /> : <SafeIcon />}
					<span className="ml-1 text-kor-body3 text-gray-700">
						가는 길에 주의 요소가 {route.hasCaution ? "있어요" : "없어요"}
					</span>
				</div>
			</div>
			<div className="w-full flex flex-row items-center justify-between mt-4">
				<div className="flex-1 flex flex-row items-start justify-start">
					<OriginIcon />
					<span className="">{route.originBuilding.buildingName}</span>
				</div>
				<ResultDivider />
				<div className="flex-1 flex flex-row items-start justify-start">
					<DestinationIcon />
					<span>{route.destinationBuilding.buildingName}</span>
				</div>
			</div>
		</div>
	);
};

export default NavigationDescription;
