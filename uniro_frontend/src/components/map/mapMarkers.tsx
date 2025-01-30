export function buildingMarkerContent({ title }: { title: string }): HTMLElement {
	const container = document.createElement("div");
	container.className = "translate-marker flex flex-col items-center space-y-[7px]";

	const markerImage = document.createElement("img");
	markerImage.src = "/src/assets/map/buildingMarker.svg";
	markerImage.className = "text-system-red";

	const markerTitle = document.createElement("p");
	markerTitle.innerText = title;
	markerTitle.className = "py-1 px-3 text-kor-caption font-medium text-gray-100 bg-gray-900 text-center rounded-200";

	container.appendChild(markerImage);
	container.appendChild(markerTitle);

	return container;
}

export function selectedBuildingMarkerContent({ title }: { title: string }): HTMLElement {
	const container = document.createElement("div");
	container.className = "translate-marker flex flex-col items-center space-y-[7px]";

	const markerImage = document.createElement("img");
	markerImage.src = "/src/assets/map/selectedBuildingMarker.svg";

	const markerTitle = document.createElement("p");
	markerTitle.innerText = title;
	markerTitle.className =
		"py-1 px-3 text-kor-caption font-medium text-gray-100 bg-primary-500 text-center rounded-200";

	container.appendChild(markerImage);
	container.appendChild(markerTitle);

	return container;
}

export function cautionMarkerContent(factors?: string[]): HTMLElement {
	const container = document.createElement("div");
	container.className = "translate-marker flex flex-col items-center space-y-[7px]";

	if (factors) {
		const markerFactor = document.createElement("p");
		markerFactor.innerText = factors[0];
		markerFactor.className =
			"h-[38px] py-2 px-4 mb-2 text-kor-body3 font-semibold text-gray-100 bg-system-orange text-center rounded-200";
		container.classList.add("translate-y-[-46px]");
		container.appendChild(markerFactor);
	}

	const markerImage = document.createElement("img");
	markerImage.src = "/public/map/caution.svg";

	container.appendChild(markerImage);

	return container;
}

export function dangerMarkerContent(factors?: string[]): HTMLElement {
	const container = document.createElement("div");
	container.className = "translate-marker flex flex-col items-center space-y-[7px]";

	if (factors) {
		const markerFactor = document.createElement("p");
		markerFactor.innerText = factors[0];
		markerFactor.className =
			"h-[38px] py-2 px-4 mb-2 text-kor-body3 font-semibold text-gray-100 bg-system-red text-center rounded-200";
		container.classList.add("translate-y-[-46px]");
		container.appendChild(markerFactor);
	}

	const markerImage = document.createElement("img");
	markerImage.src = "/public/map/danger.svg";

	container.appendChild(markerImage);

	return container;
}

export function originMarkerContent({ title }: { title: string }): HTMLElement {
	const container = document.createElement("div");
	container.className = "translate-routemarker flex flex-col items-center space-y-[7px]";

	const markerImage = document.createElement("img");
	markerImage.src = "/src/assets/map/originMarker.svg";

	const markerTitle = document.createElement("p");
	markerTitle.innerText = title;
	markerTitle.className =
		"py-1 px-3 text-kor-caption font-medium text-gray-100 bg-primary-500 text-center rounded-200";

	container.appendChild(markerImage);
	container.appendChild(markerTitle);

	return container;
}

export function destinationMarkerContent({ title }: { title: string }): HTMLElement {
	const container = document.createElement("div");
	container.className = "translate-routemarker flex flex-col items-center space-y-[7px]";

	const markerImage = document.createElement("img");
	markerImage.src = "/src/assets/map/destinationMarker.svg";

	const markerTitle = document.createElement("p");
	markerTitle.innerText = title;
	markerTitle.className =
		"py-1 px-3 text-kor-caption font-medium text-gray-100 bg-primary-500 text-center rounded-200";

	container.appendChild(markerImage);
	container.appendChild(markerTitle);

	return container;
}
