import React, { useRef } from "react";

import ElectricIcon from "../../../assets/route/detail/electric.svg?react";
import WheelChairIcon from "../../../assets/route/detail/wheelchair.svg?react";
import WalkIcon from "../../../assets/route/detail/walkIcon.svg?react";
import { NavigationButtonRouteType, NavigationRouteListRecord } from "../../../types/route";

type Props = {
	route: NavigationRouteListRecord;
	dataLength: number;
	buttonType: NavigationButtonRouteType;
	setButtonState: (buttonType: NavigationButtonRouteType) => void;
};

const convertSecondToMinute = (time: number): number => {
	return Math.floor(time / 60);
};

const getTimeFromKeys = (route: NavigationRouteListRecord, keys: NavigationButtonRouteType[]): number | "-" => {
	for (const key of keys) {
		if (route[key]?.totalCost) {
			return convertSecondToMinute(route[key]!.totalCost);
		}
	}
	return "-";
};

const calculateTotalTime = (
	route: NavigationRouteListRecord,
	dataLength: number,
): {
	pedestrian: number | "-";
	electric: number | "-";
	wheelchair: number | "-";
} => {
	const pedestrian = getTimeFromKeys(route, ["PEDES & SAFE"]);

	const electric = getTimeFromKeys(route, ["ELECTRIC & CAUTION", "ELECTRIC & SAFE"]);

	const wheelchair = getTimeFromKeys(route, ["MANUAL & CAUTION", "MANUAL & SAFE"]);

	if (dataLength === 1) {
		return { pedestrian, electric: "-", wheelchair: "-" };
	}
	return { pedestrian, electric, wheelchair };
};
const NavigationNavBar = ({ route, dataLength, buttonType, setButtonState }: Props) => {
	const calculatedTimes = calculateTotalTime(route, dataLength);

	const containerRef = useRef<HTMLDivElement>(null);

	const keyExists = (key: NavigationButtonRouteType) => {
		return route[key] !== undefined;
	};

	const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, buttonKey: NavigationButtonRouteType) => {
		setButtonState(buttonKey);
		e.currentTarget.scrollIntoView({
			behavior: "smooth",
			inline: "center",
			block: "nearest",
		});
	};

	return (
		<div
			className="z-10 w-full flex flex-row items-center justify-start space-x-2 mt-2 px-2 overflow-x-scroll overflow-y-hidden whitespace-nowrap"
			ref={containerRef}
		>
			<div
				onClick={(e) => {
					const nextKey = keyExists("MANUAL & CAUTION") ? "MANUAL & CAUTION" : "MANUAL & SAFE";
					handleClick(e, nextKey);
				}}
				className={`flex flex-row min-w-max items-center justify-center ${buttonType === "MANUAL & SAFE" || buttonType === "MANUAL & CAUTION" ? "bg-blue-600" : "bg-blue-300"} active:bg-blue-800 transition-colors rounded-xl py-2 px-4 text-gray-100 text-kor-body3 font-light`}
			>
				<WheelChairIcon className="w-5 h-5 mr-1" />
				{`휠체어 ${calculatedTimes.wheelchair}분`}
			</div>
			<div
				onClick={(e) => {
					const nextKey = keyExists("ELECTRIC & CAUTION") ? "ELECTRIC & CAUTION" : "ELECTRIC & SAFE";
					handleClick(e, nextKey);
				}}
				className={`flex flex-row min-w-max items-center justify-center ${buttonType === "ELECTRIC & SAFE" || buttonType === "ELECTRIC & CAUTION" ? "bg-blue-600" : "bg-blue-300"} active:bg-blue-800 transition-colors rounded-xl py-2 px-4 text-gray-100 text-kor-body3 font-light`}
			>
				<ElectricIcon className="w-5 h-5 mr-1" />
				{`전동 휠체어 ${calculatedTimes.electric}분`}
			</div>

			<div
				onClick={(e) => handleClick(e, "PEDES & SAFE")}
				className={`scroll-snap-x mandatory flex flex-row min-w-max items-center justify-center ${buttonType === "PEDES & SAFE" ? "bg-blue-600" : "bg-blue-300"} active:bg-blue-800 transition-colors rounded-xl py-2 px-4 text-gray-100 text-kor-body3 font-light`}
			>
				<WalkIcon className="w-5 h-5 mr-1" />
				{`도보 ${calculatedTimes.pedestrian}분`}
			</div>
		</div>
	);
};

export default NavigationNavBar;
