class Enemy {
    /**
     * 
     * @param {Number} lifespan the total lifetime of the enemy
     * @param {Number} inactiveTime the time when a warning is drawn but the enemy itself is not active
     */
    constructor(lifespan, inactiveTime) {
        this.lifespan = lifespan;
        this.inactiveTime = inactiveTime;
        this.spawnTime = time;
    }

    get t() { return this.active ? (this.life-this.inactiveTime)/(this.lifespan-this.inactiveTime) : this.life/this.inactiveTime; }
    
    get life() { return time-this.spawnTime; }

    /**
     * 
     * @returns {boolean}
     */
    get active() {
        return this.life > this.inactiveTime;
    }

    /**
     * 
     * @returns {boolean}
     */
    get dead() {
        return this.life > this.lifespan;
    }

    /**
     * 
     * @param {Vector} point
     * @returns {float}
     */
    sqrDistanceToPoint(point) {
        return null;
    }

    draw() {
        // nothing
    }

    spawnParticles() {
        // nothing
    }
}

/**
 * 
 * @param {Vector} a one end of the line
 * @param {Vector} b the other end of the line
 * @param {Vector} point the point to calculate distance to
 * @returns 
 */
let pointLineDistance = (a, b, point) => {
    let m1 = (b.y-a.y)/(b.x-a.x);
    let c1 = a.y - m1*a.x;

    let m2 = -1/m1;
    let c2 = point.y - m2*point.x;

    let x = clampUnordered((c1-c2)/(m2-m1), a.x, b.x);
    let y = m1*x + c1;
    return point.sqrDistanceTo(new Vector(x, y));
}

class CircleEnemy extends Enemy {
    static lifespan = 10000;
    static inactiveTime = 3000;
    static minRadius = 100;
    static maxRadius = 400;
    static randomCircleMultiplier = 0.05;
    static circleMinRadius = 4;
    static circleMaxRadius = 10;
    constructor(position) {
        super(CircleEnemy.lifespan, CircleEnemy.inactiveTime);
        this.position = position.copy();
        this.radius = randomRange(CircleEnemy.minRadius, CircleEnemy.maxRadius);
    }

    draw() {
        strokeStyle("#f00");
        if (!this.active) {
            fillStyle("#8669");
            circle(this.position, this.radius, -0.25 - this.life/this.inactiveTime * 0.5, -0.25 + this.life/this.inactiveTime * 0.5);
        } else {
            fillStyle("#f00");
            circle(this.position, this.radius);
            fillStyle("#800");
            strokeStyle("#400");
        }
    }

    /**
     * 
     * @param {Vector} point 
     * @returns {float}
     */
    sqrDistanceToPoint(point) {
        let l = max(0, point.distanceTo(this.position)-this.radius);
        return l*l;
    }

    spawnParticles() {
        let randomDirection = Vector.fromPolar(this.active ? randomRange(0, 2*PI) : randomRange(-0.25 - this.life/this.inactiveTime * 0.5, -0.25 + this.life/this.inactiveTime * 0.5)*2*PI, this.radius);
        PARTICLES.push(new Particle(
            Vector.add(randomDirection, this.position),
            randomDirection.copy().normalise().multiply(0.1),
            1000, 15, this.active ? "#f00" : "#8669"
        ));
    }
}

class RectangleEnemy extends Enemy {
    static lifespan = 10000;
    static inactiveTime = 3000;
    static minSize = 100;
    static maxSize = 400;
    static randomCircleMultiplier = 0.05;
    static circleMinRadius = 4;
    static circleMaxRadius = 10;
    constructor(position) {
        super(RectangleEnemy.lifespan, RectangleEnemy.inactiveTime);
        this.position = position.copy();
        this.size = Vector.random(RectangleEnemy.maxSize-RectangleEnemy.minSize, RectangleEnemy.maxSize-RectangleEnemy.minSize).add(RectangleEnemy.minSize, RectangleEnemy.minSize);
    }

