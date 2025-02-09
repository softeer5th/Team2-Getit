import { useEffect } from "react";
import useMap from "../hooks/useMap";
import useSearchBuilding from "../hooks/useUniversityRecord";

type MapProps = {
  style?: React.CSSProperties;
};
const Map = ({ style }: MapProps) => {
  const { mapRef, map, mapLoaded } = useMap();

  const { getCurrentUniversityLngLat, currentUniversity } = useSearchBuilding();

  if (!style) {
    style = { height: "100%", width: "100%" };
  }

  useEffect(() => {
    if (!map || !mapLoaded) return;
    const universityLatLng = getCurrentUniversityLngLat();
    map.setCenter(universityLatLng);
  }, [currentUniversity, mapLoaded, getCurrentUniversityLngLat, map]);

  return (
    <div id="map" ref={mapRef} style={{ height: "100%", width: "100%" }}></div>
  );
};

export default Map;
