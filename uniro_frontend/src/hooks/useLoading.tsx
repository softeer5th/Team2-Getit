import React, { memo, useCallback, useState } from "react";

const useLoading = (): [boolean, () => void, () => void] => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const show = useCallback(() => {
		setIsLoading(true);
	}, []);

	const hide = useCallback(() => {
		setIsLoading(false);
	}, []);

	return [isLoading, show, hide];
};

export default useLoading;
