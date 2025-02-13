import { SelectedMarkerTypes } from "../../pages/map";
import Button from "../customButton";
import Call from "/public/icons/call-thick.svg?react";
import Location from "/public/icons/location-thick.svg?react";
import AnimatedContainer from "../../container/animatedContainer";
import BottomSheetHandle from "../navigation/bottomSheet/bottomSheetHandle";
import { useNavigationBottomSheet } from "../../hooks/useNavigationBottomSheet";
import { RoutePointType } from "../../data/types/route";
import { RoutePoint } from "../../constant/enum/routeEnum";
import useSearchBuilding from "../../hooks/useSearchBuilding";

interface MapBottomSheetProps {
	isVisible: boolean;
	selectedMarker: SelectedMarkerTypes | undefined;
	selectRoutePoint: (type?: RoutePointType) => void;
}

export default function MapBottomSheet({ isVisible, selectedMarker, selectRoutePoint }: MapBottomSheetProps) {
	const { dragControls, scrollRef, preventScroll } = useNavigationBottomSheet();
	const { mode } = useSearchBuilding();

	return (
		<AnimatedContainer
			isVisible={isVisible}
			className="absolute bottom-0 w-full left-0 bg-white rounded-t-2xl shadow-xl overflow-auto z-20"
			positionDelta={500}
			transition={{
				duration: 0.3,
				type: "spring",
				damping: 20,
			}}
		>
			<BottomSheetHandle dragControls={dragControls} />
			<div ref={scrollRef} className="w-full overflow-y-auto h-fit" onScroll={preventScroll}>
				{selectedMarker &&
					(selectedMarker.from === "Marker" ? (
						<MapBottomSheetFromMarker
							building={selectedMarker}
							onClickLeft={() => selectRoutePoint(RoutePoint.ORIGIN)}
							onClickRight={() => selectRoutePoint(RoutePoint.DESTINATION)}
						/>
					) : (
						<MapBottomSheetFromList
							building={selectedMarker}
							onClick={selectRoutePoint}
							buttonText={mode === RoutePoint.ORIGIN ? "출발지 설정" : "도착지 설정"}
						/>
					))}
			</div>
		</AnimatedContainer>
	);
}

interface MapBottomSheetFromListProps {
	building: SelectedMarkerTypes;
	buttonText: string;
	onClick: () => void;
}

function MapBottomSheetFromList({ building, buttonText, onClick }: MapBottomSheetFromListProps) {
	if (building.property === undefined) return;

	const { buildingName, buildingImageUrl, phoneNumber, address } = building.property;

	return (
		<div className="h-full px-5 pt-3 pb-6 flex flex-col items-between">
			<div className="mb-[14px]">
				<img src={buildingImageUrl} className="w-full h-[150px] mb-[14px] rounded-300 object-cover" />
				<div className="flex flex-col space-y-1">
					<p className="text-kor-heading2 font-semibold text-gray-900 text-left">{buildingName}</p>
					<p className="text-kor-body3 font-medium text-gray-700 flex flex-row">
						<Location stroke="#808080" className="mr-[10px]" />
						{address}
					</p>
					<p className="text-kor-body3 font-medium text-gray-700 flex flex-row">
						<Call stroke="#808080" className="mr-[10px]" />
						{phoneNumber}
					</p>
				</div>
			</div>
			<Button onClick={onClick} variant="secondary">
				{buttonText}
			</Button>
		</div>
	);
}

interface MapBottomSheetFromMarkerProps {
	building: SelectedMarkerTypes;
	onClickLeft: () => void;
	onClickRight: () => void;
}

function MapBottomSheetFromMarker({ building, onClickLeft, onClickRight }: MapBottomSheetFromMarkerProps) {
	if (building.property === undefined) return;

	const { buildingName, buildingImageUrl, phoneNumber, address } = building.property;

	return (
		<div className="h-full px-5 pt-3 pb-6 flex flex-col items-between">
			<div className="mb-[14px]">
				<img src={buildingImageUrl} className="w-full h-[150px] mb-[14px] rounded-300 object-cover" />
				<div className="flex flex-col space-y-1">
					<p className="text-kor-heading2 font-semibold text-gray-900 text-left">{buildingName}</p>
					<p className="text-kor-body3 font-medium text-gray-700 flex flex-row">
						<Location stroke="#808080" className="mr-[10px]" />
						{address}
					</p>
					<p className="text-kor-body3 font-medium text-gray-700 flex flex-row">
						<Call stroke="#808080" className="mr-[10px]" />
						{phoneNumber}
					</p>
				</div>
			</div>
			<div className="flex flex-row space-x-3">
				<Button onClick={onClickLeft} variant="secondary">
					출발지 설정
				</Button>
				<Button onClick={onClickRight} variant="secondary">
					도착지 설정
				</Button>
			</div>
		</div>
	);
}
