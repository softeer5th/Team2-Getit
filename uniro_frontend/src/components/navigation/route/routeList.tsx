import { Fragment } from "react";
import { RouteEdge } from "../../../data/types/edge";
import { Building } from "../../../data/types/node";
import { RouteCard } from "./routeCard";

type RouteListProps = {
	routes: RouteEdge[];
	originBuilding: Building;
	destinationBuilding: Building;
};

const Divider = () => <div className="border-[0.5px] border-gray-200 w-full"></div>;

const RouteList = ({ routes, originBuilding, destinationBuilding }: RouteListProps) => {
	return (
		<div className="w-full">
			{routes.map((route, index) => (
				<Fragment key={`${route.id}-fragment`}>
					<Divider key={`${route.id}-divider`} />
					<div key={route.id} className="flex flex-col">
						<RouteCard
							index={index}
							route={route}
							originBuilding={originBuilding}
							destinationBuilding={destinationBuilding}
						/>
					</div>
				</Fragment>
			))}
		</div>
	);
};

export default RouteList;