    draw() {
        strokeStyle("#f00");
        if (!this.active) {
            fillStyle("#8669");
            let width = this.size.x * this.life/this.inactiveTime;
            let height = this.size.y * this.life/this.inactiveTime;
            ctx.fillRect(this.position.x-width/2, this.position.y-height/2, width, height);
            ctx.strokeRect(this.position.x-this.size.x/2, this.position.y-this.size.y/2, this.size.x, this.size.y);
        } else {
            fillStyle("#f00");
            ctx.fillRect(this.position.x-this.size.x/2, this.position.y-this.size.y/2, this.size.x, this.size.y);
            fillStyle("#800");
            strokeStyle("#400");
        }
    }

    /**
     * 
     * @param {Vector} point 
     * @returns {float}
     */
    sqrDistanceToPoint(point) {
        let closestPoint = new Vector(clamp(point.x, this.position.x-this.size.x/2, this.position.x+this.size.x/2), clamp(point.y, this.position.y-this.size.y/2, this.position.y+this.size.y/2));
        return point.sqrDistanceTo(closestPoint);
    }

    spawnParticles() {
        // TOOD: complete
        if (!this.active) {
            fillStyle("#8669");
            let width = this.size.x * this.life/this.inactiveTime;
            let height = this.size.y * this.life/this.inactiveTime;
            PARTICLES.push(new Particle(
                randomPointInRectangle(this.position.x-width/2, this.position.y-height/2, width, height),
                Vector.fromPolar(randomRange(0, 2*PI), 0.1), 1000, 15, "#8669"
            ));
        } else {
            PARTICLES.push(new Particle(
                randomPointInRectangle(this.position.x-this.size.x/2, this.position.y-this.size.y/2, this.size.x, this.size.y),
                Vector.fromPolar(randomRange(0, 2*PI), 0.1), 1000, 15, "#f00"
            ));
        }
    }
}

class LineEnemy extends Enemy {
    static lifespan = 20000;
    static inactiveTime = 5000;
    static portionCovered = 0.6;
    constructor(position) {
        super(RectangleEnemy.lifespan, RectangleEnemy.inactiveTime);
        let value = randomRange(0, 2*CANVASWIDTH + 2*CANVASHEIGHT);
        this.a = new Vector();
        let invalidSide = -1;
        if (value < CANVASWIDTH) {
            this.a = new Vector(value, 0);
            invalidSide = 0;
        } else if (value < 2*CANVASWIDTH) {
            this.a = new Vector(value - CANVASWIDTH, CANVASHEIGHT);
            invalidSide = 1;
        } else if (value < 2*CANVASWIDTH + CANVASHEIGHT) {
            this.a = new Vector(0, value - 2*CANVASWIDTH);
            invalidSide = 2;
        } else {
            this.a = new Vector(CANVASWIDTH, value - (2*CANVASWIDTH + CANVASHEIGHT));
            invalidSide = 3;
        }
        let direction = this.a.to(position);
        let m = direction.y/direction.x;
        let c = this.a.y - m*this.a.x;
        let collisions = [
            new Vector(-c/m, 0),
            new Vector((CANVASHEIGHT-c)/m, CANVASHEIGHT),
            new Vector(0, c),
            new Vector(CANVASWIDTH, m*CANVASWIDTH + c)
        ];
        collisions.splice(invalidSide, 1);
        for (let i=collisions.length-1; i>=0; i--) {
            if (!Vector.inBounds(collisions[i], new Vector(0, 0), new Vector(CANVASWIDTH, CANVASHEIGHT))) {
                collisions.splice(i, 1);
            }
        }
        collisions.sort((a, b) => this.a.to(a).sqrLength() - this.a.to(b).sqrLength());
        this.b = collisions[0].copy();
        this.b = this.a.to(this.b).multiply(LineEnemy.portionCovered).add(this.a);
    }

    draw() {
        lineWidth(10);
        if (!this.active) {
            let offset = this.a.to(this.b).multiply(this.life/this.inactiveTime);
            strokeStyle("#5559");
            beginPath();
            moveTo(this.a);
            lineTo(this.b);
            stroke();
            strokeStyle("#8669");
            beginPath();
            moveTo(this.a);
            lineTo(Vector.add(this.a, offset));
            stroke();
        } else {
            strokeStyle("#f00");
            beginPath();
            moveTo(this.a);
            lineTo(this.b);
            stroke();
        }
    }

    /**
     * 
     * @param {Vector} point 
     * @returns {float}
     */
    sqrDistanceToPoint(point) {
        return pointLineDistance(this.a, this.b, point);
    }

