import React, { useState, useRef, useEffect } from "react";
import UNIROLOGO from "../assets/navbar/UNIRO_ADMIN.svg?react";
import useUniversity from "../hooks/useUniversity";

const NavBar: React.FC = () => {
  const { university } = useUniversity();

  return (
    <nav className="flex-1 w-full h-fit flex flex-row items-center justify-between border-b-2 border-gray-300 px-4">
      <UNIROLOGO />
      <div className="relative">
        {university?.name}
      </div>
    </nav>
  );
};

export default NavBar;
