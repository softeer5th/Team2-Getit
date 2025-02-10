import React from "react";
import BuildingListTitle from "../../components/buildings/buildingListTitle";
import BuildingList from "../../components/buildings/buildingList";
import { Building } from "../../data/types/node";
import { Coord } from "../../data/types/coord";

type BuildingListContainerProps = {
  selectedBuildingId: number | null;
  buildings: Building[];
  setCenterToCoordinate: (nodeId: number, coord: Coord) => void;
  refreshBuildings: () => void;
  refetching: boolean;
};

const BuildingListContainer = ({
  selectedBuildingId,
  buildings,
  setCenterToCoordinate,
  refreshBuildings,
  refetching,
}: BuildingListContainerProps) => {
  return (
    <div className="flex flex-col items-start w-1/5 border-x-2 border-gray-300 h-full">
      <BuildingListTitle
        refreshBuildings={refreshBuildings}
        refetching={refetching}
      />
      {buildings ? (
        <BuildingList
          selectedBuildingId={selectedBuildingId}
          buildings={buildings}
          setCenterToCoordinate={setCenterToCoordinate}
        />
      ) : (
        <div className="flex justify-center items-center w-full h-full">
          <p>데이터가 없습니다, undefined or null</p>
        </div>
      )}
    </div>
  );
};

export default BuildingListContainer;