    spawnParticles() {
        // TOOD: complete
        if (!this.active) {
            let b = Vector.add(this.a, this.a.to(this.b).multiply(this.life/this.inactiveTime));
            PARTICLES.push(new Particle(
                Vector.lerp(this.a, b, random()),
                this.a.to(this.b).normalise().rotate(random() < 0.5 ? -PI/2 : PI/2).multiply(0.1), 1000, 15, "#8669"
            ));
        } else {
            PARTICLES.push(new Particle(
                Vector.lerp(this.a, this.b, random()),
                this.a.to(this.b).normalise().rotate(random() < 0.5 ? -PI/2 : PI/2).multiply(0.1), 1000, 15, "#f00"
            ));
        }
    }
}

class ProjectileEnemy extends Enemy {
    static lifespanPerUnit = 13.9;
    static inactiveTime = 3000;
    static radius = 70;
    static randomCircleMultiplier = 0.05;
    static circleMinRadius = 4;
    static circleMaxRadius = 10;
    constructor(position) {
        super(ProjectileEnemy.lifespan, ProjectileEnemy.inactiveTime);
        let value = randomRange(0, 2*CANVASWIDTH + 2*CANVASHEIGHT);
        this.a = new Vector();
        let invalidSide = -1;
        if (value < CANVASWIDTH) {
            this.a = new Vector(value, 0);
            invalidSide = 0;
        } else if (value < 2*CANVASWIDTH) {
            this.a = new Vector(value - CANVASWIDTH, CANVASHEIGHT);
            invalidSide = 1;
        } else if (value < 2*CANVASWIDTH + CANVASHEIGHT) {
            this.a = new Vector(0, value - 2*CANVASWIDTH);
            invalidSide = 2;
        } else {
            this.a = new Vector(CANVASWIDTH, value - (2*CANVASWIDTH + CANVASHEIGHT));
            invalidSide = 3;
        }
        let direction = this.a.to(position);
        let m = direction.y/direction.x;
        let c = this.a.y - m*this.a.x;
        let collisions = [
            new Vector(-c/m, 0),
            new Vector((CANVASHEIGHT-c)/m, CANVASHEIGHT),
            new Vector(0, c),
            new Vector(CANVASWIDTH, m*CANVASWIDTH + c)
        ];
        collisions.splice(invalidSide, 1);
        for (let i=collisions.length-1; i>=0; i--) {
            if (!Vector.inBounds(collisions[i], new Vector(0, 0), new Vector(CANVASWIDTH, CANVASHEIGHT))) {
                collisions.splice(i, 1);
            }
        }
        collisions.sort((a, b) => this.a.to(a).sqrLength() - this.a.to(b).sqrLength());
        this.b = collisions[0].copy();
        this.lifespan = ProjectileEnemy.inactiveTime + ProjectileEnemy.lifespanPerUnit*this.a.to(this.b).length();
    }

    currentPosition = (t) => {
        return this.a.to(this.b).multiply(t ? t : (this.life-this.inactiveTime)/(this.lifespan-this.inactiveTime)).add(this.a);
    }

    draw() {
        let position = this.currentPosition(this.active ? null : this.life/this.inactiveTime);
        if (!this.active) {
            strokeStyle("#8669");
            fillStyle("#8669");
            beginPath();
            moveTo(this.a);
            lineTo(position);
            stroke();
            circle(position, ProjectileEnemy.radius);
        } else {
            fillStyle("#f00");
            circle(position, ProjectileEnemy.radius);
            strokeStyle("#f00");
            lineWidth(5);
            let theta = this.a.to(this.b).theta()/(2*PI);
            circle(position, ProjectileEnemy.radius*1.4, theta-0.2, theta+0.2, false, false, true);
            fillStyle("#800");
            strokeStyle("#400");
            for (let i in this.circlePositions) {
                circle(Vector.add(position, this.circlePositions[i]), this.circleRadii[i]);
            }
        }
    }

    /**
     * 
     * @param {Vector} point 
     * @returns {float}
     */
    sqrDistanceToPoint(point) {
        return max(point.sqrDistanceTo(this.currentPosition(null)) - ProjectileEnemy.radius*ProjectileEnemy.radius, 0);
    }

