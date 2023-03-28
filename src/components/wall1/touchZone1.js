import React, { useEffect, useState, useRef } from "react";
import zoneData from "../../zones.json";

export default function TouchZone(props) {
  const { vid, border, zone, xVal, yVal, zVal, lock, playing, borderNum } = props;
  const [borderShow, setBorderShow] = useState(false);
  const videoRef = useRef(null);
  const borderRef = useRef(null);

  let data = JSON.parse(JSON.stringify(zoneData.window1));
  let coords = Object.values(data[zone]);
  let xMin = coords[0];
  let xMax = coords[1];
  let yMin = coords[2];
  let yMax = coords[3];
  let zMin = coords[4];
  let zMax = coords[5];
  let xBorderMin = coords[6];
  let xBorderMax = coords[7];
  let yBorderMin = coords[8];
  let yBorderMax = coords[9];
  let zBorderMin = coords[10];
  let zBorderMax = coords[11]; 

  useEffect(() => {
    if (
      xVal >= xBorderMin &&
      xVal < xBorderMax &&
      yVal >= yBorderMin &&
      yVal < yBorderMax &&
      zVal >= zBorderMin &&
      zVal < zBorderMax
    ) {
      handleBorder();
      setBorderShow(true);
    } 
    
    if (
      xVal >= xMin &&
      xVal < xMax &&
      yVal >= yMin &&
      yVal < yMax &&
      zVal >= zMin &&
      zVal < zMax
    ) {
      handlePlay();
      setBorderShow(false);
      //console.log(zone)
    } 
    
  }, [xVal, yVal, zVal, borderShow]);

  const handleEnd = () => {
    videoRef.current.currentTime = 0;
    videoRef.current.pause();
    playing(false);
  };

  const handlePlay = () => {
    videoRef.current.play();
    playing(true);
  };

  const handleBorder = () => {
    borderRef.current.play();
  };

  return (
    <div>
      <div className={borderShow ? `border${borderNum}` : `hiddenBorder${borderNum}`}>
        <video
          src={border}
          id={border}
          ref={borderRef}
          muted={false}
          loop={true}
          preload="auto"
          hidden={borderShow ? false : true}
        />
      </div>
      <div className={zone}>
        <video
          src={vid}
          id={vid}
          ref={videoRef}
          muted={false}
          loop={false}
          preload="auto"
          onEnded={handleEnd}
        />
      </div>
    </div>
  );
}
