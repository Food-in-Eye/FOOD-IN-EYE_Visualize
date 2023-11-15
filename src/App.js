import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GazeVisualization from "./components/GazeVisualization.module";
import DateList from "./components/DateList.module";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DateList />} />
        <Route path="/exhibition" element={<GazeVisualization />} />
      </Routes>
    </Router>
  );
}

export default App;
