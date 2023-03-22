import React, { useState, useEffect, useRef } from "react";
import { ReactDOM } from "react";
import vid1 from "../../assets/01_Andrew Carnegie.mp4";
import vid2 from "../../assets/02_Famous Annuitants.mp4";
import vid3 from "../../assets/03_Real Estate.mp4";
import vid4 from "../../assets/04_Land Conservation.mp4";
import vid5 from "../../assets/05_Not Just Teachers.mp4";
import layout from "../../assets/layout.jpg";
import "./window2.css";
import TouchZone from "./touchZone2";

export default function Window2() {
  const [xVal, setXval] = useState(null);
  const [yVal, setYval] = useState(null);
  const [zVal, setZval] = useState(null);

  const [lock1, setLock1] = useState(false);
  const [lock2, setLock2] = useState(false);
  const [lock3, setLock3] = useState(false);
  const [lock4, setLock4] = useState(false);
  const [lock5, setLock5] = useState(false);

  let active = [];
  let numbers = [];

  window.ipcRender.receive("main-to-render", (result) => {
    //getting coordinates of users' hands
    //console.log(result)

    if (String(result).startsWith("X:")) {
      numbers = String(result).match(/-?\d+/g).map(Number);
      //console.log(numbers)
      setXval(numbers[0]);
      setYval(numbers[1]);
      setZval(numbers[2]);
    }
  });

  //lock states for each touch zone
  const getZone1 = (value) => {
    if (value === true) {
      active.push("zone1");
      return;
    }
  };

  const getZone2 = (value) => {
    if (value === true) {
      active.push("zone2");
      return;
    }
  };

  const getZone3 = (value) => {
    if (value === true) {
      active.push("zone3");
      return;
    }
  };

  const getZone4 = (value) => {
    if (value === true) {
      active.push("zone4");
      return;
    }
  };

  const getZone5 = (value) => {
    if (value === true) {
      active.push("zone5");
      return;
    }
  };

  useEffect(() => {
    if (active.includes("zone3")) {
      setLock1(true);
      setLock2(true);
      return;
    } else {
      setLock1(false);
      setLock2(false);
      return;
    }
  }, [active]);

  // let coords = document.getElementById("coords")

  // document.onclick = function(e) { // shows click coordinates
  //   coords.innerHTML = e.clientX + ':' + e.clientY;
  // };

  return (
    <div className="main-wrapper">
      <div className="zone1">
        <TouchZone
          zone="zone1"
          xVal={xVal}
          yVal={yVal}
          zVal={zVal}
          vid={vid1}
          lock={lock1}
          playing={getZone1}
        />
      </div>
      <div className="zone4">
        <TouchZone
          zone="zone4"
          xVal={xVal}
          yVal={yVal}
          zVal={zVal}
          vid={vid4}
          lock={lock4}
          playing={getZone4}
        />
      </div>
      <div className="zone5">
        <TouchZone
          zone="zone5"
          xVal={xVal}
          yVal={yVal}
          zVal={zVal}
          vid={vid5}
          lock={lock5}
          playing={getZone5}
        />
      </div>

      <div className="zone3">
        <TouchZone
          zone="zone3"
          xVal={xVal}
          yVal={yVal}
          zVal={zVal}
          vid={vid3}
          lock={lock3}
          playing={getZone3}
        />
      </div>

      <div className="zone2">
        <TouchZone
          zone="zone2"
          xVal={xVal}
          yVal={yVal}
          zVal={zVal}
          vid={vid2}
          lock={lock2}
          playing={getZone2}
        />
      </div>
      <img src={layout} className="background" />
    </div>
  );
}
