import React, { useEffect, useState } from "react";
import { Building, Node, NodeId } from "../../data/types/node";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postBuilding } from "../../api/nodes";
import { postBuildingRoute } from "../../api/route";
import useUniversity from "../../hooks/useUniversity";

type Coord = {
  lat: number;
  lng: number;
};

type BuildingAddContainerProps = {
  selectedCoord?: Coord;
  setSelectedCoord?: React.Dispatch<React.SetStateAction<Coord | undefined>>;
  markerRef: React.MutableRefObject<google.maps.marker.AdvancedMarkerElement | null>;
  selectedBuilding: Building | null;
  drawSingleRoute: (start: Node, end: Node) => void;
  mode: "add" | "connect" | "view";
  selectedNode: Node[];
  resetConnectMode: () => void;
};

const BuildingAddContainer: React.FC<BuildingAddContainerProps> = ({
  selectedCoord,
  setSelectedCoord,
  markerRef,
  selectedBuilding,
  mode,
  selectedNode,
  drawSingleRoute,
  resetConnectMode,
}) => {
  const { university } = useUniversity();
  const queryClient = useQueryClient();
  const [buildingName, setBuildingName] = useState("");
  const [buildingPhoto, setBuildingPhoto] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [isSelectedNode1, setIsSelectedNode1] = useState(true);

  const addBuilding = useMutation({
    mutationFn: (body: {
      buildingName: string;
      buildingImageUrl: string;
      phoneNumber: string;
      address: string;
      lat: number;
      lng: number;
      level: number;
    }) => postBuilding(university?.id ?? -1, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [university?.id, "buildings"] });
    },
    onError: (error) => {
      alert("건물 추가에 실패했습니다.");
    },
  });

  const addBuildingRoute = useMutation({
    mutationFn: (body: { buildingNodeId: NodeId; nodeId: NodeId }) =>
      postBuildingRoute(university?.id ?? -1, body),
    onSuccess: () => {
      alert("경로가 추가되었습니다.");
      queryClient.invalidateQueries({ queryKey: [university?.id, "routes"] });
    },
    onError: (error) => {
      alert("경로 추가에 실패했습니다.");
    },
  });

  useEffect(() => {
    if (selectedBuilding) {
      setBuildingName(selectedBuilding?.buildingName);
      setPhone(selectedBuilding?.phoneNumber || "");
      setBuildingPhoto(selectedBuilding?.buildingImageUrl || "");
      setAddress(selectedBuilding.address || "");
    } else {
      setBuildingName("");
      setPhone("");
      setBuildingPhoto("");
      setAddress("");
    }
  }, [selectedBuilding]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedCoord && !selectedBuilding) {
      alert("먼저 지도에서 위치를 선택하거나, 기존 건물을 선택해주세요.");
      return;
    }

    if (!buildingName || !buildingPhoto || !phone || !address) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    const payload = {
      buildingName,
      buildingImageUrl: buildingPhoto,
      phoneNumber: phone,
      address,
      lat: selectedCoord?.lat ?? selectedBuilding?.lat ?? 0,
      lng: selectedCoord?.lng ?? selectedBuilding?.lng ?? 0,
      level: 10,
    };
    if (mode === "add") {
      if (payload.lat && payload.lng) {
        addBuilding.mutate(payload);
      }
    }

    alert(
      selectedBuilding ? "건물이 수정되었습니다." : "건물이 추가되었습니다."
    );
    // 폼 초기화
    if (setSelectedCoord) setSelectedCoord(undefined);
    if (markerRef.current) markerRef.current.map = null;
    setBuildingName("");
    setBuildingPhoto("");
    setPhone("");
    setAddress("");
  };

  const handleConnectSubmit = () => {
    if (selectedNode.length === 2 && selectedBuilding) {
      if (isSelectedNode1) {
        addBuildingRoute.mutate({
          buildingNodeId: selectedBuilding.nodeId,
          nodeId: selectedNode[0].nodeId,
        });

        resetConnectMode();
        return;
      }
      addBuildingRoute.mutate({
        buildingNodeId: selectedBuilding.nodeId,
        nodeId: selectedNode[1].nodeId,
      });
      resetConnectMode();
      return;
    }
    alert("노드를 2개 선택해주세요.");
    return;
  };

  return (
    <div className="flex flex-col items-start w-1/5 border-x-2 border-gray-300 h-full">
      {mode === "add" || mode === "view" ? (
        selectedCoord || selectedBuilding ? (
          <>
            {selectedCoord && (
              <div className="text-kor-body1 flex flex-col gap-2 items-start bg-gray-100 p-2 w-full ">
                <p className="font-semibold text-gray-700">선택한 위치:</p>
                <p className="text-blue-500">lat: {selectedCoord.lat}</p>
                <p className="text-green-500">lng: {selectedCoord.lng}</p>
              </div>
            )}

            <form
              className="flex-1 flex flex-col items-start w-full h-full p-4"
              onSubmit={handleSubmit}
            >
              <h2 className="text-kor-heading1 pb-2 border-b-2 w-full mb-2 border-gray-300 text-left font-semibold">
                {selectedBuilding ? "건물 수정하기" : "건물 추가하기"}
              </h2>

              <div className="text-kor-body1 mb-1">건물명</div>
              <input
                type="text"
                className="w-full h-10 border-2 border-gray-300 rounded-md p-2 mb-4"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                required
              />

              <div className="text-kor-body1 mb-1">건물 사진</div>
              <input
                type="text"
                className="w-full h-10 border-2 border-gray-300 rounded-md p-2 mb-4"
                value={buildingPhoto}
                onChange={(e) => setBuildingPhoto(e.target.value)}
                required
              />

              <div className="text-kor-body1 mb-1">전화번호</div>
              <input
                type="tel"
                className="w-full h-10 border-2 border-gray-300 rounded-md p-2 mb-4"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <div className="text-kor-body1 mb-1">주소</div>
              <input
                type="text"
                className="w-full h-10 border-2 border-gray-300 rounded-md p-2 mb-4"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <div className="flex justify-end w-full">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-sm font-semibold transition-colors 
                bg-blue-500 text-white hover:bg-blue-600"
                >
                  {selectedBuilding ? "수정하기" : "추가하기"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center w-full h-full">
            <div className="text-kor-heading2">
              지도에서 위치를 선택해주세요
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col justify-start w-full h-full text-left p-4 bg-white rounded-lg shadow-md border border-gray-300">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            선택된 정보
          </h3>
          <button
            onClick={() => resetConnectMode()}
            className="px-4 py-2 rounded-md text-sm font-semibold transition-colors 
                bg-blue-500 text-white hover:bg-blue-600 mb-2"
          >
            초기화
          </button>

          {selectedBuilding ? (
            <div className="p-3 bg-gray-100 rounded-md shadow-sm mb-2">
              <p className="text-sm text-gray-900">
                🏢 <span className="font-medium">건물명:</span>{" "}
                {selectedBuilding.buildingName}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">🏢 선택된 건물이 없습니다.</p>
          )}

          {selectedNode.length > 0 ? (
            <>
              <div
                className={`flex flex-col p-3 bg-gray-100 rounded-md shadow-sm ${isSelectedNode1 && "border-2 border-blue-500"} mb-2`}
              >
                <p className="text-sm text-gray-600 font-medium">
                  📍 선택한 노드 정보 1
                </p>
                <p className="text-sm text-blue-500">
                  NODE ID: {selectedNode[0].nodeId}
                </p>
                <p className="text-sm text-blue-500">
                  위도: {selectedNode[0].lat}
                </p>
                <p className="text-sm text-green-500">
                  경도: {selectedNode[0].lng}
                </p>
                <div className="flex justify-end w-full">
                  <button
                    onClick={() => {
                      drawSingleRoute(
                        {
                          nodeId: selectedNode[0].nodeId,
                          lat: selectedBuilding?.lat ?? 0,
                          lng: selectedBuilding?.lng ?? 0,
                        },
                        selectedNode[0]
                      );
                      setIsSelectedNode1(true);
                    }}
                    className="px-4 py-2 rounded-md text-sm font-semibold transition-colors 
                bg-blue-500 text-white hover:bg-blue-600"
                  >
                    연결해보기
                  </button>
                </div>
              </div>
              <div
                className={`flex flex-col p-3 bg-gray-100 rounded-md shadow-sm ${!isSelectedNode1 && "border-2 border-blue-500"} mb-2`}
              >
                <p className="text-sm text-gray-600 font-medium">
                  📍 선택한 노드 정보 2
                </p>
                <p className="text-sm text-blue-500">
                  NODE ID: {selectedNode[1].nodeId}
                </p>
                <p className="text-sm text-blue-500">
                  위도: {selectedNode[1].lat}
                </p>
                <p className="text-sm text-green-500">
                  경도: {selectedNode[1].lng}
                </p>
                <div className="flex justify-end w-full">
                  <button
                    onClick={() => {
                      drawSingleRoute(
                        {
                          nodeId: selectedNode[0].nodeId,
                          lat: selectedBuilding?.lat ?? 0,
                          lng: selectedBuilding?.lng ?? 0,
                        },
                        selectedNode[1]
                      );
                      setIsSelectedNode1(false);
                    }}
                    className="px-4 py-2 rounded-md text-sm font-semibold transition-colors 
                bg-blue-500 text-white hover:bg-blue-600"
                  >
                    연결해보기
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleConnectSubmit()}
                className="px-4 py-2 rounded-md text-sm font-semibold transition-colors 
                bg-red-500 text-white hover:bg-red-600"
              >
                연결하기
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              📍 선택된 길 좌표가 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BuildingAddContainer;
