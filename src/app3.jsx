import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Window3 from "./components/wall3/window3";

export default function App3() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Window3 />} />
      </Routes>
    </Router>
  );
}
