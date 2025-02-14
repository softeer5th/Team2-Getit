import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App";
import LogPage from "./page/logPage";
import BuildingPage from "./page/buildingPage";
import SimulationPage from "./page/simulationPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default AppRouter;
