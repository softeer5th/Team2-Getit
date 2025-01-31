import { DragControls } from "framer-motion";
import React from "react";

type HandleProps = {
	dragControls: DragControls;
};

const BottomSheetHandle = ({ dragControls }: HandleProps) => {
	return (
		<div
			className="w-full h-[40px] flex flex-col justify-center items-center cursor-grab"
			style={{ touchAction: "none" }}
			onPointerDown={(e) => dragControls.start(e)}
		>
			<div className="w-1/6 h-[4px] bg-[#CACACA] rounded-full" />
		</div>
	);
};

export default BottomSheetHandle;
