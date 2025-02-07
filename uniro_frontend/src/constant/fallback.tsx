import React from "react";
import Loading from "../components/loading/loading";

export const fallbackConfig: Record<string, React.ReactNode> = {
	"/": <Loading isLoading={true} loadingContent={"로딩중입니다."} />,
	"/map": <Loading isLoading={true} loadingContent={"지도를 로딩하는 중입니다."} />,
	"/result": <Loading isLoading={true} loadingContent={"경로를 불러오는 중입니다."} />,
	"/report/route": <Loading isLoading={true} loadingContent={"지도를 불러오는 중입니다."} />,
	"/report/hazard": <Loading isLoading={true} loadingContent={"위험요소를 불러오는 중입니다."} />,
	"/university": <Loading isLoading={true} loadingContent={"대학교 정보를 불러오는 중입니다."} />,
	"/form": <Loading isLoading={true} loadingContent={"선택한 정보을 불러오는 중입니다."} />,
};
