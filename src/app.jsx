import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Window1 from "./components/wall1/window1";
import Test from "./components/test"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Test />} />
      </Routes>
    </Router>
  );
}
