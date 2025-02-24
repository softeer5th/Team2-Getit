import { SelectedMarkerTypes } from "../../pages/map";
import Button from "../customButton";
import Call from "/public/icons/call-thick.svg?react";
import Location from "/public/icons/location-thick.svg?react";
import AnimatedContainer from "../../container/animatedContainer";
import { useNavigationBottomSheet } from "../../hooks/useNavigationBottomSheet";
import { RoutePointType } from "../../types/route";
import { RoutePoint } from "../../constant/enum/routeEnum";
import useSearchBuilding from "../../hooks/useSearchBuilding";
import { useEffect, useState } from "react";

interface MapBottomSheetProps {
	isVisible: boolean;
	selectedMarker: SelectedMarkerTypes | undefined;
	selectRoutePoint: (type?: RoutePointType) => void;
}

export default function MapBottomSheet({ isVisible, selectedMarker, selectRoutePoint }: MapBottomSheetProps) {
	const { dragControls, scrollRef, preventScroll } = useNavigationBottomSheet();

	return (
		<AnimatedContainer
			isVisible={isVisible}
			className="absolute bottom-0 w-full left-0 bg-white rounded-t-2xl shadow-xl overflow-auto z-20 pt-3"
			positionDelta={500}
			transition={{
				duration: 0.3,
				type: "spring",
				damping: 20,
			}}
		>
			<div ref={scrollRef} className="w-full overflow-y-auto h-fit" onScroll={preventScroll}>
				<BottomSheetContent
					building={selectedMarker}
					onClickLeft={() => selectRoutePoint(RoutePoint.ORIGIN)}
					onClickRight={() => selectRoutePoint(RoutePoint.DESTINATION)}
				/>
			</div>
		</AnimatedContainer>
	);
}

interface BottomSheetContentProps {
	building: SelectedMarkerTypes | undefined;
	onClickLeft: () => void;
	onClickRight: () => void;
}

function BottomSheetContent({ building, onClickLeft, onClickRight }: BottomSheetContentProps) {
	if (!building || building.property === undefined) return;

	const [imageLoaded, setImageLoaded] = useState(false);
	const { buildingName, buildingImageUrl, phoneNumber, address } = building.property;

	const { setSearchMode } = useSearchBuilding();

	const handlLeftClick = () => {
		setSearchMode("ORIGIN");
		onClickLeft();
	};

	const handleRightClick = () => {
		setSearchMode("DESTINATION");
		onClickRight();
	};

	useEffect(() => {
		setImageLoaded(false);
	}, [buildingImageUrl]);

	return (
		<div className="h-full px-5 pt-3 pb-6 flex flex-col items-between">
			<div className="mb-[14px]">
				<div className="mb-[14px] relative">
					{!imageLoaded && (
						<div className="absolute inset-0 w-full h-[150px] bg-gray-300 rounded-300 animate-pulse" />
					)}
					<img
						src={buildingImageUrl}
						onLoad={() => setImageLoaded(true)}
						onError={() => setImageLoaded(true)}
						className="w-full h-[150px] mb-[14px] rounded-300 object-cover"
					/>
				</div>
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
				<Button onClick={handlLeftClick} variant="secondary">
					출발지 설정
				</Button>
				<Button onClick={handleRightClick} variant="secondary">
					도착지 설정
				</Button>
			</div>
		</div>
	);
}
