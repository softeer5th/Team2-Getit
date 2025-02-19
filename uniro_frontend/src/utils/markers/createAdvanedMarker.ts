export default function createAdvancedMarker(
	AdvancedMarker: typeof google.maps.marker.AdvancedMarkerElement,
	map: google.maps.Map | null,
	position: google.maps.LatLng | google.maps.LatLngLiteral,
	content: HTMLElement,
	onClick?: () => void,
) {
	const newMarker = new AdvancedMarker({
		map: map,
		position: position,
		content: content,
	});

	if (onClick) newMarker.addListener("click", onClick);

	return newMarker;
}

export function createUniversityMarker(
	university: string,
):HTMLElement {
	const container = document.createElement("div");
	container.className = `flex flex-col items-center`;
	const markerTitle = document.createElement("p");
	markerTitle.innerText = university ? university : "";
	markerTitle.className =
		"py-1 px-3 text-kor-caption font-medium text-gray-100 bg-primary-500 text-center rounded-200";
	container.appendChild(markerTitle);
	const markerImage = document.createElement("img");

	const markerImages = import.meta.glob("/src/assets/markers/*.svg", { eager: true });

	markerImage.className = "border-0 translate-y-[-1px]";
	markerImage.src = (markerImages[`/src/assets/markers/university.svg`] as { default: string })?.default;
	container.appendChild(markerImage);

	return container;
}