    spawnParticles() {
        // TOOD: complete
        let particleDirection = this.b.to(this.a).normalise().multiply(0.1);
        let position = particleDirection.copy().rotate(random() < 0.5 ? PI/2 : -PI/2).normalise();
        position.subtract(Vector.multiply(position, 0.5));
        position.multiply(ProjectileEnemy.radius*2*random());
        position.add(this.currentPosition(this.active ? null : this.life/this.inactiveTime));
        PARTICLES.push(
            new Particle(
                position, particleDirection, 1000, 15, this.active ? "#f00" : "#8669"
            )
        );
    }
}

class ArcEnemy extends Enemy {
    static lifespan = 10000;
    static inactiveTime = 3000;
    static minRadius = 150;
    static maxRadius = 600;
    static minAngle = 20 * PI/180;
    static maxAngle = 90 * PI/180;
    static randomCircleMultiplier = 0.05;
    static circleMinRadius = 4;
    static circleMaxRadius = 10;
    constructor(position) {
        super(ArcEnemy.lifespan, ArcEnemy.inactiveTime);
        this.position = position.copy();
        this.radius = randomRange(ArcEnemy.minRadius, ArcEnemy.maxRadius);
        this.angle = randomRange(ArcEnemy.minAngle, ArcEnemy.maxAngle);
        this.angleOffset = randomRange(0, 2*PI);
    }

    draw() {
        strokeStyle("#f00");
        fillStyle(this.active ? "#f00" : "#8669");
        if (!this.active) {
            beginPath();
            moveTo(this.position);
            let angle = this.life/this.inactiveTime * this.angle/2;
            ctx.arc(this.position.x, this.position.y, this.radius, this.angleOffset-angle, this.angleOffset+angle);
            lineTo(this.position);
            fill();
        } else {
            beginPath();
            moveTo(this.position);
            ctx.arc(this.position.x, this.position.y, this.radius, this.angleOffset-this.angle/2, this.angleOffset+this.angle/2);
            lineTo(this.position);
            fill();
        }
        beginPath();
        moveTo(this.position);
        ctx.arc(this.position.x, this.position.y, this.radius, this.angleOffset-this.angle/2, this.angleOffset+this.angle/2);
        lineTo(this.position);
        stroke();
    }

    get points() {
        return [
            Vector.fromPolar(this.angleOffset + this.angle/2, this.radius).add(this.position),
            Vector.fromPolar(this.angleOffset - this.angle/2, this.radius).add(this.position)
        ]
    }

    sqrDistanceToPoint(point) {
        // return Infinity;
        if (abs(shortestAngleDist(this.position.to(point).theta(), this.angleOffset)) < this.angle/2) {
            let l = max(this.position.to(point).length()-this.radius, 0);
            return l*l;
        }
        return min(
            pointLineDistance(this.position, Vector.fromPolar(this.angleOffset + this.angle/2, this.radius).add(this.position), point),
            pointLineDistance(this.position, Vector.fromPolar(this.angleOffset - this.angle/2, this.radius).add(this.position), point)
        );
    }

    spawnParticles() {
        let position = random();
        let points = this.points;
        let particlePosition = null;
        if (position < 1/3) {
            particlePosition = this.position.to(points[0]).multiply(position*3).add(this.position);
        } else if (position < 2/3) {
            particlePosition = this.position.to(points[1]).multiply(position*3 - 1).add(this.position);
        } else {
            particlePosition = Vector.fromPolar(randomRange(this.angleOffset-this.angle/2, this.angleOffset+this.angle/2), this.radius).add(this.position);
        }
        PARTICLES.push(new Particle(
            particlePosition, Vector.fromPolar(randomRange(0, 2*PI), 0.1), 1000, 15, this.active ? "#f00" : "#8669"
        ));
    }
}

class ShurikenEnemy extends Enemy {
    static lifespan = 2500;
    static inactiveTime = 1000;
    static minSize = 50;
    static maxSize = 200;
    constructor(position) {
        super(ShurikenEnemy.lifespan, ShurikenEnemy.inactiveTime);
        this.y = position.y;
        this.size = randomRange(ShurikenEnemy.minSize, ShurikenEnemy.maxSize);
    }

    position(t) {
        return new Vector(t*CANVASWIDTH, this.y);
    }

    rotation(t) {
        return t*2*PI + 0.0001;
    }

