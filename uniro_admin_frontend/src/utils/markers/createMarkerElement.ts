import { Markers } from "../../constant/enum/markerEnum";
import { CautionIssue, DangerIssue } from "../../constant/enum/reportEnum";
import { MarkerTypes } from "../../data/types/enum";

const markerImages = import.meta.glob("/src/assets/markers/*.svg", { eager: true });

interface MarkerProps {
	className?: string;
	hasAnimation?: boolean;
}

interface RiskMarkerProps extends MarkerProps {
	factors?: CautionIssue[] | DangerIssue[];
}

export default function createMarkerElement() {
	const getImage = (type: MarkerTypes): string => {
		return (markerImages[`/src/assets/markers/${type}.svg`] as { default: string })?.default;
	};
	const createImageElement = (type: MarkerTypes): HTMLElement => {
		const markerImage = document.createElement("img");
		markerImage.src = getImage(type);
		return markerImage;
	};

	const createContainerElement = (className?: string): HTMLElement => {
		const container = document.createElement("div");
		container.className = `flex flex-col items-center space-y-[8px] ${className}`;

		return container;
	};

	const attachAnimation = (container: HTMLElement, hasAnimation: boolean): HTMLElement => {
		if (hasAnimation) {
			const outerContainer = document.createElement("div");
			outerContainer.className = "marker-appear";
			outerContainer.appendChild(container);
			return outerContainer;
		}

		return container;
	};

	const dangerMarkerElement = ({ className, factors, hasAnimation = false }: RiskMarkerProps): HTMLElement => {
		const containerElement = createContainerElement(`translate-shadowmarker ${className}`);

		const imageElement = createImageElement(Markers.DANGER);

		containerElement.appendChild(imageElement);

		return attachAnimation(containerElement, hasAnimation);
	};

	const cautionMarkerElement = ({ className, factors, hasAnimation = false }: RiskMarkerProps): HTMLElement => {
		const containerElement = createContainerElement(`translate-shadowmarker ${className}`);

		const imageElement = createImageElement(Markers.CAUTION);

		containerElement.appendChild(imageElement);

		return attachAnimation(containerElement, hasAnimation);
	};

	const changedMarkerElement = ({ className, factors, hasAnimation = false }: RiskMarkerProps): HTMLElement => {
		const containerElement = createContainerElement(`translate-shadowmarker ${className}`);

		const imageElement = createImageElement(Markers.CHANGED);

		containerElement.appendChild(imageElement);

		return attachAnimation(containerElement, hasAnimation);
	};

	const removedMarkerElement = ({ className, factors, hasAnimation = false }: RiskMarkerProps): HTMLElement => {
		const containerElement = createContainerElement(`translate-shadowmarker ${className}`);

		const imageElement = createImageElement(Markers.REMOVED);

		containerElement.appendChild(imageElement);

		return attachAnimation(containerElement, hasAnimation);
	};

	const createdMarkerElement = ({ className, factors, hasAnimation = false }: RiskMarkerProps): HTMLElement => {
		const containerElement = createContainerElement(`translate-shadowmarker ${className}`);

		const imageElement = createImageElement(Markers.CREATED);

		containerElement.appendChild(imageElement);

		return attachAnimation(containerElement, hasAnimation);
	};

	return {
		dangerMarkerElement,
		cautionMarkerElement,
		changedMarkerElement,
		removedMarkerElement,
		createdMarkerElement,
	};
}
