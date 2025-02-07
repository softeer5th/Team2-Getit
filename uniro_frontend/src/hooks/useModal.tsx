import React, { ReactNode, useCallback, useState } from "react";

export default function useModal(
	onClose?: () => void,
): [React.FC<{ children: ReactNode }>, boolean, () => void, () => void] {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const open = useCallback(() => {
		setIsOpen(true);
	}, []);

	const close = useCallback(() => {
		if (onClose) {
			onClose();
		}
		setIsOpen(false);
	}, []);

	const Modal = useCallback(
		({ children }: { children: React.ReactNode }) => {
			if (!isOpen) return null;

			return (
				<div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.2)]">
					<div className="w-full max-w-[365px] flex flex-col bg-gray-100 rounded-400 overflow-hidden">
						<div className="flex flex-col justify-center space-y-1 py-[25px]">{children}</div>
						<button
							onClick={close}
							className="h-[58px] border-t-[1px] border-gray-200 text-kor-body2 font-semibold active:bg-gray-200"
						>
							확인
						</button>
					</div>
				</div>
			);
		},
		[isOpen, close],
	);

	return [Modal, isOpen, open, close];
}
