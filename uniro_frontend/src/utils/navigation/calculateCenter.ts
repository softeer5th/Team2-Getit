import { RouteEdge } from "../../data/types/edge";

export const calculateCenterCoordinate = (routes: RouteEdge[]) => {
	const latSum = routes.reduce((acc, route) => acc + route.startNode.lat + route.endNode.lat, 0);
	const lngSum = routes.reduce((acc, route) => acc + route.startNode.lng + route.endNode.lng, 0);
	const latCenter = latSum / (routes.length * 2);
	const lngCenter = lngSum / (routes.length * 2);
	return { lat: latCenter, lng: lngCenter };
};
