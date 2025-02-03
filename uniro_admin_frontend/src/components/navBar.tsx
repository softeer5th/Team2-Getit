import React from "react";
import UNIROLOGO from "../assets/navbar/UNIRO_ADMIN.svg?react";

type Props = {};

const NavBar = (props: Props) => {
  return (
    <nav className="flex-1 w-full h-fit flex flex-row items-center justify-between border-b-2 border-gray-300 px-4">
      <UNIROLOGO />
      <button className="border-primary-500 border-b-[1px] py-2 px-4 hover:bg-primary-600 hover:text-white">
        한양대학교
      </button>
    </nav>
  );
};

export default NavBar;
