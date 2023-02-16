import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";

export default function App(props) {
  const [xVal, setXval] = useState(null)
  const [yVal, setYval] = useState(null)
  const [zVal, setZval] = useState(null)
  let numbers = []

  window.ipcRender.receive("main-to-render", (result) => {
    //console.log(result)

    if(String(result).startsWith('X:')) {
      numbers = String(result).match(/-?\d+/g).map(Number)
      //console.log(numbers)
      setXval(numbers[0])
      setYval(numbers[1])
      setZval(numbers[2])
    
    }

  });


  useEffect(() => {
    if(xVal > 10 && yVal > 2) {
      console.log('touched')
    }

  }, [xVal, yVal])



  return <div>{"help"}</div>;
}

/*
  <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
*/
