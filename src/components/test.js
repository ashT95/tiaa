// SIMPLE DRAWING TEST FOR TESTING THE HAND/PERSON TRACKING

import React, { useState, useEffect, useRef } from "react";
import "./test.css";

export default function Test() {
	const [xVal, setXval] = useState(0);
	const [yVal, setYval] = useState(0);
	const [zVal, setZval] = useState(0);
	const [items, setItems] = useState([]);
	const canvasRef = useRef(null);

	const [xMin, setXMin] = useState(0);
	const [yMin, setYMin] = useState(0);
	const [xMax, setXMax] = useState(0);
	const [yMax, setYMax] = useState(0);

	let numbers = [];

	window.ipcRender.receive("main-to-render", (result) => {
		//getting coordinates of users' hands
		//console.log(result)

		if (String(result).startsWith("HAND:")) {
			// numbers = String(result).match(/-?\d+/g).map(Number);
			numbers = String(result).match(/\d+/g).map(Number);

			setXMin(numbers[0])
			setYMin(numbers[1])
			setXMax(numbers[2])
			setYMax(numbers[3])

			// setXval(numbers[0]);
			// setYval(numbers[1]);
			// setZval(numbers[2]);

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
		// let oldMax = 2000;
		// let oldMin = -2000;
		// let newMax = W / 2;
		// let newMin = -W / 2;
		// let oldRange = oldMax - oldMin;
		// let newRange = newMax - newMin;
		// let oldValue = 1400;
		// let newValue = ((oldValue - oldMin) * newRange) / oldRange + newMin;

		// let yOld = 4000;
		// let yNew = H;
		// let ynewValue = 2000 * (yNew / yOld);

		// inverting the x axis to match tracking coordinates

		// ctx.setTransform(-1, 0, 0, 1, 0, 0); // resets the transform to clear
		// ctx.clearRect(0, 0, W, H); // clears the canvas

		// ctx.setTransform(-1, 0, 0, 1, W / 2, 0); // moves the origin to the center of the canvas

		// for debug: testing positions
		ctx.fillStyle = "#ff0000";
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.arc(0, 0, 10, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "#ff0000";
		ctx.strokeStyle = "#ff0000";
		ctx.beginPath();

		let wCalc = 1920 / 640
		let hCalc = 1080 / 352

		let x1 = Math.floor(xMin * wCalc)
		let y1 = Math.floor(yMin * hCalc)
		let x2 = Math.floor((xMax - xMin) * wCalc)
		let y2 = Math.floor((yMax - yMin) * hCalc)

		ctx.rect(x1, y1, x2, y2)
		// ctx.rect(xMin, yMin, xMax - xMin, yMax - yMin)
		ctx.stroke();

		// mapping all world space coordinates to canvas
		// items.map((item) => {
		// 	ctx.fillStyle = "#ff0000";
		// 	ctx.beginPath();
		// 	ctx.moveTo(item.x, item.y);
		// 	ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
		// 	ctx.fill();
		// });
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
