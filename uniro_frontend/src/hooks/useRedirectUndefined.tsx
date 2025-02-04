import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function useRedirectUndefined<T>(deps: T[], url: string = "/landing") {
	const navigate = useNavigate();

	useEffect(() => {
		if (deps.some((dep) => dep === undefined)) {
			navigate(url);
		}
	}, [...deps]);
}
