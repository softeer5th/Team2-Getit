import { ReactNode, Suspense } from "react";
import { useFallbackStore } from "../hooks/useFallbackStore";

export const DynamicSuspense = ({ children }: { children: ReactNode }) => {
	const fallback = useFallbackStore((state) => state.fallback);

	return <Suspense fallback={fallback}>{children}</Suspense>;
};
