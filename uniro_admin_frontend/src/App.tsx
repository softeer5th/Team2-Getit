import { Outlet } from "react-router";
import "./App.css";
import NavBar from "./components/navBar";
import SubNavBar from "./components/subNavBar";
import useLogin from "./hooks/useLogin";
import LoginPage from "./page/loginPage";

function App() {
  const { isLogin } = useLogin();

  if (!isLogin) {
    return <LoginPage />;
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center space-y-1">
      <NavBar />
      <SubNavBar />
      <Outlet />
    </div>
  );
}

export default App;
