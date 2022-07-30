let {
	beginPath,
	arc,
	fillRect,
	strokeRect,
	moveTo,
	lineTo,
	createLinearGradient,
	createRadialGradient,
	fill,
	stroke,
	fillText,
	strokeText,
	drawImage,
	save,
	restore,
	translate,
	rotate,
} = ctx;

let fillStyle = v => ctx.fillStyle = v;
let strokeStyle = v => ctx.strokeStyle = v;
let font = v => ctx.font = v;
let lineWidth = v => ctx.lineWidth = v;

const {
	PI,
	SQRT2,
	random,
	floor,
	ceil,
	round,
	max,
	min,
	abs,
	sqrt,
	sin,
	cos,
	tan
} = Math;

const TWO_PI = PI*2;
const HALF_PI = PI/2;

beginPath = beginPath.bind(ctx);
/**
 * @param {Vector} position
 * @param {Number} radius
 * @param {Number} startAngle in rotations, not radians
 * @param {Number} endAngle in rotations, not radius
 * @param {boolean?} counterClockwise
 */
arc = (position, radius, startAngle, endAngle, counterClockwise) => ctx.arc(position.x, position.y, radius, startAngle*2*PI, endAngle*2*PI, counterClockwise);
fillRect = fillRect.bind(ctx);
strokeRect = strokeRect.bind(ctx);
/**
 * @param {Vector} position
 */
moveTo = position => ctx.moveTo(position.x, position.y);
/**
 * @param {Vector} position
 */
lineTo = position => ctx.lineTo(position.x, position.y);
createLinearGradient = createLinearGradient.bind(ctx);
createRadialGradient = createRadialGradient.bind(ctx);
fill = fill.bind(ctx);
stroke = stroke.bind(ctx);
fillText = fillText.bind(ctx);
strokeText = strokeText.bind(ctx);
drawImage = drawImage.bind(ctx);
save = save.bind(ctx);
restore = restore.bind(ctx);
/**
 * @param {Vector} offset
 */
translate = offset => ctx.translate(offset.x, offset.y);
/**
 * @param {Number} rotations angle in rotations, not radians
 */
rotate = rotations => ctx.rotate(rotations*2*PI);