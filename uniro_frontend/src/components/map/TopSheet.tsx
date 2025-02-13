import RouteInput from "../map/routeSearchInput";
import OriginIcon from "../../assets/map/origin.svg?react";
import Destination from "../../assets/map/destination.svg?react";
import LocationIcon from "../../../public/icons/location-thick.svg?react";
import SwitchIcon from "../../assets/switch.svg?react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import useRoutePoint from "../../hooks/useRoutePoint";
import useSearchBuilding from "../../hooks/useSearchBuilding";
import { RoutePoint } from "../../constant/enum/routeEnum";
import AnimatedContainer from "../../container/animatedContainer";

interface MapTopSheetProps {
	isVisible: boolean;
}

export default function MapTopSheet({ isVisible }: MapTopSheetProps) {
	const { origin, setOrigin, destination, setDestination, switchBuilding } = useRoutePoint();
	const { setMode } = useSearchBuilding();

	return (
		<AnimatedContainer
			isVisible={isVisible}
			className="absolute top-0 w-full left-0  py-[18px] px-5  bg-white rounded-b-2xl shadow-xl overflow-auto z-20"
			positionDelta={300}
			transition={{
				type: "spring",
				damping: 20,
				duration: 0.3,
			}}
			isTop={true}
		>
			<p className="flex flex-row items-center mb-[10px] text-kor-body2 font-medium text-gray-800 underline underline-offset-4">
				<LocationIcon stroke="#4D4D4D" className="mr-1" />
				<Link to="/university">한양대학교</Link>
			</p>
			<div className="flex flex-row space-x-1">
				<div className="flex-1 flex flex-col space-y-[10px]">
					<RouteInput
						onClick={() => setMode(RoutePoint.ORIGIN)}
						placeholder="출발지를 입력하세요"
						value={origin ? origin.buildingName : ""}
						onCancel={() => setOrigin(undefined)}
					>
						<OriginIcon />
					</RouteInput>
					<RouteInput
						onClick={() => setMode(RoutePoint.DESTINATION)}
						placeholder="도착지를 입력하세요"
						value={destination ? destination.buildingName : ""}
						onCancel={() => setDestination(undefined)}
					>
						<Destination />
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
