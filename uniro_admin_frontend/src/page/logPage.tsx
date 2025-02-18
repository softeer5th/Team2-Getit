import MainContainer from "../container/mainContainer";
import LogListContainer from "../container/logListContainer";
import MapContainer from "../container/mapContainer";
import { useQuery } from "@tanstack/react-query";
import { getAllRevisions, getRevision } from "../api/admin";
import { useEffect, useState } from "react";
import useUniversity from "../hooks/useUniversity";
import useLogin from "../hooks/useLogin";
import { RevisionType } from "../data/types/revision";
import { LogActionEnum } from "../constant/enum/logActionEnum";

const LogPage = () => {
	const { accessToken } = useLogin();
	const { university } = useUniversity();
	const { data: revisions } = useQuery({
		queryKey: [university?.id, "revisions"],
		queryFn: () => getAllRevisions(accessToken, university ? university.id : -1),
	});

	const [selectedRev, setSelectedRev] = useState<RevisionType>({ rev: -1, revTime: '', univId: -1, action: LogActionEnum.CREATE_BUILDING });

	const { data: revisionData, isFetching } = useQuery({
		queryKey: [university?.id, "revision", selectedRev],
		queryFn: () => getRevision(accessToken, university ? university.id : -1, selectedRev.rev),
		enabled: selectedRev.rev !== -1 ? true : false,
	});

	useEffect(() => {
		if (revisions) setSelectedRev(revisions[0]);
	}, [revisions]);

	return (
		<MainContainer>
			<LogListContainer setSelect={setSelectedRev} selected={selectedRev} revisions={revisions} isFetching={isFetching} />
			<MapContainer data={revisionData} rev={selectedRev} />
		</MainContainer>
	);
};

export default LogPage;
