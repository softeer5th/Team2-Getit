import React from "react";
import { AnimatePresence, motion, MotionProps } from "framer-motion";

type Props = {
	isVisible: boolean;
	children: React.ReactNode;
	positionDelta: number;
	className: string;
	isTop?: boolean;
	transition?: MotionProps["transition"];
	motionProps?: MotionProps;
};

// default는 바텀에서 시작
const AnimatedContainer = ({
	isVisible,
	children,
	positionDelta,
	className,
	isTop = false,
	transition = { duration: 0.3, type: "tween" },
	motionProps = {},
}: Props) => {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className={className}
					initial={{ y: isTop ? -positionDelta : positionDelta }}
					animate={{ y: 0 }}
					exit={{ y: isTop ? -positionDelta : positionDelta }}
					transition={transition}
					{...motionProps}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default AnimatedContainer;
