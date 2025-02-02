import { MarkerTypes } from "../../data/types/marker";
import { Markers } from "../../constant/enum/markerEnum";
import { a } from "@react-spring/web";

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

function attachAnimation(container: HTMLElement, hasAnimation: boolean) {
	if (hasAnimation) {
		const outerContainer = document.createElement("div");
		outerContainer.className = "marker-appear";
		outerContainer.appendChild(container);
		return outerContainer;
	}

	return container;
}

export default function createMarkerElement({
	type,
	title,
	className,
	hasTopContent = false,
	hasAnimation = false,
}: {
	type: MarkerTypes;
	className?: string;
	title?: string;
	hasTopContent?: boolean;
	hasAnimation?: boolean;
}): HTMLElement {
	const container = createContainerElement(className);

	const markerImage = createImageElement(type);

	if (title) {
		const markerTitle = createTextElement(type, title);
		if (hasTopContent) {
			container.appendChild(markerTitle);
			container.appendChild(markerImage);
			return attachAnimation(container, hasAnimation);
		}

		container.appendChild(markerImage);
		container.appendChild(markerTitle);
		return attachAnimation(container, hasAnimation);
	}

	container.appendChild(markerImage);

	return attachAnimation(container, hasAnimation);
}
