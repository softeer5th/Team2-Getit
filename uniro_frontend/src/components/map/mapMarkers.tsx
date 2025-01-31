import { MarkerTypes } from "../../data/types/marker";
import { Markers } from "../../constant/enums";

const markerImages = import.meta.glob("/src/assets/markers/*.svg", { eager: true });

function createTextElement(type: MarkerTypes, title: string): HTMLElement {
	const markerTitle = document.createElement("p");
	markerTitle.innerText = title;

	switch (type) {
		case Markers.CAUTION:
			markerTitle.className =
				"h-[38px] py-2 px-4 mb-2 text-kor-body3 font-semibold text-gray-100 bg-system-orange text-center rounded-200";
			return markerTitle;
		case Markers.DANGER:
			markerTitle.className =
				"h-[38px] py-2 px-4 mb-2 text-kor-body3 font-semibold text-gray-100 bg-system-red text-center rounded-200";
			return markerTitle;
		case Markers.BUILDING:
			markerTitle.className =
				"py-1 px-3 text-kor-caption font-medium text-gray-100 bg-gray-900 text-center rounded-200";
			return markerTitle;
		case Markers.SELECTED_BUILDING:
			markerTitle.className =
				"py-1 px-3 text-kor-caption font-medium text-gray-100 bg-primary-500 text-center rounded-200";
			return markerTitle;
		case Markers.ORIGIN:
			markerTitle.className =
				"py-1 px-3 text-kor-caption font-medium text-gray-100 bg-primary-500 text-center rounded-200";
			return markerTitle;
		case Markers.DESTINATION:
			markerTitle.className =
				"py-1 px-3 text-kor-caption font-medium text-gray-100 bg-primary-500 text-center rounded-200";
			return markerTitle;
		default:
			return markerTitle;
	}
}

function getImage(type: MarkerTypes): string {
	return (markerImages[`/src/assets/markers/${type}.svg`] as { default: string })?.default;
}

function createImageElement(type: MarkerTypes): HTMLElement {
	const markerImage = document.createElement("img");
	markerImage.src = getImage(type);
	return markerImage;
}

function createContainerElement(className?: string) {
	const container = document.createElement("div");
	container.className = `flex flex-col items-center space-y-[7px] ${className}`;

	return container;
}

export default function createMarkerElement({
	type,
	title,
	className,
	hasTopContent = false,
}: {
	type: MarkerTypes;
	className?: string;
	title?: string;
	hasTopContent?: boolean;
}): HTMLElement {
	const container = createContainerElement(className);

	const markerImage = createImageElement(type);

	if (title) {
		const markerTitle = createTextElement(type, title);
		if (hasTopContent) {
			container.appendChild(markerTitle);
			container.appendChild(markerImage);
			return container;
		}

		container.appendChild(markerImage);
		container.appendChild(markerTitle);
		return container;
	}

	container.appendChild(markerImage);
	return container;
}
