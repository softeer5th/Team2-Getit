import { Outlet } from "react-router";
import "./App.css";
import NavBar from "./components/navBar";
import SubNavBar from "./components/subNavBar";

function App() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center space-y-1">
      <NavBar />
      <SubNavBar />
      <Outlet />
    </div>
  );
}

export default App;
