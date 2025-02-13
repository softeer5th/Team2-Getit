import React from "react";

import ElectricIcon from "../assets/route/detail/electric.svg?react";
import WheelChairIcon from "../assets/route/detail/wheelchair.svg?react";
import { NavigationButtonRouteType, NavigationRouteListRecord } from "../../../data/types/route";

type Props = {
	route: NavigationRouteListRecord;
	dataLength: number;
	buttonType: NavigationButtonRouteType;
	setButtonState: (buttonType: NavigationButtonRouteType) => void;
};

const convertSecondToMinute = (time: number): number => {
	return Math.floor(time / 60);
};

const calculateTotalTime = (
	route: NavigationRouteListRecord,
	dataLength: number,
): {
	pedestrian: number | "-";
	electric: number | "-";
	wheelchair: number | "-";
} => {
	if (dataLength === 1) {
		return {
			pedestrian: convertSecondToMinute(route["PEDES & SAFE"].totalCost),
			electric: "-",
			wheelchair: "-",
		};
	}
	if (dataLength === 2) {
		return {
			pedestrian: convertSecondToMinute(route["PEDES & SAFE"].totalCost),
			electric: convertSecondToMinute(route["ELECTRIC & CAUTION"].totalCost),
			wheelchair: convertSecondToMinute(route["WHEELCHAIR & CAUTION"].totalCost),
		};
	}
	// dataLength === 3인 경우
	return {
		pedestrian: convertSecondToMinute(route["PEDES & SAFE"].totalCost),
		electric: convertSecondToMinute(route["ELECTRIC & SAFE"].totalCost),
		wheelchair: convertSecondToMinute(route["WHEELCHAIR & SAFE"].totalCost),
	};
};

const NavigationNavBar = ({ route, dataLength, buttonType, setButtonState }: Props) => {
	const calculatedTimes = calculateTotalTime(route, dataLength);

	return (
		<div className="z-10 w-full flex flex-row items-center justify-start space-x-2 mt-2 px-2 overflow-x-scroll overflow-y-hidden whitespace-nowrap">
			<div
				onClick={() => setButtonState("PEDES & SAFE")}
				className={`scroll-snap-x mandatory flex flex-row min-w-max items-center justify-center ${buttonType === "PEDES & SAFE" ? "bg-blue-600" : "bg-blue-300"} rounded-xl py-2 px-4 text-gray-100 text-kor-body3 font-light`}
			>
				<ElectricIcon className="w-5 h-5 mr-1" />
				{`도보 ${calculatedTimes.pedestrian}분`}
			</div>
			<div
				onClick={() => setButtonState("ELECTRIC & CAUTION")}
				className={`flex flex-row min-w-max items-center justify-center ${buttonType === "ELECTRIC & SAFE" || buttonType === "ELECTRIC & CAUTION" ? "bg-blue-600" : "bg-blue-300"} rounded-xl py-2 px-4 text-gray-100 text-kor-body3 font-light`}
			>
				<ElectricIcon className="w-5 h-5 mr-1" />
				{`전동 휠체어 ${calculatedTimes.electric}분`}
			</div>
			<div
				onClick={() => setButtonState("WHEELCHAIR & CAUTION")}
				className={`flex flex-row min-w-max items-center justify-center ${buttonType === "WHEELCHAIR & SAFE" || buttonType === "WHEELCHAIR & CAUTION" ? "bg-blue-600" : "bg-blue-300"} rounded-xl py-2 px-4 text-gray-100 text-kor-body3 font-light`}
			>
				<WheelChairIcon className="w-5 h-5 mr-1" />
				{`휠체어 ${calculatedTimes.wheelchair}분`}
			</div>
		</div>
	);
};

export default NavigationNavBar;
