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
		//console.log(result)

		if (String(result).startsWith("HAND:")) {
			// numbers = String(result).match(/-?\d+/g).map(Number);
			numbers = String(result).match(/\d+/g).map(Number);

			setXval(numbers[0]);
			setYval(numbers[1]);
			setZval(numbers[2]);

			setItems([...items, { x: xVal, y: yVal }]);
		}
	});

	const draw = (canvasRef, x, y) => {
		const canvas = canvasRef.current;
		let ctx = canvas.getContext("2d");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		items.map((item) => {
			ctx.fillStyle = "#ff0000";
			ctx.beginPath();
			ctx.moveTo(item.x, item.y);
			ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
			ctx.fill();
		});
	};

	useEffect(() => {
		let animationFrameId;

		const render = () => {
			draw(canvasRef, xVal, yVal);
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
