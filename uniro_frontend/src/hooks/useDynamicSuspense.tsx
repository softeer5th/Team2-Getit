import { useLocation } from "react-router";
import { useFallbackStore } from "./useFallbackStore";
import { useEffect } from "react";
import { fallbackConfig } from "../constant/fallback";

export const useDynamicSuspense = () => {
	const location = useLocation();
	const { fallback, setFallback } = useFallbackStore();

	useEffect(() => {
		const newFallback = fallbackConfig[location.pathname] || fallbackConfig["/"];
		setFallback(newFallback);
	}, [location.pathname, setFallback]);

	return { location, fallback };
};
