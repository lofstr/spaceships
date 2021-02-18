import firebase from "firebase";
import "./App.css";
import Demo from "./components/Demo";

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Visma - Spaceships</h1>
      <h4 style={{ textAlign: "center" }}>All output is to console</h4>
      <Demo></Demo>
    </div>
  );
}

export default App;
