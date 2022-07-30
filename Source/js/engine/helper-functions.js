// thanks to https://stackoverflow.com/questions/28036652/finding-the-shortest-distance-between-two-angles/28037434
// for this function
/**
 * 
 * @param {Number} theta1 
 * @param {Number} theta2 
 * @returns {Number} the (signed) shortest distance between the angles
 */
let shortestAngleDist = (theta1, theta2) => {
    let diff = (theta2 - theta1 + Math.PI) % (2 * Math.PI) - Math.PI;
    return diff < -Math.PI ? diff + 2 * Math.PI : diff;
}

/**
 * the position of the mouse on the webpage
 * @param {Number} x 
 * @param {Number} y 
 * @returns {Vector} the position of the mouse on canvas
 */
let adjustMousePosition = (x, y) => {
    let position = new Vector(x - (window.innerWidth - c.width) / 2, y - (window.innerHeight - c.height) / 2);
    position.x /= c.width / CANVASWIDTH;
    position.y /= c.height / CANVASHEIGHT;
    // position.calculatePolar();
    return position;
}

/**
 * Adjusts the size of the canvas to fill the screen
 * while maintaing the same aspect ratio (defined by CANVASWIDTH and CANVASHEIGHT)
 */
let adjustSize = () => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    CANVASHEIGHT = CANVASWIDTH * height/width;
    // if (width / CANVASWIDTH * CANVASHEIGHT > height) width = Math.floor(height / CANVASHEIGHT * CANVASWIDTH);
    // else height = Math.floor(width / CANVASWIDTH * CANVASHEIGHT);
    c.width = width;
    c.height = height;
    c.style.left = `${(window.innerWidth - width) / 2}px`;
    c.style.top = `${(window.innerHeight - height) / 2}px`;
    ctx.scale(width / CANVASWIDTH, height / CANVASHEIGHT);
}

/**
 * 
 * @param {Number} value the value to clamp
 * @param {Number} min the lowest possible value returned
 * @param {Number} max the highest possible value returned
 * @returns {Number} the result of clamping the value
 */
let clamp = (value, min, max) => Math.max(Math.min(value, max), min);

/**
 * allows you to clamp a value in a range without specifying which bound is the upper boudn and which is the lower bound
 * @param {Number} value the value to clamp
 * @param {Number} b1 the highest or lowest value
 * @param {Number} b2 the highest or lowest (opposite of b1) value
 * @returns {Number} the result of clamping the value
 */
let clampUnordered = (value, b1, b2) => Math.max(Math.min(value, Math.max(b1, b2)), Math.min(b1, b2));

/**
 * 
 * @param {Number} value the value to check
 * @param {Number} min the lowest value in the range
 * @param {Number} max the highest value in the range
 * @returns {boolean} min <= value <= max
 */
let inRange = (value, min, max) => value == clamp(value, min, max);

/**
 * allows you to check if a value is 
 * @param {Number} value the value to check
 * @param {Number} b1 the highest or lowest value in the range
 * @param {Number} b2 the highest or lowest value in the range (opposite of b2)
 * @returns {boolean} value is equal to b1 or b2 or between b1 and b2
 */
let inRangeUnordered = (value, b1, b2) => value == clampUnordered(value, b1, b2);

/**
 * if min > max, there is no overlap
 * @param {Number} min1 
 * @param {Number} max1 
 * @param {Number} min2 
 * @param {Number} max2 
 * @returns {Number[]} the minimum and maximum values of the range of numbers which are in both ranges given
 * @returns {Number[]} [min, max]
 */
let rangeOverlap = (min1, max1, min2, max2) => [Math.max(min1, min2), Math.min(max1, max2)];

/**
 * if min > max, there is no overlap
 * the boundaries of each range can be given in any order (highest first or lowest first)
 * @param {Number} range1boundary1 
 * @param {Number} range1boundary2 
 * @param {Number} range2boundary1 
 * @param {Number} range2boundary2 
 * @returns {Number[]} the minimum and maximum values of the range of numbers which are in both ranges given
 * @returns {Number[]} [min, max]
 */
let rangeOverlapUnordered = (range1boundary1, range1boundary2, range2boundary1, range2boundary2) => {
    return rangeOverlap(
        Math.min(range1boundary1, range1boundary2), Math.max(range1boundary1, range1boundary2),
        Math.min(range2boundary1, range2boundary2), Math.max(range2boundary1, range2boundary2)
    )
}

let isRangeOverlap = (min1, max1, min2, max2) => {
    let overlap = rangeOverlap(min1, max1, min2, max2);
    return overlap[0] < overlap[1];
}

let isRangeOverlapUnordered = (range1boundary1, range1boundary2, range2boundary1, range2boundary2) => {
    let overlap = rangeOverlapUnordered(range1boundary1, range1boundary2, range2boundary1, range2boundary2);
    return overlap[0] < overlap[1];
}

/**
 * 
 * @param {Number} minvalue 
 * @param {Number} maxvalue 
 * @returns a random number between minvalue and maxvalue
 */
let randomRange = (minvalue, maxvalue) => {
    return (Math.random()*(maxvalue-minvalue)) + minvalue;
}

/**
 * lerp is a funny word
 * @param {Number} a 
 * @param {Number} b 
 * @param {Number} t [0-1] inclusive
 * @returns the result of linearly interpolating between a and b, based on t
 */
let lerp = (a, b, t) => (b-a)*t + a;

/**
 * returns `x` linearly mapped from the range `[min1-max1]` to the range `[min2-max2]`
 * +
 * @param {Number} x the number to map
 * @param {Number} min1 the lower bound of the input range
 * @param {Number} max1 the upper bound of the input range
 * @param {Number} min2 the lower bound of the target range
 * @param {Number} max2 the upper bound of the target range
 * @returns {Number}
 */
let map = (x, min1, max1, min2, max2) => (x-min1)/(max1-min1) * (max2-min2) + min2;

/**
 * 
 * @param {Vector} position of the centre of the circle
 * @param {Number} r radius
 * @param {Number?} startAngle in rotations, not radians
 * @param {Number?} endAngle in rotations, not radians
 * @param {boolean?} shouldFill 
 * @param {boolean?} shouldStroke 
 */
let circle = (position, r, startAngle=0, endAngle=1, counterClockwise=false, shouldFill=true, shouldStroke=true) => {
    beginPath();
    arc(position, r, startAngle, endAngle, counterClockwise);
    if (shouldFill) fill();
    if (shouldStroke) stroke();
}

let randomPointInRectangle = (x, y, width, height) => {
    let value = random()*(2*width + 2*height);
    if (value < width) {
        return new Vector(x+value, y);
    }
    if (value < 2*width) {
        return new Vector(x+value - width, y+height);
    }
    value -= 2*width;
    if (value < height) {
        return new Vector(x, y+value);
    }
    return new Vector(x, y+value - width);
}