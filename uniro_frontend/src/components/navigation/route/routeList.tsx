import { Fragment, useEffect } from "react";
import { RouteCard } from "./routeCard";
import useRoutePoint from "../../../hooks/useRoutePoint";
import { RouteDetail } from "../../../data/types/route";
import { Direction } from "../../../data/types/route";

type RouteListProps = {
	routes: RouteDetail[];
};

// export type RouteDetail = {
// 	dist: number;
// 	directionType: Direction;
// 	coordinates: Coord;
// };

const Divider = () => <div className="border-[0.5px] border-gray-200 w-full"></div>;

const RouteList = ({ routes }: RouteListProps) => {
	const { origin, destination } = useRoutePoint();

	return (
		<div className="w-full">
			{[
				{
					dist: 0,
					directionType: "origin" as Direction,
					coordinates: { lat: origin!.lat, lng: origin!.lng },
				},
				...routes,
			].map((route, index) => (
				<Fragment key={`${route.coordinates.lat}-fragment`}>
					<Divider />
					<div className="flex flex-col">
						<RouteCard
							index={index}
							route={route}
							originBuilding={origin!}
							destinationBuilding={destination!}
						/>
					</div>
				</Fragment>
			))}
		</div>
	);
};

export default RouteList;
