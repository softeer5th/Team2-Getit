import React from "react";

import Cancel from "../assets/icon/close.svg?react";
import CautionIcon from "../assets/icon/cautionText.svg?react";
import DestinationIcon from "../assets/icon/destination.svg?react";
import StartIcon from "../assets/icon/start.svg?react";
import ResultDividier from "../assets/icon/resultDivider.svg?react";

const TopBar = () => {
	return (
		<div className="max-w-[450px] w-full min-h-[143px] bg-gray-100 pt-[16px] pb-5 px-[29px] flex flex-col items-center justify-center rounded-b-4xl shadow-lg">
			<div className="w-full flex flex-row items-center justify-between">
				<span className="text-left text-kor-body3 text-primary-500 flex-1 font-semibold">
					전동휠체어 예상소요시간
				</span>
				<Cancel />
			</div>
			<div className="mt-4"></div>
			<div className="w-full flex flex-row items-center justify-between space-x-4">
				<div className="flex flex-1 flex-row items-center justify-center">
					<div className="flex h-full text-eng-heading1 font-bold font-[SF Pro Display] mr-0.5 pb-1">10</div>
					<div className="flex items-baseline text-kor-heading1 h-full text-[16px] -mb-1">분</div>
				</div>
				<div className="h-[11px] border-[0.5px] border-gray-600" />
				<div className="flex flex-1 flex-row items-center justify-center">
					<span>635m</span>
				</div>
				<div className="h-[11px] border-[0.5px] border-gray-600" />
				<div className="flex flex-row items-center justify-center">
					<CautionIcon />
					<span className="ml-2 text-kor-body3 text-gray-700">가는 길에 주의 요소가 있어요</span>
				</div>
			</div>
			<div className="w-full flex flex-row items-center justify-between mt-4">
				<div className="flex-1 flex flex-row items-start justify-start">
					<StartIcon />
					<span className="">한양대학교 법학관</span>
				</div>
				<ResultDividier />
				<div className="flex-1 flex flex-row items-start justify-start">
					<DestinationIcon />
					<span>한양대학교 제2공학관</span>
				</div>
			</div>
		</div>
	);
};

export default TopBar;
