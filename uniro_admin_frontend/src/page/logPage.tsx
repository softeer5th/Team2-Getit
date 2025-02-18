import MainContainer from "../container/mainContainer";
import LogListContainer from "../container/logListContainer";
import MapContainer from "../container/mapContainer";
import { useQuery } from "@tanstack/react-query";
import { getAllRevisions, getRevision } from "../api/admin";
import { useEffect, useState } from "react";
import useUniversity from "../hooks/useUniversity";
import useLogin from "../hooks/useLogin";

const LogPage = () => {
  const { accessToken } = useLogin();
  const { university } = useUniversity();
  const { data: revisions } = useQuery({
    queryKey: [university?.id, 'revisions'],
    queryFn: () => getAllRevisions(accessToken, university ? university.id : -1)
  })

  const [selectedRev, setSelectedRev] = useState<number>(-1);

  const { data: revisionData, isFetching } = useQuery({
    queryKey: [university?.id, 'revision', selectedRev],
    queryFn: () => getRevision(accessToken, university ? university.id : -1, selectedRev),
    enabled: selectedRev !== -1 ? true : false
  })

  useEffect(() => {
    if (revisions) setSelectedRev(revisions[0].rev);
  }, [revisions])

  if (isFetching) {
    return <div>loading...</div>
  }


  return (
    <MainContainer>
      {!revisions ?
        <div>데이터 요청 중</div> :
        <>
          <LogListContainer setSelect={setSelectedRev} selected={selectedRev} revisions={revisions} />
          <MapContainer rev={selectedRev} />
        </>
      }

    </MainContainer>
  );
};

export default LogPage;
