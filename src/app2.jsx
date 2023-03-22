import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Window2 from "./components/wall2/window2";

export default function App2() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Window2 />} />
      </Routes>
    </Router>
  );
}
