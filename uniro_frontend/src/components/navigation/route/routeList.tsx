import { Fragment, useEffect, useRef } from "react";
import { RouteCard } from "./routeCard";
import useRoutePoint from "../../../hooks/useRoutePoint";
import { RouteDetail } from "../../../data/types/route";
import { Direction } from "../../../data/types/route";

type RouteListProps = {
	changeCurrentRouteIdx: (index: number) => void;
	currentRouteIdx: number;
	routes?: RouteDetail[] | null;
	cautionRouteIdx: number;
};

const Divider = () => <div className="border-[0.5px] border-gray-200 w-full"></div>;

const RouteList = ({ changeCurrentRouteIdx, currentRouteIdx, routes, cautionRouteIdx }: RouteListProps) => {
	const { origin, destination } = useRoutePoint();
	const currentItemRef = useRef<HTMLDivElement | null>(null);

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

	useEffect(() => {
		if (cautionRouteIdx === -1) return;
		const target = document.getElementById(`route-${cautionRouteIdx}`);
		if (target) {
			target.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}, [cautionRouteIdx]);

	return (
		<div className="w-full">
			{routes &&
				addOriginAndDestination(routes).map((route, index) => (
					<Fragment key={`${route.dist}-${route.coordinates.lat}-fragment`}>
						<Divider />
						<div
							id={`route-${index}`}
							className="flex flex-col"
							ref={currentRouteIdx === index ? currentItemRef : null}
						>
							<RouteCard
								changeCurrentRouteIdx={changeCurrentRouteIdx}
								currentRouteIdx={currentRouteIdx}
								index={index}
								route={route}
							/>
						</div>
					</Fragment>
				))}
		</div>
	);
};

export default RouteList;
