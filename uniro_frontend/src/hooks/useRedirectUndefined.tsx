import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function useRedirectUndefined<T>(deps: T[], url?: string) {
	const navigate = useNavigate();

	useEffect(() => {
		for (const dep of deps) {
			if (dep === undefined) {
				navigate(url ? url : "/landing");
			}
		}
	}, [deps]);
}
