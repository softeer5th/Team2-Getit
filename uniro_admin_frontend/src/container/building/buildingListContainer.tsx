import React from "react";
import BuildingListTitle from "../../components/buildings/buildingListTitle";
import BuildingList from "../../components/buildings/buildingList";
import { Building } from "../../data/types/node";

type BuildingListContainerProps = {
  selectedBuildingId: number | null;
  buildings: Building[];
};

const BuildingListContainer = ({
  selectedBuildingId,
  buildings,
}: BuildingListContainerProps) => {
  return (
    <div className="flex flex-col items-start w-1/5 border-x-2 border-gray-300 h-full">
      <BuildingListTitle />
      {buildings ? (
        <BuildingList
          selectedBuildingId={selectedBuildingId}
          buildings={buildings}
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
