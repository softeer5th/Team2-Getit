import { useContext, useEffect, useRef, useState } from "react";
import MapContext from "../map/mapContext";
import useUniversityInfo from "./useUniversityInfo";

const useMap = (mapOptions?: google.maps.MapOptions) => {
	const { Map } = useContext(MapContext);
	const { university } = useUniversityInfo();
	const mapRef = useRef<HTMLDivElement>(null);
	const [map, setMap] = useState<google.maps.Map>();

	useEffect(() => {
		if (Map === null || mapRef.current === null || !university) return;

		const _map = new Map(mapRef.current, {
			center: university.centerPoint,
			zoom: 16,
			minZoom: 13,
			maxZoom: 19,
			draggable: true,
			scrollwheel: true,
			disableDoubleClickZoom: false,
			gestureHandling: "greedy",
			clickableIcons: false,
			disableDefaultUI: true,
			mapId: import.meta.env.VITE_REACT_APP_GOOGLE_MAP_ID,
			...mapOptions,
		});

		setMap(_map);
	}, [Map, university]);

	return { mapRef, map };
};

export default useMap;
