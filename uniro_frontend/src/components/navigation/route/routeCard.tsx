import OriginIcon from "../../../assets/route/start.svg?react";
import DestinationIcon from "../../../assets/route/dest.svg?react";
import StraightIcon from "../../../assets/route/straight.svg?react";
import RightIcon from "../../../assets/route/right.svg?react";
import LeftIcon from "../../../assets/route/left.svg?react";
import CautionText from "../../../assets/icon/cautionText.svg?react";
import { RouteEdge } from "../../../data/types/edge";
import { Building } from "../../../data/types/node";

const NumberIcon = ({ index }: { index: number }) => {
	return (
		<div className="w-[18px] h-[18px] rounded-[9px] bg-[#9AC2FD] flex flex-center items-center justify-center">
			<div className="text-white text-[11px] text-left">{index}</div>
		</div>
	);
};

export const RouteCard = ({
	index,
	route,
	originBuilding,
	destinationBuilding,
}: {
	index: number;
	route: RouteEdge;
	originBuilding: Building;
	destinationBuilding: Building;
}) => {
	switch (route.direction) {
		case "straight":
			return (
				<div className="flex flex-row items-center justify-start ml-8 my-5">
					<div className="flex flex-col items-center justify-start space-y-1">
						<StraightIcon />
						<div className="text-primary-400 text-kor-body3 text-[12px]">{route.distance}m</div>
					</div>
					<div className="flex flex-row items-center justify-center ml-4 space-x-[14px]">
						<NumberIcon index={index} />
						<div className="text-kor-body1 text-gray-900">직진</div>
					</div>
				</div>
			);
		case "right":
			return (
				<div className="flex flex-row items-center justify-start ml-8 my-5">
					<div className="flex flex-col items-center justify-start space-y-1">
						<RightIcon />
						<div className="text-primary-400 text-kor-body3 text-[12px]">{route.distance}m</div>
					</div>
					<div className="flex flex-row items-center justify-center ml-4 space-x-[14px]">
						<NumberIcon index={index} />
						<div className="text-kor-body1 text-gray-900">우회전</div>
					</div>
				</div>
			);
		case "left":
			return (
				<div className="flex flex-row items-center justify-start ml-8 my-5">
					<div className="flex flex-col items-center justify-start space-y-1">
						<LeftIcon />
						<div className="text-primary-400 text-kor-body3 text-[12px]">{route.distance}m</div>
					</div>
					<div className="flex flex-row items-center justify-center ml-4 space-x-[14px]">
						<NumberIcon index={index} />
						<div className="text-kor-body1 text-gray-900">좌회전</div>
					</div>
				</div>
			);
		case "uturn":
			return (
				<div className="flex flex-row items-center justify-start ml-8 my-5">
					<div className="flex flex-col items-center justify-start space-y-1">
						<StraightIcon />
						<div className="text-primary-400 text-kor-body3 text-[12px]">{route.distance}m</div>
					</div>
					<div className="flex flex-row items-center justify-center ml-4 space-x-[14px]">
						<NumberIcon index={index} />
						<div className="text-kor-body1 text-gray-900">U턴</div>
					</div>
				</div>
			);
		case "origin":
			return (
				<div className="flex flex-row items-center justify-start ml-8 my-5">
					<div className="flex flex-col items-center justify-start space-y-1">
						<OriginIcon />
						<div className="text-[#5F5F5F] text-kor-body3 text-[12px]">출발</div>
					</div>
					<div className="flex flex-col items-start justify-center ml-4">
						<div className="text-kor-body1 text-gray-900">{originBuilding.buildingName}</div>
						<div className="text-kor-body3 text-gray-700">{originBuilding.address}</div>
					</div>
				</div>
			);
		case "destination":
			return (
				<div className="flex flex-row items-center justify-start ml-8 my-5">
					<div className="flex flex-col items-center justify-start space-y-1">
						<DestinationIcon />
						<div className="text-[#5F5F5F] text-kor-body3 text-[12px]">도착</div>
					</div>
					<div className="flex flex-col items-start justify-center ml-4">
						<div className="text-kor-body1 text-gray-900">{destinationBuilding.buildingName}</div>
						<div className="text-kor-body3 text-gray-700">{destinationBuilding.address}</div>
					</div>
				</div>
			);
		case "caution":
			return (
				<div className="flex flex-row items-center justify-start ml-8 my-5">
					<div className="flex flex-col items-center justify-start space-y-1">
						<CautionText />
						<div className="text-system-orange text-kor-body3 text-[12px]">{route.distance}m</div>
					</div>
					<div className="flex flex-row items-center justify-center ml-4 space-x-[14px]">
						<NumberIcon index={index} />
						<div className="text-kor-body1 text-gray-900">턱이 있어요</div>
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
