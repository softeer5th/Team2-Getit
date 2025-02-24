import SearchIcon from "../../assets/icon/search.svg?react";
import OriginIcon from "../../assets/map/origin.svg?react";
import SwitchIcon from "../../assets/switch.svg?react";
import DestinationIcon from "../../assets/map/destination.svg?react";
import LocationIcon from "../../assets/location-thin.svg?react";
import ChevronLeft from "../../../public/icons/chevron-left.svg?react";
import useRoutePoint from "../../hooks/useRoutePoint";
import useSearchBuilding from "../../hooks/useSearchBuilding";
import AnimatedContainer from "../../container/animatedContainer";
import { BuildingInput, RouteInput } from "./mapSearchInput";
import useUniversityInfo from "../../hooks/useUniversityInfo";

interface MapTopSheetProps {
	isVisible: boolean;
}

export function MapTopBuildingSheet({ isVisible }: MapTopSheetProps) {
	const { setSearchMode } = useSearchBuilding();
	const { university } = useUniversityInfo();

	return (
		<AnimatedContainer
			isVisible={isVisible}
			className="absolute top-0 w-full max-w-[450px] left-1/2 translate-x-[-50%] py-[18px] px-2  rounded-b-2xl overflow-auto z-20"
			positionDelta={300}
			transition={{
				type: "spring",
				damping: 20,
				duration: 0.3,
			}}
			isTop={true}
		>
			<div className="flex-1 flex flex-row space-x-2">
				<BuildingInput onClick={() => {}} placeholder={`${university?.name} 건물을 검색해보세요`}>
					<SearchIcon />
				</BuildingInput>

				<button
					onClick={() => setSearchMode("ORIGIN")}
					className="flex flex-col items-center justify-around h-[50px] w-[75px] shadow-lg bg-primary-500 active:bg-primary-600 rounded-200"
				>
					<LocationIcon stroke="#FFFFFF" className="mb-[-10px]" />
					<p className="text-kor-caption text-gray-100 font-medium">길 찾기</p>
				</button>
			</div>
		</AnimatedContainer>
	);
}

export function MapTopRouteSheet({ isVisible }: MapTopSheetProps) {
	const { origin, setOrigin, destination, setDestination, switchBuilding } = useRoutePoint();
	const { setSearchMode } = useSearchBuilding();

	const resetRoutePoint = () => {
		setOrigin(undefined);
		setDestination(undefined);
		setSearchMode("BUILDING");
	};

	return (
		<AnimatedContainer
			isVisible={isVisible}
			className="absolute top-0 max-w-[450px] w-full left-1/2 translate-x-[-50%]  py-[18px] px-2  rounded-b-2xl overflow-auto z-20 bg-gray-100"
			positionDelta={300}
			transition={{
				type: "spring",
				damping: 20,
				duration: 0.3,
			}}
			isTop={true}
		>
			<div className="flex flex-row space-x-1">
				<div className="flex items-center">
					<button onClick={resetRoutePoint} className="cursor-pointer p-1 rounded-[8px] active:bg-gray-200">
						<ChevronLeft />
					</button>
				</div>
				<div className="flex-1 flex flex-col space-y-[10px]">
					<RouteInput
						onClick={() => {
							setSearchMode("ORIGIN");
						}}
						placeholder="출발지를 입력하세요"
						value={origin ? origin.buildingName : ""}
						onCancel={() => setOrigin(undefined)}
					>
						<OriginIcon />
					</RouteInput>
					<RouteInput
						onClick={() => {
							setSearchMode("DESTINATION");
						}}
						placeholder="도착지를 입력하세요"
						value={destination ? destination.buildingName : ""}
						onCancel={() => setDestination(undefined)}
					>
						<DestinationIcon />
					</RouteInput>
				</div>
				<div className="flex items-center">
					<button onClick={switchBuilding} className="cursor-pointer p-1 rounded-[8px] active:bg-gray-200">
						<SwitchIcon />
					</button>
				</div>
			</div>
		</AnimatedContainer>
	);
}
