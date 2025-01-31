import { Building } from "../../data/types/node";
import { Link } from "react-router";
import CallIcon from "../../assets/call-thin.svg?react";
import LocationIcon from "../../assets/location-thin.svg?react";

interface BuildingListProps {
	building: Building;
	onClick: () => void;
}

export default function BuildingCard({ building, onClick }: BuildingListProps) {
	const { buildingName, buildingImageUrl, address, phoneNumber } = building;
	return (
		<li>
			<Link
				className="w-full h-full px-4 py-2 rounded-200 flex flex-row items-center space-x-4 active:bg-gray-200"
				onClick={onClick}
				to="/map"
			>
				<div className="flex-1">
					<p className="text-start text-kor-body1 font-medium text-gray-900">{buildingName}</p>
					<p className="flex fle-row  items-center text-start text-kor-body3 font-regular text-gray-700">
						<LocationIcon className="mr-[2px]" />
						{address}
					</p>
					<p className="flex fle-row  items-center text-start text-kor-body3 font-regular text-gray-700">
						<CallIcon className="mr-[2px]" />
						{phoneNumber}
					</p>
				</div>
				<div>
					<img src={building.buildingImageUrl} className="w-[66px] h-[66px] object-cover rounded-100" />
				</div>
			</Link>
		</li>
	);
}
