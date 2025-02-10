import { IssueTypeKey } from "../constant/enum/reportEnum";
import { Coord } from "../data/types/coord";
import { CautionIssueType, DangerIssueType } from "../data/types/enum";
import { NodeId } from "../data/types/node";

import {
  CoreRoutesList,
  NavigationRouteList,
  RouteId,
} from "../data/types/route";
import { getFetch, postFetch } from "../utils/fetch/fetch";
import { transformAllRoutes } from "./transformer/route";
import { GetAllRouteRepsonse } from "./type/response/route";

export const getNavigationResult = (
  univId: number,
  startNodeId: NodeId,
  endNodeId: NodeId
): Promise<NavigationRouteList> => {
  return getFetch<NavigationRouteList>(`/${univId}/routes/fastest`, {
    "start-node-id": startNodeId,
    "end-node-id": endNodeId,
  });
};

export const getAllRoutes = (univId: number): Promise<CoreRoutesList> => {
  return getFetch<GetAllRouteRepsonse>(`/${univId}/routes`).then((data) =>
    transformAllRoutes(data)
  );
};

export const getSingleRouteRisk = (
  univId: number,
  routeId: RouteId
): Promise<{
  routeId: NodeId;
  dangerTypes: IssueTypeKey[];
  cautionTypes: IssueTypeKey[];
}> => {
  return getFetch<{
    routeId: NodeId;
    dangerTypes: IssueTypeKey[];
    cautionTypes: IssueTypeKey[];
  }>(`/${univId}/routes/${routeId}/risk`);
};

export const postReport = (
  univId: number,
  routeId: RouteId,
  body: { dangerTypes: DangerIssueType[]; cautionTypes: CautionIssueType[] }
): Promise<boolean> => {
  return postFetch<void, string>(`/${univId}/route/risk/${routeId}`, body);
};

export const postReportRoute = (
  univId: number,
  body: {
    startNodeId: NodeId;
    endNodeId: NodeId | null;
    coordinates: Coord[];
  }
): Promise<boolean> => {
  return postFetch<void, Coord[] | NodeId | null>(`/${univId}/route`, body);
};

export const postBuildingRoute = (
  univId: number,
  body: {
    buildingNodeId: NodeId;
    nodeId: NodeId;
  }
): Promise<boolean> => {
  return postFetch(`/${univId}/routes/building`, body);
};
