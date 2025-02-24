import { PanInfo, useDragControls } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_SHEET_HEIGHT = window.innerHeight * 0.7;
const MIN_SHEET_HEIGHT = window.innerHeight * 0.35;
const CLOSED_SHEET_HEIGHT = window.innerHeight * 0.2;
const ERROR_MARGIN_OF_DRAG = 0.7;

export const useNavigationBottomSheet = () => {
	const [sheetHeight, setSheetHeight] = useState(CLOSED_SHEET_HEIGHT);
	const dragControls = useDragControls();

	const scrollRef = useRef<HTMLDivElement>(null);

	const handleDrag = useCallback((event: Event, info: PanInfo) => {
		requestAnimationFrame(() => {
			setSheetHeight((prev) => {
				const newHeight = prev - info.delta.y;
				return Math.min(Math.max(newHeight, MIN_SHEET_HEIGHT), MAX_SHEET_HEIGHT);
			});
		});
	}, []);

	const handleDragEnd = useCallback(
		(event: Event, info: PanInfo) => {
			const velocityY = info.velocity.y;
			let finalHeight = sheetHeight;

			if (velocityY > 500) {
				finalHeight = MIN_SHEET_HEIGHT;
			} else if (velocityY < -500) {
				finalHeight = MAX_SHEET_HEIGHT;
			} else {
				// 가까운 위치로 스냅
				const distances = [
					{ height: CLOSED_SHEET_HEIGHT, distance: Math.abs(sheetHeight - CLOSED_SHEET_HEIGHT) },
					{ height: MIN_SHEET_HEIGHT, distance: Math.abs(sheetHeight - MIN_SHEET_HEIGHT) },
					{ height: MAX_SHEET_HEIGHT, distance: Math.abs(sheetHeight - MAX_SHEET_HEIGHT) },
				];
				finalHeight = distances.sort((a, b) => a.distance - b.distance)[0].height;
			}

			setSheetHeight(finalHeight);
		},
		[sheetHeight],
	);

	const preventScroll = useCallback(
		(event: React.UIEvent<HTMLDivElement>) => {
			if (sheetHeight < MAX_SHEET_HEIGHT * ERROR_MARGIN_OF_DRAG) {
				event.preventDefault();
				if (scrollRef.current) {
					scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
				}
			}
		},
		[sheetHeight],
	);
	useEffect(() => {
		if (!scrollRef.current) return;

		const isBelowErrorMargin = sheetHeight > MAX_SHEET_HEIGHT * ERROR_MARGIN_OF_DRAG;
		scrollRef.current.style.overflowY = isBelowErrorMargin ? "auto" : "hidden";

		if (!isBelowErrorMargin) {
			scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [sheetHeight]);

	return { sheetHeight, setSheetHeight, dragControls, handleDrag, preventScroll, scrollRef, handleDragEnd };
};
