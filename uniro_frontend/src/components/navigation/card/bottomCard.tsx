import React from "react";
import CautionIcon from "../../../assets/icon/cautionText.svg?react";
import SafeIcon from "../../../assets/icon/safeText.svg?react";

import CautionIconWhite from "../../../assets/icon/cautionTextWhite.svg?react";
import SafeIconWhite from "../../../assets/icon/safeTextWhite.svg?react";
import { RouteType } from "../../../data/types/route";
import { formatDistance } from "../../../utils/navigation/formatDistance";

interface BottomCardProps {
	routeInfo?: {
		totalCost: number;
		totalDistance: number;
	};
	type: RouteType;
	selected: boolean;
	onClick: () => void;
}

const themes: Record<
	RouteType,
	{
		color: { selected: string; unselected: string };
		label: string;
		icon: {
			selected: JSX.Element;
			unselected: JSX.Element;
		};
	}
> = {
	caution: {
		color: {
			unselected:
				"border-system-orange bg-white hover:bg-system-orange text-system-orange active:border-system-orange active:bg-system-orange active:text-white",
			selected: "border-system-orange bg-system-orange text-white active:border-[#B85C00] active:bg-[#B85C00] ",
		},
		label: "주의 경로",
		icon: {
			selected: <CautionIconWhite />,
			unselected: <CautionIcon />,
		},
	},
	safe: {
		color: {
			unselected:
				"border-mint-500 bg-white hover:bg-mint-500 text-mint-500 active:bg-mint-500 active:border-mint-500 active:text-white",
			selected: "border-mint-500 bg-mint-500 text-white active:bg-[#004F49] active:border-[#004F49]",
		},
		label: "안전 경로",
		icon: {
			selected: <SafeIconWhite />,
			unselected: <SafeIcon />,
		},
	},
	normal: {
		color: {
			unselected: "border-primary-500 bg-white hover:bg-primary-500 text-primary-500",
			selected: "border-primary-500 bg-primary-500 text-white active:bg-primary-700 active:border-primary-700",
		},
		label: "일반 경로",
		icon: {
			// 일반 Icon으로 바꿀 예정
			selected: <></>,
			unselected: <></>,
		},
	},
};

const BottomCard: React.FC<BottomCardProps> = ({ routeInfo, type, selected, onClick }) => {
	const theme = themes[type];

	return (
		<div
			className={`flex-1 flex flex-row h-24 border-2 rounded-xl p-3 hover:text-white transition-all duration-100 ${
				theme.color[selected ? "selected" : "unselected"]
			}`}
			onClick={onClick}
		>
			<div className="flex-1 flex-col items-start justify-start">
				<div className="flex-1 flex flex-row max-sm:flex-col max-sm:items-start items-center justify-start text-left">
					<div className="flex flex-row items-end h-full text-eng-heading1 font-bold font-[SF Pro Display] mr-0.5 pb-1">
						{routeInfo?.totalCost ? Math.floor(routeInfo.totalCost / 60) : "-"}
						<span className="items-end h-full text-[16px] -mb-1 font-semibold max-sm:text-[12px] ml-[1px]">
							분
						</span>
					</div>
					<div className="flex items-baseline text-kor-heading1 h-full text-[16px] -mb-1 font-semibold max-sm:text-[12px]">
						<div className="font-normal ml-[1px] sm:ml-1 sm:-mb-1">{theme.label}</div>
					</div>
				</div>
				<div className="text-left ml-[1px] mr-0.5 mt-1 text-[14px]">
					{routeInfo?.totalDistance ? formatDistance(routeInfo.totalDistance) : "- m"}
				</div>
			</div>
			{theme.icon[selected ? "selected" : "unselected"]}
		</div>
	);
};

export default BottomCard;
