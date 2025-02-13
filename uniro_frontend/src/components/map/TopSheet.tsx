import RouteInput from "../map/routeSearchInput";
import SearchIcon from "../../assets/icon/search.svg?react";
import LocationIcon from "../../assets/location-thin.svg?react";
import { Link } from "react-router";
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
			className="absolute top-0 w-full left-0  py-[18px] px-5  rounded-b-2xl overflow-auto z-20"
			positionDelta={300}
			transition={{
				type: "spring",
				damping: 20,
				duration: 0.3,
			}}
			isTop={true}
		>
			<div className="flex flex-row space-x-1">
				<div className="flex-1 flex flex-row space-x-5">
					<RouteInput
						onClick={() => setMode(RoutePoint.ORIGIN)}
						placeholder={`한양대학교 건물을 검색해보세요`}
						value={origin ? origin.buildingName : ""}
						onCancel={() => setOrigin(undefined)}
					>
						<SearchIcon />
					</RouteInput>
					<button className="flex flex-col items-center justify-around h-[50px] w-[75px] shadow-lg bg-primary-500 active:bg-primary-600 text-gray-100 rounded-200  mb-[10px] text-kor-body2 font-medium ">
						<LocationIcon stroke="#FFFFFF" className="mb-[-10px]" />
						<Link to="/building" className="text-kor-caption">
							길 찾기
						</Link>
					</button>
				</div>
			</div>
		</AnimatedContainer>
	);
}
