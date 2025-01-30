import { SelectedMarkerTypes } from "../../pages/map";
import Button from "../customButton";
import Call from "/public/icons/call-thick.svg?react";
import Location from "/public/icons/location-thick.svg?react";

interface MapBottomSheetFromListProps {
	building: SelectedMarkerTypes;
	buttonText: string;
	onClick: () => void;
}

export function MapBottomSheetFromList({ building, buttonText, onClick }: MapBottomSheetFromListProps) {
	if (building.property === undefined) return;

	const { id, lng, lat, isCore, buildingName, buildingImageUrl, phoneNumber, address } = building.property;

	return (
		<div className="h-full px-5 pt-3 pb-6 flex flex-col items-between">
			<div className="mb-[14px]">
				<img src={buildingImageUrl} className="w-full h-[150px] mb-[14px] rounded-300 object-cover" />
				<div className="flex flex-col space-y-1">
					<p className="text-kor-heading2 font-semibold text-gray-900">{buildingName}</p>
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

interface MapBottomSheetProps {
	building: SelectedMarkerTypes;
	onClickLeft: () => void;
	onClickRight: () => void;
}

export function MapBottomSheetFromMarker({ building, onClickLeft, onClickRight }: MapBottomSheetProps) {
	if (building.property === undefined) return;

	const { id, lng, lat, isCore, buildingName, buildingImageUrl, phoneNumber, address } = building.property;

	return (
		<div className="h-full px-5 pt-3 pb-6 flex flex-col items-between">
			<div className="mb-[14px]">
				<img src={buildingImageUrl} className="w-full h-[150px] mb-[14px] rounded-300 object-cover" />
				<div className="flex flex-col space-y-1">
					<p className="text-kor-heading2 font-semibold text-gray-900">{buildingName}</p>
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
