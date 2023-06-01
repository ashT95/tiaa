// SIMPLE DRAWING TEST FOR TESTING THE HAND/PERSON TRACKING

import React, { useState, useEffect, useRef } from "react";
import "./test.css";

export default function Test() {
	const [xVal, setXval] = useState(0);
	const [yVal, setYval] = useState(0);
	const [zVal, setZval] = useState(0);
	const [items, setItems] = useState([]);
	const canvasRef = useRef(null);

	let numbers = [];

	window.ipcRender.receive("main-to-render", (result) => {
		//getting coordinates of users' hands

		if (String(result).startsWith("HAND:")) {
			numbers = String(result).match(/-?\d+/g).map(Number);

			setXval(numbers[0]);
			setYval(numbers[1]);
			setZval(numbers[2]);
			// console.log(numbers)

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
		let oldMax = -2000;
		let oldMin = 2000;
		let newMax = W;
		let newMin = 0;
		let oldRange = oldMax - oldMin;
		let newRange = newMax - newMin;
		let oldValue = 1400;
		let newValue = ((oldValue - oldMin) * newRange) / oldRange + newMin;

		let yOld = 3000;
		let yNew = H;
		let ynewValue = 2000 * (yNew / yOld);

		// inverting the x axis to match tracking coordinates
		// ctx.setTransform(-1, 0, 0, 1, 0, 0); // resets the transform to clear
		// ctx.clearRect(0, 0, W, H); // clears the canvas
		// ctx.setTransform(-1, 0, 0, 1, W / 2, 0); // moves the origin to the center of the canvas

		let x1 = ((xVal - oldMin) * newRange) / oldRange + newMin;
		let y1 = zVal * (yNew / yOld);

		ctx.fillStyle = "#ff0000";
		ctx.strokeStyle = "#ff0000";
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.rect(x1, y1, 50, 50)
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
