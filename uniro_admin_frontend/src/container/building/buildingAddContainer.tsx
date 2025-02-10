import React, { useEffect, useState } from "react";
import { Building } from "../../data/types/node";

type Coord = {
  lat: number;
  lng: number;
};

type BuildingAddContainerProps = {
  selectedCoord?: Coord;
  setSelectedCoord?: React.Dispatch<React.SetStateAction<Coord | undefined>>;
  markerRef: React.MutableRefObject<google.maps.marker.AdvancedMarkerElement | null>;
  selectedBuilding: Building | null;
};

const BuildingAddContainer: React.FC<BuildingAddContainerProps> = ({
  selectedCoord,
  setSelectedCoord,
  markerRef,
  selectedBuilding,
}) => {
  const [buildingName, setBuildingName] = useState("");
  const [buildingPhoto, setBuildingPhoto] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

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
      buildingPhoto,
      phone,
      address,
      lat: selectedCoord?.lat || selectedBuilding?.lat,
      lng: selectedCoord?.lng || selectedBuilding?.lng,
    };
    console.log(payload);
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

  return (
    <div className="flex flex-col items-start w-1/5 border-x-2 border-gray-300 h-full">
      {selectedCoord || selectedBuilding ? (
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
          <div className="text-kor-heading2">지도에서 위치를 선택해주세요</div>
        </div>
      )}
    </div>
  );
};

export default BuildingAddContainer;
