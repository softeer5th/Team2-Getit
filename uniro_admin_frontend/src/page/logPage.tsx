import React from "react";
import MainContainer from "../container/mainContainer";
import LogListContainer from "../container/logListContainer";
import MapContainer from "../container/mapContainer";

const LogPage = () => {
  return (
    <MainContainer>
      <LogListContainer />
      <MapContainer />
    </MainContainer>
  );
};

export default LogPage;
