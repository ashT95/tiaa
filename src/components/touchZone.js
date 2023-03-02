import React, { useEffect, useState, useRef } from "react";
import zoneData from "../zones.json";

export default function TouchZone(props) {
  const { vid, zone, xVal, yVal, zVal, lock, playing } = props;
  const videoRef = useRef(null);
  const [active, setActive] = useState(false);

  let data = JSON.parse(JSON.stringify(zoneData));
  let coords = Object.values(data[zone]);
  let xMin = coords[0];
  let xMax = coords[1];
  let yMin = coords[2];
  let yMax = coords[3];
  let zMin = coords[4];
  let zMax = coords[5];

  useEffect(() => {
    if (
      xVal >= xMin &&
      xVal < xMax &&
      yVal >= yMin &&
      yVal < yMax &&
      zVal >= zMin &&
      zVal < zMax
    ) {
      if (lock === false) {
        setActive(true);
        console.log(zone);
      } else {
        setActive(false)
      }
    }

    if (active) {
      handlePlay();
    } 


  }, [active, xVal, yVal, zVal, lock, playing]);

  const handleEnd = () => {
    videoRef.current.currentTime = 0;
    videoRef.current.pause();
    playing(false)
    setActive(false);
  };

  const handlePlay = () => {
    videoRef.current.play();
    playing(true)
  };

  return (
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
  );
}