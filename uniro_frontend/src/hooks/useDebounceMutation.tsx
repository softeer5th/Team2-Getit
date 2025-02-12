import { QueryClient, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

export function useDebounceMutation<TData, TError, TVariables, TContext>(
	options: UseMutationOptions<TData, TError, TVariables, TContext>,
	delay: number,
	immediate: boolean,
	queryClient?: QueryClient,
) {
	const mutation = useMutation<TData, TError, TVariables, TContext>(options, queryClient);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const debouncedMutate = useCallback(
		(...args: Parameters<typeof mutation.mutate>) => {
			const later = () => {
				timeoutRef.current = null;
				if (!immediate) {
					mutation.mutate(...args);
				}
			};

			const callNow = immediate && !timeoutRef.current;

			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(later, delay);

			if (callNow) {
				mutation.mutate(...args);
			}
		},
		[mutation.mutate, delay, immediate],
	);

	return {
		...mutation,
		mutate: debouncedMutate,
	};
}
