const PLAYER_ROTATION_SPEED = 0.3 * PI/180;
const TAIL_SHRINK_INTERVAL = 150;
const ENEMY_BASE_SPAWN_INTERVAL = 4000;
const TIME_SCORE_MULTIPLIER = 1/100;
const SCORE_BOX_PADDING_X = 40;
const APPLE_SPAWN_MARGIN = 50;
const APPLE_COUNT = 5;
const APPLE_RADIUS = 40;
const APPLE_LENGTH_INCREASE = 10;
const APPLE_SCORE_INCREASE = 200;
const APPLE_COMBO_MAX_TIME = 1200;
const APPLE_COMBO_SCORE_MULTIPLIER = 1.5;
const APPLE_COMBO_LENGTH_INCREASE_MULTIPLIER = 1.3;
const COMBO_UI_COLOUR = [0, 119, 255];
const COMBO_UI_SECONDARY_COLOUR = [0, 255, 170];
const PLAYER_DEATH_ANIMATION_TIME = 1000;
const PLAYER_TAIL_CUT_ANIMATION_TIME = 500;
const PLAYER_TAIL_WAVE_AMPLITUDE = 10;
const PLAYER_TAIL_WAVE_LENGTH = 100;

/**
 * @type {Vector[]}
 */
let backgroundCircles = [];

let timeOfLastEnemySpawn;
let timeOfLastAppleSpawn;
let timeOfLastAppleEaten;
let appleComboChain;
let enemySpawnInterval;

let colourToString = (colour, alpha) => `rgba(${colour[0]}, ${colour[1]}, ${colour[2]}, ${typeof alpha == 'number' ? alpha : 1})`;

class Snake {
    #dead;
    static startingLength = 80;
    static speed = 0.5;
    static headRadius = 40;
    static closestToIgnore = 4;
    static headRadius = 20;
    /**
     * 
     * @param {Vector} position the position of the snake's head
     */
    constructor(position) {
        this.position = position.copy();
        this.direction = Vector.fromPolar(-PI/180 * 45, 1);
        this.tail = new Array(Snake.startingLength).fill(0).map((x, i) => Vector.fromPolar(PI/180 * 135, Snake.speed*20*(i+1)).add(position));
        this.timeOfLastTailShrink = time;

        this.#dead = false;
        this.timeOfDeath = null;

        this.tailLengthAtPreviousCut = null;
        this.targetTailLengthAfterCut = null;
        this.timeOfTailLengthCut = null;
    }

    get dead() { return this.#dead; }
    set dead(v) {
        this.#dead = v;
        if (this.dead) {
            this.timeOfDeath = time;
            this.cutTailToLength(0);
        }
    }

    /**
     * 
     * @param {Number} l the new length of the tail
     */
    cutTailToLength(l) {
        if (l < this.targetTailLengthAfterCut || this.targetTailLengthAfterCut == null) {
            this.tailLengthAtPreviousCut = this.tail.length;
            this.targetTailLengthAfterCut = l;
            this.timeOfTailLengthCut = time;
        }
    }
}

/**
 * @type {Snake}
 */
let player;
let debug;
/**
 * @type {Enemy[]}
 */
let enemies;
/**
 * @type {Vector[]}
 */
let apples;

let newApplePosition = () => Vector.random(CANVASWIDTH-APPLE_SPAWN_MARGIN*2, CANVASHEIGHT-APPLE_SPAWN_MARGIN*2).add(APPLE_SPAWN_MARGIN, APPLE_SPAWN_MARGIN);

class Particle {
    /**
     * 
     * @param {Vector} position 
     * @param {Vector} direction 
     * @param {Number} lifespan 
     * @param {Number} size
     * @param {String} colour 
     */
    constructor(position, direction, lifespan, size, colour) {
        this.startPosition = position.copy();
        this.direction = direction.copy();
        this.lifespan = lifespan;
        this.size = size;
        this.colour = colour;
        this.timeOfSpawn = time;
    }

    get life() { return time-this.timeOfSpawn; }
    get dead() { return this.life >= this.lifespan; }
    get position() { return Vector.add(this.startPosition, Vector.multiply(this.direction, this.life)); }
    get radius() { return map(this.life, 0, this.lifespan, this.size, 0); }

    draw() {
        fillStyle(this.colour);
        circle(this.position, this.radius, 0, 1, false, true, false);
    }
}

/**
 * @type {Particle[]}
 */
const PARTICLES = [];