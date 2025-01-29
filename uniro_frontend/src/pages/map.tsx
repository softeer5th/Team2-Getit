import { useEffect, useState } from "react";
import useMap from "../hooks/useMap";
import { buildings } from "../data/mock/hanyangBuildings";
import { buildingMarkerContent, cautionMarkerContent, dangerMarkerContent } from "../components/map/mapMarkers";
import { mockHazardEdges } from "../data/mock/hanyangHazardEdge";

type MarkerTypes = "building" | "caution" | "danger";

export default function MapPage() {
    const { mapRef, map, AdvancedMarker } = useMap();
    const [selectedMarker, setSelectedMarker] = useState<{
        type: MarkerTypes;
        element: google.maps.marker.AdvancedMarkerElement;
    }>();

    const addBuildings = () => {
        if (AdvancedMarker === null) return;
        for (const building of buildings) {
            const { id, lat, lng, buildingName } = building;

            const newMarker = new AdvancedMarker({
                map: map,
                position: { lat, lng },
                content: buildingMarkerContent({ title: buildingName }),
            });

            newMarker.addListener("click", () => {
                alert(`${id} - ${buildingName}`);
            });
        }
    };

    const addHazardMarker = () => {
        if (AdvancedMarker === null) return;
        for (const edge of mockHazardEdges) {
            const { id, startNode, endNode, dangerFactors, cautionFactors } = edge;
            if (dangerFactors) {
                const dangerMarker = new AdvancedMarker({
                    map: map,
                    position: {
                        lat: (startNode.lat + endNode.lat) / 2,
                        lng: (startNode.lng + endNode.lng) / 2,
                    },
                    content: dangerMarkerContent(),
                });
                dangerMarker.addListener("click", () => {
                    dangerMarker.content = dangerMarkerContent(dangerFactors);
                    setSelectedMarker({ type: "danger", element: dangerMarker });
                });
            } else if (cautionFactors) {
                const cautionMarker = new AdvancedMarker({
                    map: map,
                    position: {
                        lat: (startNode.lat + endNode.lat) / 2,
                        lng: (startNode.lng + endNode.lng) / 2,
                    },
                    content: cautionMarkerContent(),
                });
                cautionMarker.addListener("click", () => {
                    cautionMarker.content = cautionMarkerContent(cautionFactors);
                    setSelectedMarker({ type: "caution", element: cautionMarker });
                });
            }
        }
    };

    useEffect(() => {
        if (map !== null) {
            map.addListener("click", (e: unknown) => {
                console.log(e);
                setSelectedMarker((marker) => {
                    if (marker) {
                        const { type, element } = marker;
                        if (type === "caution") element.content = cautionMarkerContent();
                        else if (type === "danger") element.content = dangerMarkerContent();
                    }
                    return undefined;
                });
            });
            addBuildings();
            addHazardMarker();
        }
    }, [map]);

    return (
        <div className="relative flex flex-col h-screen w-full max-w-[450px] mx-auto justify-center">
            <div ref={mapRef} className="w-full h-full" />
        </div>
    );
}
