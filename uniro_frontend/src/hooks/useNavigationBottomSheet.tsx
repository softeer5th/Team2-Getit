import { PanInfo, useDragControls } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_SHEET_HEIGHT = window.innerHeight * 0.7;
const MIN_SHEET_HEIGHT = window.innerHeight * 0.35;
const CLOSED_SHEET_HEIGHT = 0;
const ERROR_MARGIN_OF_SCROLL = 0.95;

export const useNavigationBottomSheet = () => {
	const [sheetHeight, setSheetHeight] = useState(CLOSED_SHEET_HEIGHT);
	const dragControls = useDragControls();

	const scrollRef = useRef<HTMLDivElement>(null);

	const handleDrag = useCallback((event: Event, info: PanInfo) => {
		setSheetHeight((prev) => {
			const newHeight = prev - info.delta.y;
			return Math.min(Math.max(newHeight, MIN_SHEET_HEIGHT), MAX_SHEET_HEIGHT);
		});
	}, []);

	const preventScroll = useCallback(
		(event: React.UIEvent<HTMLDivElement>) => {
			if (sheetHeight < MAX_SHEET_HEIGHT * ERROR_MARGIN_OF_SCROLL) {
				event.preventDefault();
				if (scrollRef.current) {
					scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
				}
			}
		},
		[sheetHeight],
	);
	useEffect(() => {
		if (scrollRef.current) {
			if (sheetHeight > MAX_SHEET_HEIGHT * ERROR_MARGIN_OF_SCROLL) {
				scrollRef.current.style.overflowY = "auto";
			} else {
				scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
				setTimeout(() => {
					if (scrollRef.current) {
						scrollRef.current.style.overflowY = "hidden";
					}
				}, 300);
			}
		}
	}, [sheetHeight]);

	return { sheetHeight, setSheetHeight, dragControls, handleDrag, preventScroll, scrollRef };
};
