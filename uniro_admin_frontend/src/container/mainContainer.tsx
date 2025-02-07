import React from "react";

type Props = {
  children: React.ReactNode;
};

const MainContainer = ({ children }: Props) => {
  return <div className="flex flex-row w-full h-full min-h-0">{children}</div>;
};

export default MainContainer;
