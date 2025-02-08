import { Fragment } from "react";
import { RouteCard } from "./routeCard";
import useRoutePoint from "../../../hooks/useRoutePoint";
import { RouteDetail } from "../../../data/types/route";
import { Direction } from "../../../data/types/route";
import { CautionIssue } from "../../../constant/enum/reportEnum";

type RouteListProps = {
	routes: RouteDetail[];
};

const Divider = () => <div className="border-[0.5px] border-gray-200 w-full"></div>;

const RouteList = ({ routes }: RouteListProps) => {
	const { origin, destination } = useRoutePoint();

	const addOriginAndDestination = (routes: RouteDetail[]) => {
		return [
			{
				dist: 0,
				directionType: "origin" as Direction,
				coordinates: { lat: origin!.lat, lng: origin!.lng },
				cautionFactors: [],
			},
			...routes.slice(0, -1),
			{
				dist: 0,
				directionType: "finish" as Direction,
				coordinates: { lat: destination!.lat, lng: destination!.lng },
				cautionFactors: [],
			},
		];
	};

	return (
		<div className="w-full">
			{addOriginAndDestination(routes).map((route, index) => (
				<Fragment key={`${route.dist}-${route.coordinates.lat}-fragment`}>
					<Divider />
					<div className="flex flex-col">
						<RouteCard index={index} route={route} />
					</div>
				</Fragment>
			))}
		</div>
	);
};

export default RouteList;
