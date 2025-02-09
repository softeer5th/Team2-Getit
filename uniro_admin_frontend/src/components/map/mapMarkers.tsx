const markerImages = import.meta.glob("/src/assets/markers/*.svg", {
  eager: true,
});

function getImage(type: string): string {
  return (
    markerImages[`/src/assets/markers/${type}.svg`] as { default: string }
  )?.default;
}

function createImageElement(type: string): HTMLElement {
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
  className,
}: {
  type: string;
  className?: string;
}): HTMLElement {
  const container = createContainerElement(className);

  const markerImage = createImageElement(type);

  container.appendChild(markerImage);

  return container;
}
