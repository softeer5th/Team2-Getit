// container/animatedSheetContainer.tsx

import React from "react";
import { AnimatePresence, motion, MotionProps } from "framer-motion";

type AnimatedSheetContainerProps = {
	isVisible: boolean;
	height: number;
	children: React.ReactNode;
	className?: string;
	transition?: MotionProps["transition"];
	motionProps?: MotionProps;
};

const AnimatedSheetContainer = ({
	isVisible,
	height,
	children,
	className = "",
	transition = { duration: 0.3, type: "tween" },
	motionProps = {},
}: AnimatedSheetContainerProps) => {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className={className}
					style={{
						position: "absolute",
						left: 0,
						bottom: 0,
						width: "100%",
					}}
					initial={{ height: 0 }}
					animate={{ height }}
					exit={{ height: 0 }}
					transition={transition}
					{...motionProps}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default AnimatedSheetContainer;
