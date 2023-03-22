import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Window1 from "./components/wall1/window1";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Window1 />} />
      </Routes>
    </Router>
  );
}
