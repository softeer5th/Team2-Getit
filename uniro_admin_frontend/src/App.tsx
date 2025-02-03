import "./App.css";
import NavBar from "./components/navBar";
import LogListContainer from "./container/logListContainer";
import MainContainer from "./container/mainContainer";
import MapContainer from "./container/mapContainer";

function App() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center space-y-1">
      <NavBar />
      <MainContainer>
        <LogListContainer />
        <MapContainer />
      </MainContainer>
    </div>
  );
}

export default App;
