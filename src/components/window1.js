import React, { useState, useEffect, useRef } from "react";
import vid1 from "../assets/01_100.webm";
import vid2 from "../assets/02_100.webm";
import vid3 from "../assets/03_100.webm";
import vid4 from "../assets/04_100.webm";
import vid5 from "../assets/05_100.webm";
import layout from "../assets/layout.png";
import "./window1.css";
import TouchZone from "./touchZone";

export default function Window1() {
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
    //console.log(result)

    if (String(result).startsWith("X:")) {
      numbers = String(result).match(/-?\d+/g).map(Number);
      //console.log(numbers)
      setXval(numbers[0]);
      setYval(numbers[1]);
      setZval(numbers[2]);
    }
  });

 const getZone1 = (value) => {
  if(value === true) {
    active.push('zone1')
    return;
  }
 }

 const getZone2 = (value) => {
  if(value === true) {
    active.push('zone2')
    return;
  }
 }
 
 const getZone3 = (value) => {
  if(value === true) {
    active.push('zone3')
    return;
  }
 }

 const getZone4 = (value) => {
  if(value === true) {
    active.push('zone4')
    return;
  }
 }

 const getZone5 = (value) => {
  if(value === true) {
    active.push('zone5')
    return;
  }
 }

 useEffect(() => {
  if(active.includes('zone3')) {
    setLock1(true)
    setLock2(true)
    return;
  } else {
    setLock1(false)
    setLock2(false)
    return;
  }

 }, [active])

  return (
    <div className="main-wrapper">
      <div className="background">
        <img src={layout} alt="layout img" id="bgImg" />
      </div>
      <TouchZone zone="zone1" xVal={xVal} yVal={yVal} zVal={zVal} vid={vid1} lock={lock1} playing={getZone1} />
      <TouchZone zone="zone2" xVal={xVal} yVal={yVal} zVal={zVal} vid={vid2} lock={lock2} playing={getZone2} />
      <TouchZone zone="zone3" xVal={xVal} yVal={yVal} zVal={zVal} vid={vid3} lock={lock3} playing={getZone3} />
    
    </div>
  );
}
