import React, { useEffect, useState } from "react";

// 스크롤 비활성화, 맵을 움직일 때, 다른 부분들도 같이 움직이는 것들을 제어함.
// 전역 적용이 필요하다면 다른 방식을 사용할 예정.
const useScrollControl = () => {
	const [scrollState, setScrollState] = useState(false);

	const enableScroll = () => {
		setScrollState(true);
	};

	const disableScroll = () => {
		setScrollState(false);
	};

	useEffect(() => {
		if (scrollState) {
			document.body.style.overflow = "auto";
		} else {
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.body.style.overflow = "hidden";
		};
	}, [scrollState]);

	return { enableScroll, disableScroll };
};

export default useScrollControl;
