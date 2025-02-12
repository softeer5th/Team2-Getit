import { QueryClient, useMutation, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { NotFoundError, BadRequestError, ERROR_STATUS } from "../constant/error";
import { useEffect, useRef, useState } from "react";
import { useDebounceMutation } from "./useDebounceMutation";

type Fallback = {
	[K in Exclude<ERROR_STATUS, ERROR_STATUS.INTERNAL_ERROR>]?: {
		mainTitle: string;
		subTitle: string[];
	};
};

type HandleError = {
	fallback: Fallback;
	onClose?: () => void;
};

type UseMutationErrorReturn<TData, TError, TVariables, TContext> = [
	React.FC,
	UseMutationResult<TData, TError, TVariables, TContext>,
];

export default function useMutationError<TData, TError, TVariables, TContext>(
	options: UseMutationOptions<TData, TError, TVariables, TContext>,
	queryClient?: QueryClient,
	handleError?: HandleError,
): UseMutationErrorReturn<TData, TError, TVariables, TContext> {
	const [isOpen, setOpen] = useState<boolean>(false);
	const result = useDebounceMutation<TData, TError, TVariables, TContext>(options, 1000, true, queryClient);

	const { isError, error } = result;

	useEffect(() => {
		setOpen(isError);
	}, [isError]);

	const close = () => {
		if (handleError?.onClose) handleError?.onClose();
		setOpen(false);
	};

	const Modal: React.FC = () => {
		if (!isOpen || !handleError || !error) return null;

		const { fallback } = handleError;

		let title: { mainTitle: string; subTitle: string[] } = {
			mainTitle: "",
			subTitle: [],
		};

		if (error instanceof NotFoundError) {
			title = fallback[404] ?? title;
		} else if (error instanceof BadRequestError) {
			title = fallback[400] ?? title;
		} else throw error;

		return (
			<div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.2)] z-100">
				<div className="w-full max-w-[365px] flex flex-col bg-gray-100 rounded-400 overflow-hidden">
					<div className="flex flex-col justify-center space-y-1 py-[25px]">
						<p className="text-kor-body1 font-bold text-system-red">{title.mainTitle}</p>
						<div className="space-y-0">
							{title.subTitle.map((_subtitle, index) => (
								<p
									key={`error-modal-subtitle-${index}`}
									className="text-kor-body3 font-regular text-gray-700"
								>
									{_subtitle}
								</p>
							))}
						</div>
					</div>
					<button
						onClick={close}
						className="h-[58px] border-t-[1px] border-gray-200 text-kor-body2 font-semibold active:bg-gray-200"
					>
						확인
					</button>
				</div>
			</div>
		);
	};

	return [Modal, result];
}
