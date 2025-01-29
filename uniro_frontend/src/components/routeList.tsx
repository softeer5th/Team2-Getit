import React from "react";
import { RouteEdge } from "../data/types/edge";
import { Building } from "../data/types/node";

import StartIcon from "../assets/route/start.svg?react";
import DestinationIcon from "../assets/route/dest.svg?react";
import StraightIcon from "../assets/route/straight.svg?react";
import RightIcon from "../assets/route/right.svg?react";
import LeftIcon from "../assets/route/left.svg?react";

type Props = {
	routes: RouteEdge[];
	startBuilding: Building;
	destBuilding: Building;
};
const Divider = () => <div className="border-[0.5px] border-gray-200 w-full"></div>;

const NumberIcon = ({ index }: { index: number }) => {
	return (
		<div className="w-[18px] h-[18px] rounded-[9px] bg-[#9AC2FD] flex flex-center items-center justify-center">
			<div className="text-white text-[11px] text-left">{index}</div>
		</div>
	);
};

const Route = ({
	index,
	route,
	startBuilding,
	destBuilding,
}: {
	index: number;
	route: RouteEdge;
	startBuilding: Building;
	destBuilding: Building;
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
		case "start":
			return (
				<div className="flex flex-row items-center justify-start ml-8 my-5">
					<div className="flex flex-col items-center justify-start space-y-1">
						<StartIcon />
						<div className="text-[#5F5F5F] text-kor-body3 text-[12px]">출발</div>
					</div>
					<div className="flex flex-col items-start justify-center ml-4">
						<div className="text-kor-body1 text-gray-900">{startBuilding.buildingName}</div>
						<div className="text-kor-body3 text-gray-700">{startBuilding.address}</div>
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
						<div className="text-kor-body1 text-gray-900">{destBuilding.buildingName}</div>
						<div className="text-kor-body3 text-gray-700">{destBuilding.address}</div>
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

const RouteList = ({ routes, startBuilding, destBuilding }: Props) => {
	return (
		<div className="">
			{routes.map((route, index) => (
				<>
					<Divider key={`${route.id}-divider`} />
					<div key={route.id} className="flex flex-col">
						<Route index={index} route={route} startBuilding={startBuilding} destBuilding={destBuilding} />
					</div>
				</>
			))}
		</div>
	);
};

export default RouteList;
