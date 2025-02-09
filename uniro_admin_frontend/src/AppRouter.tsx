import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App";
import LogPage from "./page/logPage";
import BuildingPage from "./page/buildingPage";
import SimulationPage from "./page/simulationPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<LogPage />} />
          <Route path="logs" element={<LogPage />} />
          <Route path="buildings" element={<BuildingPage />} />
          <Route path="simulation" element={<SimulationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
