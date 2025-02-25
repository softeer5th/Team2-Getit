import OriginIcon from "../../../assets/route/start.svg?react";
import DestinationIcon from "../../../assets/route/dest.svg?react";
import StraightIcon from "../../../assets/route/straight.svg?react";
import RightIcon from "../../../assets/route/right.svg?react";
import LeftIcon from "../../../assets/route/left.svg?react";
import CautionText from "../../../assets/icon/cautionText.svg?react";
import DangerText from "../../../assets/icon/dangerText.svg?react";
import { RouteDetail } from "../../../types/route";
import useRoutePoint from "../../../hooks/useRoutePoint";
import { formatDistance } from "../../../utils/navigation/formatDistance";
import { CautionIssue, DangerIssue } from "../../../constant/enum/reportEnum";

const NumberIcon = ({ index }: { index: number }) => {
	return (
		<div className="w-[18px] h-[18px] rounded-[9px] bg-[#9AC2FD] flex flex-center items-center justify-center flex-shrink-0">
			<div className="text-white text-[11px] text-left">{index}</div>
		</div>
	);
};

export const RouteCard = ({
	changeCurrentRouteIdx,
	currentRouteIdx,
	index,
	route,
}: {
	changeCurrentRouteIdx: (index: number) => void;
	currentRouteIdx: number;
	index: number;
	route: RouteDetail;
}) => {
	const { dist: distance, directionType, cautionFactors, dangerFactors } = route;
	const formattedDistance = formatDistance(distance);
	const { origin, destination } = useRoutePoint();
	const onClick = () => {
		changeCurrentRouteIdx(index);
	};
	switch (directionType.toLocaleLowerCase()) {
		case "straight":
			return (
				<div
					onClick={onClick}
					className={`grid grid-cols-10 items-center justify-start pl-8 py-5 transition-colors active:shadow-inner ${currentRouteIdx === index ? "bg-primary-100" : ""}`}
				>
					<div className="flex flex-col min-w-10 flex-shrink-0 items-center justify-start space-y-1 col-span-1">
						<StraightIcon />
						<div className="text-primary-400 text-kor-body3 text-[12px]">{formattedDistance}</div>
					</div>
					<div className="flex flex-row items-center justify-start ml-4 space-x-[14px] col-span-9">
						<NumberIcon index={index} />
						<div className="text-kor-body1 text-gray-900">직진</div>
					</div>
				</div>
			);
		case "right":
			return (
				<div
					onClick={onClick}
					className={`grid grid-cols-10 items-center justify-start pl-8 py-5 transition-colors ${currentRouteIdx === index ? "bg-primary-100" : ""}`}
				>
					<div className="flex flex-col min-w-10 flex-shrink-0 items-center justify-start space-y-1 col-span-1">
						<RightIcon />
						<div className="text-primary-400 text-kor-body3 text-[12px]">{formattedDistance}</div>
					</div>
					<div className="flex flex-row items-center justify-start ml-4 space-x-[14px] col-span-9">
						<NumberIcon index={index} />
						<div className="text-kor-body1 text-gray-900">우회전</div>
					</div>
				</div>
			);
		case "sharp_right":
			return (
				<div
					onClick={onClick}
					className={`grid grid-cols-10 items-center justify-start pl-8 py-5 transition-colors ${currentRouteIdx === index ? "bg-primary-100" : ""}`}
				>
					<div className="flex flex-col min-w-10 flex-shrink-0 items-center justify-start space-y-1 col-span-1">
						<RightIcon />
						<div className="text-primary-400 text-kor-body3 text-[12px]">{formattedDistance}</div>
					</div>
					<div className="flex flex-row items-center justify-start ml-4 space-x-[14px] col-span-9">
						<NumberIcon index={index} />
						<div className="text-kor-body1 text-gray-900">우회전</div>
					</div>
				</div>
			);
		case "left":
			return (
				<div
					onClick={onClick}
					className={`grid grid-cols-10 items-centerjustify-start pl-8 py-5 transition-colors ${currentRouteIdx === index ? "bg-primary-100" : ""}`}
				>
					<div className="flex flex-col min-w-10 flex-shrink-0 items-center justify-start space-y-1 col-span-1">
						<LeftIcon />
						<div className="text-primary-400 text-kor-body3 text-[12px]">{formattedDistance}</div>
					</div>
					<div className="flex flex-row items-center justify-start ml-4 space-x-[14px] col-span-9">
						<NumberIcon index={index} />
						<div className="text-kor-body1 text-gray-900">좌회전</div>
					</div>
				</div>
			);
		case "sharp_left":
			return (
				<div
					onClick={onClick}
					className={`grid grid-cols-10 items-center justify-start pl-8 py-5 transition-colors ${currentRouteIdx === index ? "bg-primary-100" : ""}`}
				>
					<div className="flex flex-col min-w-10 flex-shrink-0 items-center justify-start space-y-1 col-span-1">
						<LeftIcon />
						<div className="text-primary-400 text-kor-body3 text-[12px]">{formattedDistance}</div>
					</div>
					<div className="flex flex-row items-center justify-start ml-4 space-x-[14px] col-span-9">
						<NumberIcon index={index} />
						<div className="text-kor-body1 text-gray-900">좌회전</div>
					</div>
				</div>
			);
		case "uturn":
			return (
				<div
					onClick={onClick}
					className={`grid grid-cols-10 items-center justify-start pl-8 py-5 transition-colors ${currentRouteIdx === index ? "bg-primary-100" : ""}`}
				>
					<div className="flex flex-col min-w-10 flex-shrink-0 items-center justify-start space-y-1 col-span-1">
						<StraightIcon />
						<div className="text-primary-400 text-kor-body3 text-[12px]">{formattedDistance}</div>
					</div>
					<div className="flex flex-row items-center justify-start ml-4 space-x-[14px] col-span-9">
						<NumberIcon index={index} />
						<div className="text-kor-body1 text-gray-900">유턴</div>
					</div>
				</div>
			);
		case "origin":
			return (
				<div
					onClick={onClick}
					className={`grid grid-cols-10 w-full items-center justify-start pl-8 py-5 transition-colors ${currentRouteIdx === index ? "bg-primary-100" : ""}`}
				>
					<div className="flex flex-col min-w-10 flex-shrink-0 items-center justify-start space-y-1">
						<OriginIcon />
						<div className="text-[#5F5F5F] text-kor-body3 text-[12px]">출발</div>
					</div>
					<div className="flex flex-col items-start justify-center ml-4 w-full col-span-9">
						<div className="text-kor-body1 text-gray-900">{origin?.buildingName}</div>
						<div className="text-kor-body3 text-gray-700">{origin?.address}</div>
					</div>
				</div>
			);
		case "finish":
			return (
				<div
					onClick={onClick}
					className={`grid grid-cols-10 w-full items-center justify-start pl-8 py-5 transition-colors ${currentRouteIdx === index ? "bg-primary-100" : ""}`}
				>
					<div className="flex flex-col min-w-10 flex-shrink-0 items-center justify-start space-y-1 col-span-1">
						<DestinationIcon />
						<div className="text-[#5F5F5F] text-kor-body3 text-[12px]">도착</div>
					</div>
					<div className="flex flex-col items-start justify-center ml-4 col-span-9">
						<div className="text-kor-body1 text-gray-900">{destination?.buildingName}</div>
						<div className="text-kor-body3 text-gray-700">{destination?.address}</div>
					</div>
				</div>
			);
		case "caution":
			return (
				<div
					onClick={onClick}
					className={`grid grid-cols-10 items-center justify-start pl-8 py-5 transition-colors ${currentRouteIdx === index ? "bg-primary-100" : ""}`}
				>
					<div className="flex flex-col min-w-10 flex-shrink-0 items-center justify-center space-y-1 col-span-1">
						<CautionText />
						<div className="text-system-orange text-kor-body3 text-[12px]">{formattedDistance}</div>
					</div>
					<div className="flex flex-row items-center justify-start ml-4 space-x-[14px] col-span-9">
						<NumberIcon index={index} />
						<div className="text-left text-kor-body1 max-sm:text-[12px] text-gray-900 word-break">
							{cautionFactors && cautionFactors.length > 0
								? cautionFactors
										.map((factor) => CautionIssue[factor as keyof typeof CautionIssue])
										.join(", ")
								: "주의 요소가 없습니다."}
						</div>
					</div>
				</div>
			);
		case "danger":
			return (
				<div
					onClick={onClick}
					className={`grid grid-cols-10 items-center justify-start pl-8 py-5 transition-colors ${currentRouteIdx === index ? "bg-primary-100" : ""}`}
				>
					<div className="flex flex-col min-w-10 items-center justify-center space-y-1">
						<DangerText />
						<div className="text-system-red text-kor-body3 text-[12px]">{formattedDistance}</div>
					</div>
					<div className="flex flex-row items-center justify-start ml-4 space-x-[14px] col-span-9">
						<NumberIcon index={index} />
						<div className="text-left text-kor-body1 max-sm:text-[12px] text-gray-900 overflow-x-auto">
							{dangerFactors && dangerFactors.length > 0
								? dangerFactors
										.map((factor) => DangerIssue[factor as keyof typeof DangerIssue])
										.join(", ")
								: "위험 요소가 없습니다."}
						</div>
					</div>
				</div>
			);
		default:
			return (
				<div className="flex flex-row items-start justify-start">
					<span>알 수 없음</span>
				</div>
			);
	}
};
