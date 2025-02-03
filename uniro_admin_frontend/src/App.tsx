import "./App.css";
import Map from "./component/Map";

function App() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
      <div className="w-full h-[50px] flex flex-row items-center justify-start border-b-2 border-gray-300">
        UNIRO Admin
      </div>
      <div className="flex-1 flex flex-row w-full h-full">
        <div className="w-1/5 border border-gray-900 h-full">NAVBAR</div>
        <div className="w-4/5 h-full p-4">
          <Map />
        </div>
      </div>
    </div>
  );
}

export default App;
