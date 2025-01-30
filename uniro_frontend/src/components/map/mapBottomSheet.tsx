import { SelectedMarkerTypes } from "../../pages/map";
import Button from "../customButton";
import Call from "/public/icons/call-thick.svg?react";
import Location from "/public/icons/location-thick.svg?react";

interface MapBottomSheetProps {
	building: SelectedMarkerTypes;
	buttonText: string;
	onClick: () => void;
}

export default function MapBottomSheet({ building, buttonText, onClick }: MapBottomSheetProps) {
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
