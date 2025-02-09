import { Link, useLocation } from "react-router";

const SubNavBar = () => {
  const location = useLocation(); // 📌 현재 경로 감지

  const getLinkStyle = (path: string) =>
    location.pathname === path
      ? "text-blue-700"
      : "text-gray-700 hover:text-black";

  return (
    <nav className="flex-1 w-full h-fit flex flex-row items-center justify-start border-b-2 border-gray-300 px-4">
      <Link to="/logs" className={`px-4 py-2 rounded ${getLinkStyle("/logs")}`}>
        로그 보기
      </Link>
      <Link
        to="/buildings"
        className={`px-4 py-2 rounded ${getLinkStyle("/buildings")}`}
      >
        건물 관리
      </Link>
      <Link
        to="/simulation"
        className={`px-4 py-2 rounded ${getLinkStyle("/simulation")}`}
      >
        지도 시뮬레이션
      </Link>
    </nav>
  );
};

export default SubNavBar;
