import { Dispatch, SetStateAction, useEffect } from "react";
import useMap from "../hooks/useMap";
import useUniversity from "../hooks/useUniversity";
type MapProps = {
  style?: React.CSSProperties;
  setMap: Dispatch<SetStateAction<google.maps.Map | null>>;
};
const Map = ({ style, setMap }: MapProps) => {
  const { mapRef, map, mapLoaded } = useMap();
  const { university } = useUniversity();

  if (!style) {
    style = { height: "100%", width: "100%" };
  }

  useEffect(() => {
    if (!map || !mapLoaded || !university) return;
    map.setCenter(university.centerPoint);
    setMap(map);
  }, [university, mapLoaded, map]);

  return (
    <div id="map" ref={mapRef} style={{ height: "100%", width: "100%" }}></div>
  );
};

export default Map;
