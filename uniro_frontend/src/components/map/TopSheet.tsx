import RouteInput from "../map/routeSearchInput";
import OriginIcon from "../../assets/map/origin.svg?react";
import Destination from "../../assets/map/destination.svg?react";
import LocationIcon from "../../../public/icons/location-thick.svg?react";
import { Link } from "react-router";

export default function TopSheet() {
	return (
		<div className="absolute top-0 w-full bg-gray-100 py-[18px] px-5 z-10 rounded-b-[24px]">
			<p className="flex flex-row items-center mb-[10px] text-kor-body2 font-medium text-gray-800 underline underline-offset-4">
				<LocationIcon stroke="#4D4D4D" className="mr-1" />
				<Link to="/university">한양대학교</Link>
			</p>
			<div className="flex flex-col space-y-[10px]">
				<RouteInput placeholder="출발지를 입력하세요">
					<OriginIcon />
				</RouteInput>
				<RouteInput placeholder="도착지를 입력하세요">
					<Destination />
				</RouteInput>
			</div>
		</div>
	);
}
