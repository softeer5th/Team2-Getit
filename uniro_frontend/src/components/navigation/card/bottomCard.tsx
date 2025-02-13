import React from "react";
import CautionIcon from "../../../assets/icon/cautionText.svg?react";
import SafeIcon from "../../../assets/icon/safeText.svg?react";

import CautionIconWhite from "../../../assets/icon/cautionTextWhite.svg?react";
import SafeIconWhite from "../../../assets/icon/safeTextWhite.svg?react";
import { RouteType } from "../../../data/types/route";

interface BottomCardProps {
	type: RouteType;
	selected: boolean;
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
			unselected: "border-system-orange bg-white hover:bg-system-orange text-system-orange",
			selected: "border-system-orange bg-system-orange text-white",
		},
		label: "주의 경로",
		icon: {
			selected: <CautionIconWhite />,
			unselected: <CautionIcon />,
		},
	},
	safe: {
		color: {
			unselected: "border-mint-500 bg-white hover:bg-mint-500 text-mint-500",
			selected: "border-mint-500 bg-mint-500 text-white",
		},
		label: "안전 경로",
		icon: {
			selected: <SafeIconWhite />,
			unselected: <SafeIcon />,
		},
	},
};

const BottomCard: React.FC<BottomCardProps> = ({ type, selected }) => {
	const theme = themes[type];

	return (
		<div
			className={`flex-1 flex flex-row h-24 border-2 rounded-xl p-3 hover:text-white transition-all ${
				theme.color[selected ? "selected" : "unselected"]
			}`}
		>
			<div className="flex-1 flex-col items-start justify-start">
				<div className="flex-1 flex flex-row items-center justify-start text-left">
					<div className="flex h-full text-eng-heading1 font-bold font-[SF Pro Display] mr-0.5 pb-1">
						{10}
					</div>
					<div className="flex items-baseline text-kor-heading1 h-full text-[16px] -mb-1 font-semibold">
						분<span className="font-normal ml-2 -mb-1">{theme.label}</span>
					</div>
				</div>
				<div className="text-left ml-1 mr-0.5 mt-1 text-[14px]">475m</div>
			</div>
			{theme.icon[selected ? "selected" : "unselected"]}
		</div>
	);
};

export default BottomCard;
