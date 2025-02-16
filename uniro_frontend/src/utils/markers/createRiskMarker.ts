import createMarkerElement, { createAnimatedTextElement } from "../../components/map/mapMarkers";
import { Markers } from "../../constant/enum/markerEnum";
import { DangerIssue } from "../../constant/enum/reportEnum";
import { DangerIssueType } from "../../data/types/enum";
import { AdvancedMarker } from "../../data/types/marker";
import { DangerRoute } from "../../data/types/route";
import centerCoordinate from "../coordinates/centerCoordinate";
import createAdvancedMarker from "./createAdvanedMarker";

export const createRiskMarkers = (
	riskData: DangerRoute[],
	map: google.maps.Map,
	AdvancedMarker: typeof google.maps.marker.AdvancedMarkerElement,
): AdvancedMarker[] => {
	const markers: AdvancedMarker[] = [];
	riskData.forEach((route) => {
		const markerElement = createMarkerElement({
			type: Markers.DANGER,
			className: "translate-pinmarker",
			hasAnimation: true,
		});

		const marker = createAdvancedMarker(
			AdvancedMarker,
			map,
			centerCoordinate(route.node1, route.node2),
			markerElement,
		);

		const markerEl = marker.content as HTMLElement;
		const innerEl = markerEl.querySelector("div");
		const factors = (route.dangerFactors as DangerIssueType[]).map((key) => DangerIssue[key]);

		if (innerEl) {
			initializeMarkerStyles(innerEl);
			const textElement = innerEl.querySelector("div");
			if (textElement) {
				innerEl.removeChild(textElement);
			}
		}

		marker.addListener("click", () => {
			toggleMarker(marker, factors);
		});

		["click", "zoom_changed", "drag", "bounds_changed"].forEach((e) => {
			map.addListener(e, () => collapseMarker(marker));
		});

		markers.push(marker);
	});
	return markers;
};
const initializeMarkerStyles = (el: HTMLElement) => {
	el.style.transformOrigin = "center bottom";
	el.style.transform = "scale(0.5)";
	el.style.transition = "transform 0.3s ease";
	el.style.willChange = "transform";
	el.style.zIndex = "0";
};

const toggleMarker = (marker: AdvancedMarker, factors: string[]) => {
	const innerEl = (marker.content as HTMLElement)?.querySelector("div");
	if (!innerEl) return;

	if (innerEl.style.transform === "scale(1)") {
		collapseMarker(marker);
	} else {
		expandMarker(marker, factors);
	}
};

const collapseMarker = (marker: AdvancedMarker) => {
	marker.zIndex = 0;
	const innerEl = (marker.content as HTMLElement)?.querySelector("div");
	if (!innerEl) return;

	innerEl.style.transform = "scale(0.5)";
	const existingText = innerEl.querySelector(".animated-text");
	if (existingText) {
		innerEl.removeChild(existingText);
	}
};

const expandMarker = (marker: AdvancedMarker, factors: string[]) => {
	marker.zIndex = 100;
	const innerEl = (marker.content as HTMLElement)?.querySelector("div");
	if (!innerEl) return;

	innerEl.style.transform = "scale(1)";
	innerEl.style.zIndex = "100";

	const oldEl = innerEl.querySelector(".animated-text");
	if (oldEl) {
		innerEl.removeChild(oldEl);
	}

	const animatedTextEl = createAnimatedTextElement(Markers.DANGER, factors);
	animatedTextEl.classList.add("animated-text");
	innerEl.prepend(animatedTextEl);
};
