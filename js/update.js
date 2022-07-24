calc = () => {
    movePlayer();
    updateEnemies();
    updateApples();
    checkGameOver();
    calculateScore();
}

let movePlayer = () => {
    if (Mouse.leftclick.down) player.direction.rotate(PLAYER_ROTATION_SPEED * deltaTime * (Mouse.leftclick.start.x <= CANVASWIDTH/2 ? -1 : 1));
    for (let i=player.tail.length-1; i>0; i--) {
        player.tail[i] = player.tail[i-1].copy();
    }
    player.tail[0] = player.position.copy();
    player.position.add(Vector.multiply(player.direction, Snake.speed*deltaTime));
    if (time-player.timeOfLastTailShrink > TAIL_SHRINK_INTERVAL) {
        player.timeOfLastTailShrink = time;
        player.tail.splice(player.tail.length-1);
    }
}

let checkGameOver = () => {
    if (player.tail.length <= Snake.closestToIgnore) {
        paused = true;
        Rune.gameOver();
        return;
    }
    for (let i=player.tail.length-1; i>=Snake.closestToIgnore; i--) {
        if (player.position.to(player.tail[i]).sqrLength() < Snake.headRadius*Snake.headRadius) {
            paused = true;
            Rune.gameOver();
            return;
        }
        for (let enemy of enemies) {
            if (enemy.active && enemy.sqrDistanceToPoint(player.tail[i]) <= 5*5) {
                player.tail.splice(i);
                break;
            }
        }
    }
    for (let enemy of enemies) {
        if (enemy.active && enemy.sqrDistanceToPoint(player.position) < Snake.headRadius*Snake.headRadius) {
            paused = true;
            Rune.gameOver();
            return;
        }
    }
    if (!Vector.inBounds(player.position, new Vector(0, 0), new Vector(CANVASWIDTH, CANVASHEIGHT))) {
        paused = true;
        Rune.gameOver();
        return;
    }
}

let updateEnemies = () => {
    for (let i=enemies.length-1; i>=0; i--) {
        if (enemies[i].dead) enemies.splice(i, 1);
    }

    if (time - timeOfLastEnemySpawn > enemySpawnInterval) {
        let Type = ENEMY_TYPES[floor(randomRange(0, ENEMY_TYPES.length))];
        enemies.push(new Type(Vector.random(CANVASWIDTH, CANVASHEIGHT)));
        timeOfLastEnemySpawn = time;
        enemySpawnInterval *= 0.99;
    }
}

let calculateScore = () => {
    let appleMultiplier = time-timeOfLastAppleEaten < APPLE_COMBO_MAX_TIME ? APPLE_COMBO_SCORE_MULTIPLIER**appleComboChain : 1;
    score += deltaTime * TIME_SCORE_MULTIPLIER * appleMultiplier;
    debug.renderer.text = `${floor(score)} ${appleComboChain}`;
    font(debug.renderer.font);
    let details = ctx.measureText(debug.renderer.text);
    debug.renderer.width = details.actualBoundingBoxLeft + details.actualBoundingBoxRight + SCORE_BOX_PADDING_X;
}

let updateApples = () => {
    for (let i=apples.length-1; i>=0; i--) {
        if (apples[i].to(player.position).sqrLength() < (Snake.headRadius + APPLE_RADIUS)*(Snake.headRadius + APPLE_RADIUS)) {
            appleComboChain++;
            let playerTailOffset = player.tail[player.tail.length-2].to(player.tail[player.tail.length-1]);
            let previousPoint = player.tail[player.tail.length-1];
            for (let j=0; j<APPLE_LENGTH_INCREASE * (APPLE_COMBO_LENGTH_INCREASE_MULTIPLIER ** appleComboChain); j++) {
                let newPoint = Vector.add(previousPoint, playerTailOffset.copy().rotate(PLAYER_ROTATION_SPEED*deltaTime*j));
                player.tail.push(newPoint.copy());
                previousPoint = newPoint.copy();
            }
            timeOfLastAppleEaten = time;
            timeOfLastAppleSpawn = time;
            let scoreIncrease = APPLE_SCORE_INCREASE * (APPLE_COMBO_SCORE_MULTIPLIER ** appleComboChain);
            score += scoreIncrease;
            scoreMenu.addButton(RectangleButton(scoreMenu, apples[i].x, apples[i].y, 200, 70, colourToString(COMBO_UI_SECONDARY_COLOUR), "#0000", `+${floor(scoreIncrease)}`, "#000", "50px Arial", []));
            apples[i] = newApplePosition();
        }
    }
    if (time-timeOfLastAppleEaten > APPLE_COMBO_MAX_TIME) appleComboChain = 0;
}
