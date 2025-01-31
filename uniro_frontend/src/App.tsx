import { Route, Routes } from "react-router";
import "./App.css";
import Demo from "./pages/demo";
import LandingPage from "./pages/landing";
import UniversitySearchPage from "./pages/search";
import NavigationResultPage from "./pages/navigationResult";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Demo />} />
			<Route path="/landing" element={<LandingPage />} />
			<Route path="/university" element={<UniversitySearchPage />} />
			<Route path="/result" element={<NavigationResultPage />} />
		</Routes>
	);
}

export default App;
