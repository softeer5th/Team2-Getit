export default function createAdvancedMarker(
	AdvancedMarker: typeof google.maps.marker.AdvancedMarkerElement,
	map: google.maps.Map,
	position: google.maps.LatLng,
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
