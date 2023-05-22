// SIMPLE DRAWING TEST FOR TESTING THE HAND/PERSON TRACKING

import React, { useState, useEffect, useRef } from "react";
import "./test.css";

export default function Test2() {
	const [xVal, setXval] = useState(0);
	const [yVal, setYval] = useState(0);
	const [zVal, setZval] = useState(0);
	const [items, setItems] = useState([]);
	const canvasRef = useRef(null);

    const [x, setX] = useState(0)
    const [y, setY] = useState(0)

	let numbers = [];

	window.ipcRender.receive("main-to-render", (result) => {
		//getting coordinates of users' hands
		//console.log(result)

		if (String(result).startsWith("TWO:")) {
			// numbers = String(result).match(/-?\d+/g).map(Number);
			numbers = String(result).match(/\d+/g).map(Number);

			setXval(numbers[0]);
			setYval(numbers[1]);
			setZval(numbers[2]);

            setX(2000 - xVal)
            setY(zVal)
            console.log(x, y)
			// setItems([...items, { x: xVal, y: yVal }]);
		}
	});

	const draw = (canvasRef) => {
		const canvas = canvasRef.current;
		let ctx = canvas.getContext("2d");
		canvas.width = 1920;
		canvas.height = 1080;
		const W = canvas.width;
		const H = canvas.height;

		// converting tracking coordinates to canvas x and y ranges
		let oldMax = 4000;
		let oldMin = 0;
		let newMax = W;
		let newMin = 0;
		let oldRange = oldMax - oldMin;
		let newRange = newMax - newMin;
		let oldValue = 1400;
		let newValue = ((oldValue - oldMin) * newRange) / oldRange + newMin;

		let yOld = 4000;
		let yNew = H;
		let ynewValue = 2000 * (yNew / yOld);

		// inverting the x axis to match tracking coordinates

		// ctx.setTransform(-1, 0, 0, 1, 0, 0); // resets the transform to clear
		// ctx.clearRect(0, 0, W, H); // clears the canvas

		// ctx.setTransform(-1, 0, 0, 1, W / 2, 0); // moves the origin to the center of the canvas

		// for debug: testing positions
		ctx.fillStyle = "#ff0000";
		ctx.strokeStyle = "#ff0000";
		ctx.beginPath();

		let wCalc = newMax / oldMax
		let hCalc = yNew / yOld

		ctx.rect(x * wCalc, y * hCalc, 40, 40)
		ctx.stroke();

	};

	// for debug: finding page coordinates
	document.addEventListener("click", printMousePos, true);
	function printMousePos(e) {
		let cursorX = e.pageX;
		let cursorY = e.pageY;
		document.getElementById("test").innerHTML =
			"x: " + cursorX + ", y: " + cursorY;
	}

	useEffect(() => {
		let animationFrameId;
		const render = () => {
			draw(canvasRef);
			animationFrameId = window.requestAnimationFrame(render);
		};
		render();
		return () => {
			window.cancelAnimationFrame(animationFrameId);
		};
	}, [draw]);

	return (
		<div>
			<div className="point">
				<canvas className="canvas" ref={canvasRef} />
			</div>
		</div>
	);
}
