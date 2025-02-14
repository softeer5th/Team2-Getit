import React, { useState, useRef, useEffect } from "react";
import UNIROLOGO from "../assets/navbar/UNIRO_ADMIN.svg?react";
import DropDownArrow from "../assets/navbar/dropDownArrow.svg?react";
import useSearchBuilding from "../hooks/useUniversityRecord";

const NavBar: React.FC = () => {
  const { currentUniversity, getUniversityNameList, setCurrentUniversity } =
    useSearchBuilding();
  const [selectedUniversity, setSelectedUniversity] =
    useState(currentUniversity);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex-1 w-full h-fit flex flex-row items-center justify-between border-b-2 border-gray-300 px-4">
      <UNIROLOGO />
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="border-primary-500 border-b-[1px] py-2 px-4 hover:bg-primary-600 hover:text-white flex items-center"
        >
          {selectedUniversity}
          <DropDownArrow />
        </button>
        {dropdownOpen && (
          <ul className="absolute right-0 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg z-10">
            {getUniversityNameList().map((uni) => (
              <li key={uni}>
                <button
                  onClick={() => {
                    setCurrentUniversity(uni);
                    setSelectedUniversity(uni);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left py-2 px-4 hover:bg-primary-600 hover:text-white"
                >
                  {uni}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