    draw() {
        let t;
        if (!this.active) {
            strokeStyle("#8669");
            t = this.life/this.inactiveTime;
        } else {
            strokeStyle("#f00");
            t = (this.life-this.inactiveTime)/(this.lifespan-this.inactiveTime);
        }
        let p = this.position(t);
        let r = this.rotation(t);
        beginPath();
        let offset = Vector.fromPolar(r, this.size);
        moveTo(Vector.add(p, offset));
        lineTo(Vector.subtract(p, offset));
        offset.rotate(PI/2);
        moveTo(Vector.add(p, offset));
        lineTo(Vector.subtract(p, offset));
        stroke();
    }

    sqrDistanceToPoint(point) {
        let t = (this.life-this.inactiveTime)/(this.lifespan-this.inactiveTime);
        let centre = this.position(t);
        let offset = Vector.fromPolar(this.rotation(t), this.size);
        let distance = pointLineDistance(Vector.add(centre, offset), Vector.subtract(centre, offset), point);
        offset.rotate(PI/2);
        distance = min(distance, pointLineDistance(Vector.add(centre, offset), Vector.subtract(centre, offset), point));
        return distance;
    }

    spawnParticles() {
        let t = this.active ? (this.life-this.inactiveTime)/(this.lifespan-this.inactiveTime) : this.life/this.inactiveTime;
        let offset = Vector.fromPolar(this.rotation(t), this.size).rotate(random() < 0.5 ? 0 : PI/2).multiply(random() < 0.5 ? -1 : 1);
        PARTICLES.push(new Particle(this.position(t).add(offset.multiply(random())), Vector.fromPolar(random()*2*PI, 0.1), 1000, 15, this.active ? "#f00" : "#8669"));
    }
}

class OrbitEnemy extends Enemy {
    static lifespan = 3000;
    static inactiveTime = 1000;
    static minRadius = 100;
    static maxRadius = 200;
    static pointRadius = 20;
    constructor(position) {
        super(OrbitEnemy.lifespan, OrbitEnemy.inactiveTime);
        this.position = position.copy();
        this.radius = randomRange(OrbitEnemy.minRadius, OrbitEnemy.maxRadius);
    }

    centres() {
        let c = [];
        for (let i=0; i<4; i++) {
            c.push(Vector.fromPolar(i*PI/2 + this.t*PI*2, this.radius).add(this.position));
        }
        return c;
    }

    draw() {
        // let t = this.t;
        let c = this.centres();
        fillStyle(this.active ? "#f00" : "#8669");
        for (let centre of c) circle(centre, OrbitEnemy.pointRadius, 0, 1, false, true, false);
    }

    sqrDistanceToPoint(point) {
        return this.centres().map(x => {
            let l = max(x.to(point).length()-OrbitEnemy.pointRadius, 0);
            return l*l;
        }).reduce((acc, val) => min(acc, val), Infinity);
    }

    spawnParticles() {

    }
}

const ALL_ENEMY_TYPES = [
    CircleEnemy,
    RectangleEnemy,
    LineEnemy,
    ProjectileEnemy,
    ArcEnemy,
    ShurikenEnemy,
    OrbitEnemy,
];
const ENEMY_TYPE_INDECES = [
    [1, 4, 6],
    [0, 2, 5],
    [0, 3, 4],
    [1, 5, 6],
    [0, 2, 3],
    [4, 5, 6],
    [1, 2, 3],
    [0, 4, 6],
    [0, 1, 3],
    [2, 4, 6],
    [1, 4, 5],
    [1, 3, 6],
    [2, 4, 5],
    [0, 3, 6],
    [3, 5, 6],
    [2, 3, 4],
    [3, 4, 6],
    [0, 5, 6],
    [0, 2, 6],
    [0, 1, 2],
    [0, 2, 4],
    [1, 3, 5],
    [2, 5, 6],
    [1, 3, 4],
    [2, 3, 6],
    [0, 4, 5],
    [1, 2, 6],
    [0, 3, 5],
    [3, 4, 5],
    [1, 2, 4],
    [0, 1, 6],
    [0, 1, 5],
    [0, 1, 4],
    [1, 2, 5],
    [2, 3, 5],
]
let ENEMY_TYPES = [];
// const ENEMY_TYPES = [OrbitEnemy];