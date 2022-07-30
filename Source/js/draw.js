draw = () => {
	drawBackground();
	drawEnemies();
	drawApples();
	drawPlayerSnake();
	drawTouchControls();
	drawScore();
	drawParticles();
}

let drawBackground = () => {
	fillStyle("#333");
	fillRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
	fillStyle("#222");
	lineWidth(5);
	for (let i in backgroundCircles) {
		circle(backgroundCircles[i], 15, 0, 1, false, true, false);
		backgroundCircles[i].add(-0.5, 0.5);
		if (backgroundCircles[i].x < -15) backgroundCircles[i].x += CANVASWIDTH + 30;
		if (backgroundCircles[i].y > CANVASHEIGHT+15) backgroundCircles[i].y -= CANVASHEIGHT+30;
	}
}

let drawTouchControls = () => {
	Mouse.touches.filter(x => x.down).forEach(x =>  {
		let colour = "#555";
		fillStyle(colour);
		circle(x.start, 30);
		lineWidth(map(time%300, 0, 300, 1, 0.3) * 7);
		strokeStyle(colour);
		circle(x.start, map(time%300, 0, 300, 25, 80), 0, 1, false, false, true);
	})
}

let drawPlayerSnake = () => {
	strokeStyle("#0000");
	fillStyle("#999");
	// circle(player.position, 30);
	if (player.tail.length) {
		beginPath();
		lineWidth(3);
		strokeStyle("#999");
		moveTo(player.tail[player.tail.length-1]);
		for (let i=player.tail.length-2; i>=Snake.closestToIgnore; i--) {
			lineTo(player.tail[i]);
		}
		stroke();
		for (let i=0; i<player.tail.length-1; i+=4) {
			// lineTo(player.tail[i]);
			// console.log(i, player.tail.length);
			drawSnakeSkeleton(player.tail[i], Vector.add(
				player.tail[i], Vector.subtract(player.tail[i+1], player.tail[i]).multiply(4)
			));
		}
	}
	drawSnakeHead();
}

let drawEnemies = () => {
	strokeStyle("#f00");
	lineWidth(10);
	strokeRect(5, 5, CANVASWIDTH-10, CANVASHEIGHT-10)
	for (let enemy of enemies) enemy.draw();
}

let drawApples = () => {
	fillStyle("#fbff00");
	strokeStyle("#000");
	lineWidth(3);
	for (let apple of apples) {
		circle(apple, APPLE_RADIUS);
		// drawImage(
		// 	RESOURCES[3], // coin.png
		// 	0, 0, RESOURCES[3].width, RESOURCES[3].height,
		// 	floor(apple.x-APPLE_RADIUS), floor(apple.y-APPLE_RADIUS), 2*APPLE_RADIUS, 2*APPLE_RADIUS
		// );
	}
}

let drawScore = () => {
	for (let i=scoreMenu.buttons.length-1; i>=0; i--) {
		let alpha = scoreMenu.buttons[i].renderer.bgcolour.split(",")[3];
		alpha = alpha.slice(1, alpha.length-1);
		alpha = max(parseFloat(alpha) - 0.05, 0);
		scoreMenu.buttons[i].renderer.bgcolour = colourToString(COMBO_UI_SECONDARY_COLOUR, alpha);
		if (alpha == 0) scoreMenu.buttons.splice(i, 1);
	}

	let v = 1 - clamp((time-timeOfLastAppleEaten)/APPLE_COMBO_MAX_TIME, 0, 1);
	debug.renderer.bgcolour = colourToString(COMBO_UI_SECONDARY_COLOUR.map(x => x*v));
}

/**
 * 
 * @param {Vector} p1 
 * @param {Vector} p2 
 */
let drawSnakeSkeleton = (p1, p2) => {
	let size = p1.to(p2).length();
	save();
	translate(p1);
	rotate(p1.to(p2).theta()/(2*PI));
	translate(new Vector(0, -size/2));
	ctx.drawImage(RESOURCES[0], 0, 0, RESOURCES[0].width, RESOURCES[0].height, 0, 0, size, size);
	restore();
}

let drawSnakeHead = () => {
	let angle = clamp(map(apples.reduce((acc, val) => min(acc, player.position.to(val).length()), Infinity), 0, 200, 0.15, 0), 0, 0.15);
	save();
	translate(Vector.subtract(player.position, new Vector(Snake.headRadius, 0)).add(playerOffset().multiply(0.5)));
	rotate(player.direction.theta()/(2*PI));
	let imageSizeMultiplier = 1;
	// save();
	rotate(-angle);
	drawImage(
		RESOURCES[1], // top of player head
		0, 0, RESOURCES[1].width, RESOURCES[1].height,
		0, -Snake.headRadius*2*imageSizeMultiplier, 2*Snake.headRadius*imageSizeMultiplier, 2*Snake.headRadius*imageSizeMultiplier
	);
	// restore();
	rotate(angle*2);
	drawImage(
		RESOURCES[2], // bottom of player head
		0, 0, RESOURCES[2].width, RESOURCES[2].height,
		0, 0, 2*Snake.headRadius*imageSizeMultiplier, Snake.headRadius*imageSizeMultiplier
	)
	restore();
}

let drawParticles = () => {
	for (let particle of PARTICLES) particle.draw();
}
