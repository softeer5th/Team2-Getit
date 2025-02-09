import { QueryClient, useMutation, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { NotFoundError, BadRequestError, ERROR_STATUS } from "../constant/error";
import React, { useCallback, useEffect, useState } from "react";

type Fallback = {
	[K in Exclude<ERROR_STATUS, ERROR_STATUS.INTERNAL_ERROR>]: {
		mainTitle: string;
		subTitle: string;
	};
};

export default function useMutationError<TData, TError, TVariables, TContext>(
	options: UseMutationOptions<TData, TError, TVariables, TContext>,
	queryClient?: QueryClient,
	fallback?: Fallback,
): [React.FC, UseMutationResult<TData, TError, TVariables, TContext>] {
	const [isOpen, setOpen] = useState<boolean>(false);
	const [title, setTitle] = useState({
		mainTitle: "",
		subTitle: "",
	});
	const result = useMutation<TData, TError, TVariables, TContext>(options, queryClient);

	const { isError, error } = result;

	useEffect(() => {
		if (isError) {
			setOpen(isError);
			if (error instanceof NotFoundError && fallback) {
				setTitle({ ...fallback[404] });
			} else if (error instanceof BadRequestError && fallback) {
				setTitle({ ...fallback[400] });
			} else {
				throw error;
			}
		}
	}, [error, isError]);

	const close = useCallback(() => {
		setOpen(false);
	}, []);

	const BaseFallback = (
		<div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.2)]">
			<div className="w-full max-w-[365px] flex flex-col bg-gray-100 rounded-400 overflow-hidden">
				<div className="flex flex-col justify-center space-y-1 py-[25px]">
					<p className="text-kor-body1 font-bold text-system-red">{title.mainTitle}</p>
					<div className="space-y-0">
						<p className="text-kor-body3 font-regular text-gray-700">{title.subTitle}</p>
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

	const Modal: React.FC = () => <>{isOpen && BaseFallback}</>;

	return [Modal, result];
}
