import { Markers } from "../../constant/enum/markerEnum";
import { MarkerTypes } from "../../types/enum";
import { animate } from "framer-motion";

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
				"h-[22px] py-1 px-3 text-kor-caption font-medium text-gray-100 bg-gray-900 text-center rounded-200";
			return markerTitle;
		case Markers.SELECTED_BUILDING:
			markerTitle.className =
				"h-[22px] py-1 px-3 text-kor-caption font-medium text-gray-100 bg-gray-900 text-center rounded-200";
			return markerTitle;
		case Markers.ORIGIN:
			markerTitle.className =
				"h-[22px] py-1 px-3 text-kor-caption font-medium text-gray-100 bg-primary-500 text-center rounded-200";
			return markerTitle;
		case Markers.DESTINATION:
			markerTitle.className =
				"h-[22px] py-1 px-3 text-kor-caption font-medium text-gray-100 bg-primary-500 text-center rounded-200";
			return markerTitle;
		default:
			return markerTitle;
	}
}

export function createAnimatedTextElement(type: MarkerTypes, titles: string[]): HTMLElement {
	const titleContainer = document.createElement("div");

	const elements = [];

	const _title = [...titles, titles[0]];

	for (const title of _title) {
		const factorTitle = document.createElement("p");
		factorTitle.innerText = title;
		factorTitle.className = "block w-[128px] h-[22px] mb-4";

		titleContainer.appendChild(factorTitle);
		elements.push(factorTitle);
	}

	switch (type) {
		case Markers.CAUTION:
			titleContainer.className =
				"overflow-hidden w-[160px] h-[38px] py-2 px-4 mb-2 text-kor-body3 font-semibold text-gray-100 bg-system-orange text-center rounded-200";
			break;
		case Markers.DANGER:
			titleContainer.className =
				"overflow-hidden w-[160px] h-[38px] py-2 px-4 mb-2 text-kor-body3 font-semibold text-gray-100 bg-system-red text-center rounded-200";
			break;
		default:
			break;
	}

	const len = _title.length;

	if (len >= 3) {
		for (let i = 1; i < len; i++) {
			elements.forEach((el, index) => {
				setTimeout(() => {
					animate(
						el,
						{
							y: [-38 * (i - 1), -38 * i],
						},
						{
							duration: 0.5,
						},
					);

					if (i === len - 1) {
						setTimeout(() => {
							animate(
								el,
								{
									y: [-38 * (len - 1), 0],
								},
								{ duration: 0 },
							);
						}, 1000);
					}
				}, 1000 * i);
			});
		}
	}

	return titleContainer;
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
	container.className = `flex flex-col items-center space-y-[8px] ${className}`;

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

function createNumberMarkerElement({
	number,
	className,
	hasAnimation = false,
}: {
	number: number | string;
	className?: string;
	hasAnimation?: boolean;
}): HTMLElement {
	const container = createContainerElement(className);
	const numberText = document.createElement("p");
	numberText.innerText = `${number}`;
	numberText.className =
		"h-[17px] w-[17px] flex items-center justify-center text-white text-kor-body3 text-[10.25px] font-bold bg-[#161616] rounded-full";
	const markerWrapper = document.createElement("div");
	markerWrapper.className = "relative flex items-center justify-center";
	markerWrapper.style.transform = "translateY(8.5px)";
	markerWrapper.appendChild(numberText);

	container.appendChild(markerWrapper);

	return attachAnimation(container, hasAnimation);
}

export default function createMarkerElement({
	type,
	title,
	className,
	hasTopContent = false,
	hasAnimation = false,
	number = 0,
}: {
	type: MarkerTypes;
	className?: string;
	title?: string | string[];
	hasTopContent?: boolean;
	hasAnimation?: boolean;
	number?: number;
}): HTMLElement {
	if (number && type === Markers.NUMBERED_WAYPOINT) {
		return createNumberMarkerElement({ number, className, hasAnimation });
	}

	const container = createContainerElement(className);

	const markerImage = createImageElement(type);

	if (title) {
		if (hasTopContent) {
			const markerTitle = createAnimatedTextElement(type, title as string[]);
			container.appendChild(markerTitle);
			container.appendChild(markerImage);
			return attachAnimation(container, hasAnimation);
		}

		const markerTitle = createTextElement(type, title as string);
		container.appendChild(markerImage);
		container.appendChild(markerTitle);
		return attachAnimation(container, hasAnimation);
	}

	container.appendChild(markerImage);

	return attachAnimation(container, hasAnimation);
}
