import React, { useEffect } from "react";
import { AnimatePresence, AnimationControls, motion, MotionProps } from "framer-motion";

type Props = {
	isVisible: boolean;
	children: React.ReactNode;
	positionDelta: number;
	className: string;
	isTop?: boolean;
	transition?: MotionProps["transition"];
	motionProps?: MotionProps;
	controls?: AnimationControls;
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
	controls,
}: Props) => {
	useEffect(() => {
		if (isVisible) {
			controls?.start({ y: 0, transition });
		}
	}, [isVisible, controls]);

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className={className}
					initial={{ y: isTop ? -positionDelta : positionDelta }}
					animate={controls ?? { y: 0 }}
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
