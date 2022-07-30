/**
 * @type {Menu}
 */
let scoreMenu;
/**
 * @type {Menu}
 */
let comboMenu;
/**
 * @type {String[]}
 */
const RESOURCE_DIRS = ['img/skeleton.png', 'img/player-head.png', 'img/player-head-2.png', 'img/coin.png'];
/**
 * @type {HTMLImageElement[]|HTMLAudioElement[]|SVGAElement[]}
 */
const RESOURCES = [];
const RESOURCE_LOAD_STATES = [];
let LOAD_RESOURCES_INTERVAL = null;
init = () => {
    debug = RectangleButton(UI, 40, 40, 100, 50, "#f00", "#0000", "DEBUG", "#fff", "50px Arial", []);
    scoreMenu = new Menu(new Vector(0, 0), UI);
    restartGame();
    paused = true;
    for (let i in RESOURCE_DIRS) {
        if (RESOURCE_DIRS[i].endsWith(".png") || RESOURCE_DIRS[i].endsWith(".jpg")) {
            let img = new Image();
            img.src = RESOURCE_DIRS[i];
            img.onload = () => {
                RESOURCE_LOAD_STATES[i] = true;
            }

            RESOURCES.push(img);
            RESOURCE_LOAD_STATES.push(false);
        }
    }
    LOAD_RESOURCES_INTERVAL = setInterval(() => {
        if (RESOURCE_LOAD_STATES.reduce((acc, val) => acc && val, true)) {
            // all resources loaded
            // paused = false;
            clearInterval(LOAD_RESOURCES_INTERVAL);
        } else {
            paused = true;
        }
    }, 1000/60);
    setTimeout(() => backgroundCircles = new Array(100).fill(0).map((x, i) => {
        // let spacing = new Vector(CANVASWIDTH/10, CANVASHEIGHT/10);
        return new Vector((i%10) * CANVASWIDTH/10, floor(i/10)*CANVASHEIGHT/10)
    }), 100);
    let indeces = ENEMY_TYPE_INDECES[Rune.getChallengeNumber()%ENEMY_TYPE_INDECES.length];
    ENEMY_TYPES = indeces.map(x => ALL_ENEMY_TYPES[x]);
}

restartGame = () => {
    time = 0;
    score = 0;
    player = new Snake(new Vector(CANVASWIDTH/2, CANVASHEIGHT/2));
    paused = false;
    enemies = [];
    timeOfLastEnemySpawn = time;
    timeOfLastAppleSpawn = time;
    timeOfLastAppleEaten = time;
    apples = new Array(APPLE_COUNT).fill(0).map(x => newApplePosition());
    appleComboChain = 0;
    enemySpawnInterval = ENEMY_BASE_SPAWN_INTERVAL;
    scoreMenu.buttons = [];
    PARTICLES.splice(0, PARTICLES.length);
}
