import React, { useEffect, useState, useRef } from "react";
import zoneData from "../../zones.json";

export default function TouchZone(props) {
  const { vid, border, zone, xVal, yVal, zVal, lock, playing, borderNum } =
    props;
  const [borderShow, setBorderShow] = useState(true);
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
      }
      console.log(zone)
    }
    handleBorder();
    handlePlay();
  }, [xVal, yVal, zVal, lock]);

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

  const handleBorderEnd = () => {
 
    borderRef.current.currentTime = 0;
    borderRef.current.pause();
    setBorderShow(false)
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
        />
      </div>
      <div className={zone}>
        <video
          src={vid}
          id={vid}
          ref={videoRef}
          muted={false}
          loop={true}
          preload="auto"
          onEnded={handleEnd}
        />
      </div>
    </div>
  );
}
