import { QueryClient, useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { NotFoundError, BadRequestError, ERROR_STATUS, UnProcessableError } from "../constant/error";
import { useEffect, useState } from "react";

type Fallback = {
	[K in Exclude<ERROR_STATUS, ERROR_STATUS.INTERNAL_ERROR>]?: {
		mainTitle: string;
		subTitle: string[];
	};
};

type HandleError = {
	fallback: Fallback;
	onClose?: () => void;
}

type UseQueryErrorReturn<TData, TError> = [
	React.FC,
	UseQueryResult<TData, TError>
];

export default function useQueryError<TQueryFnData, TError, TData>(
	options: UseQueryOptions<TQueryFnData, TError, TData>,
	queryClient?: QueryClient,
	handleSuccess?: () => void,
	handleError?: HandleError,
): UseQueryErrorReturn<TData, TError> {
	const [isOpen, setOpen] = useState<boolean>(false);
	const result = useQuery<TQueryFnData, TError, TData, readonly unknown[]>(options, queryClient);

	const { isError, error, status } = result;

	useEffect(() => {
		setOpen(isError)
	}, [isError])

	/** 페이지 이동하여도 status는 success로 남아있으므로 필요시, removeQueries하여 캐시 삭제 */
	/** 추가적인 로직 고민하기 */
	useEffect(() => {
		if (status === "success" && handleSuccess) handleSuccess();
	}, [status])

	const close = () => {
		if (handleError?.onClose) handleError?.onClose();
		setOpen(false);
	}

	const Modal: React.FC = () => {
		if (!isOpen || !handleError || !error) return null;

		const { fallback } = handleError;

		let title: { mainTitle: string, subTitle: string[] } = {
			mainTitle: "",
			subTitle: [],
		}

		if (error instanceof NotFoundError) {
			title = fallback[404] ?? title;
		}
		else if (error instanceof BadRequestError) {
			title = fallback[400] ?? title;
		}
		else if (error instanceof UnProcessableError) {
			title = fallback[422] ?? title;
		}

		else throw error;

		return (
			<div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.2)] z-100">
				< div className="w-full max-w-[365px] flex flex-col bg-gray-100 rounded-400 overflow-hidden" >
					<div className="flex flex-col justify-center space-y-1 py-[25px]">
						<p className="text-kor-body1 font-bold text-system-red">{title.mainTitle}</p>
						<div className="space-y-0">
							{title.subTitle.map((_subtitle, index) =>
								<p key={`error-modal-subtitle-${index}`} className="text-kor-body3 font-regular text-gray-700">{_subtitle}</p>)}
						</div>
					</div>
					<button
						onClick={close}
						className="h-[58px] border-t-[1px] border-gray-200 text-kor-body2 font-semibold active:bg-gray-200"
					>
						확인
					</button>
				</div >
			</div >
		)
	}

	return [Modal, result];
}
