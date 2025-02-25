import { DragControls } from "framer-motion";
import React from "react";

type HandleProps = {
	dragControls: DragControls;
	resetCurrentIdx: () => void;
};

const BottomSheetHandle = ({ dragControls, resetCurrentIdx }: HandleProps) => {
	return (
		<div
			onClick={resetCurrentIdx}
			className="w-full h-[40px] flex flex-col justify-center items-center cursor-grab"
			style={{ touchAction: "none" }}
			onPointerDown={(e) => {
				resetCurrentIdx();
				return dragControls.start(e);
			}}
		>
			<div className="w-1/6 h-[4px] bg-[#CACACA] rounded-full" />
		</div>
	);
};

export default BottomSheetHandle;
