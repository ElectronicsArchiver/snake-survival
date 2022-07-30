class Vector {
    /**
     * 
     * @param {Number} x defaults to 0
     * @param {Number} y defaults to 0
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * shorthand for `Vector.subtract(other, this)`
     * @param {Vector} other 
     * @returns {Vector} a vector pointing from `this` to `other`
     */
    to(other) {
        return Vector.subtract(other, this);
    }

    /**
     * 
     * @returns {Vector} a copy of `this` with the same `x` and `y`
     */
    copy() {
        return new Vector(this.x, this.y);
    }

    /**
     * 
     * @returns {Number} the magnitude of this vector
     */
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    /**
     * the angle is measured counter-clockwise from the x-axis to this vector
     * @returns {Number} the direction of this vector
     */
    theta() {
        return Math.atan2(this.y, this.x);
    }

    /**
     * slightly faster than `length()` as it doesn't require a `sqrt()`
     * @returns {Number} the magnitude of this vector, squared
     */
    sqrLength() {
        return this.x*this.x + this.y*this.y;
    }

    /**
     * sets the x and y coordinates of this vector
     * @param {Number} x defaults to 0
     * @param {Number} y defaults to 0
     * @returns {Vector} `this`
     */
    setCartesian(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * sets the x and y coordinates of this vector based on the provided polar coordinates
     * @param {Number} theta defaults to 0, angle between x-axis and the desired vector
     * @param {Number} length the magnitude of this desired vector
     * @returns {Vector} `this`
     */
    setPolar(theta = 0, length = 0) {
        /*this.theta = theta;
        this.length = length;*/
        this.x = cos(theta)*length;
        this.y = sin(theta)*length;
        return this;
    }

    /**
     * 
     * @param {Number|Vector?} x (defaults to 0) the increase in the x-value (or the vector to add to this vector)
     * @param {Number?} y (defaults to 0, only necessary if `x` is not a `Vector`) the increaes in y-value
     * @returns {Vector} `this`
     */
    add(x = 0, y = 0) {
        if (x instanceof Vector) {
            this.x += x.x;
            this.y += x.y;
            // this.calculatePolar();
            return this;
        }
        this.x += x;
        this.y += y;
        // this.calculatePolar();
        return this;
    }
	
    /**
     * 
     * @param {Number|Vector?} x (defaults to 0) the decrease in the x-value (or the vector to add to this vector)
     * @param {Number?} y (defaults to 0, only necessary if `x` is not a `Vector`) the decrease in y-value
     * @returns {Vector} `this`
     */
    subtract(x = 0, y = 0) {
        if (x instanceof Vector) {
            this.x -= x.x;
            this.y -= x.y;
            // this.calculatePolar();
            return this;
        }
        this.x -= x;
        this.y -= y;
        // this.calculatePolar();
        return this;
    }

    /**
     * 
     * @param {Number} theta the angle to rotate by
     * @returns {Vector} `this`
     */
    rotate(theta = 0) {
        // this.theta += theta;
        this.setPolar(this.theta() + theta, this.length());
        return this;
    }

    /**
     * 
     * @param {Number} length the increase in length
     * @returns {Vector} `this`
     */
    extend(length = 0) {
        this.setPolar(this.theta(), this.length() + length);
        return this;
    }

    /**
     * 
     * @param {Number} value the scalar to multiply this vector by
     * @returns {Vector} `this`
     */
    multiply(value = 1) {
        this.x *= value;
        this.y *= value;
        return this;
    }

    /**
     * normalises this vector to have a length of 1
     * @returns {Vector} `this`
     */
    normalise() {
        let l = this.length();
        this.x /= l;
        this.y /= l;
        return this;
    }

    /**
     * shorthand for `Vector.subtract(this, other).length()`
     * @param {Vector} other 
     * @returns {Number} the distance between `this` and `other`
     */
    distanceTo(other) {
        return Vector.subtract(this, other).length();
    }

    /**
     * shorthand for `Vector.subtract(this, other).sqrLength()`
     * @param {Vector} other 
     * @returns {Number} the distance between `this` and `other`, squared
     */
    sqrDistanceTo(other) {
        return Vector.subtract(this, other).sqrLength();
    }

    /**
     * 
     * @param {Vector} vector1 
     * @param {Vector} vector2 
     * @returns {Vector} the dot product between two vectors
     */
    static dot(vector1, vector2) {
        return vector1.x * vector2.x + vector1.y * vector2.y;
    }

    /**
     * 
     * @param {Vector} vector 
     * @returns {Vector} a vector with the same direction as `vector` but with a magnitude of 1
     */
    static normalised(vector) { // yes that's how it's spelt. Deal with it.
        return Vector.fromPolar(vector.theta(), 1);
    }

    /**
     * 
     * @param {Vector} vector1 
     * @param {Vector} vector2 
     * @returns {Vector} `vector1 + vector2`
     */
    static add(vector1, vector2) {
        return new Vector(vector1.x + vector2.x, vector1.y + vector2.y);
    }

    /**
     * 
     * @param {Vector} vector1 
     * @param {Vector} vector2 
     * @returns {Vector} `vector1 - vector2`
     */
    static subtract(vector1, vector2) {
        return new Vector(vector1.x - vector2.x, vector1.y - vector2.y);
    }

    /**
     * 
     * @param {Vector} vector 
     * @param {Number} scalar 
     * @returns {Vector} `vector * scalar`
     */
    static multiply(vector, scalar) {
        return new Vector(vector.x * scalar, vector.y * scalar);
    } // to divide, give 1/scalar

    /**
     * 
     * @param {Number} theta 
     * @param {Number} length 
     * @returns {Vector} with the given direction `theta` and magnitude `length`
     */
    static fromPolar(theta, length) {
        let angle = Math.abs(theta) >= Math.PI ? (2 * Math.PI) - (theta * -1) : theta;
        return new Vector(Math.cos(angle) * length, Math.sin(angle) * length);
    }

    /**
     * 
     * @param {Vector} vector the vector to copy
     * @returns {Vector} a copy of `vector`
     */
    static copy(vector) {
        return new Vector(vector.x, vector.y);
    }

    /**
     * 
     * @param {Vector} start 
     * @param {Vector} projection doesn't need to be normalised
     * @returns {Vector} `start` projected onto a line defined by `projection`
     */
    static project(start, projection) {
        return Vector.multiply(projection, Vector.dot(start, projection)/Vector.dot(projection, projection));
    }

    /**
     * 
     * @param {Number} maxX 
     * @param {Number} maxY 
     * @returns {Vector} a random vector with an x value in `[0 - maxX]` and a y value in `[0 - maxY]`
     */
    static random(maxX, maxY) {
        return new Vector(Math.random()*maxX, Math.random()*maxY);
    }

    /**
     * 
     * @param {Vector} a 
     * @param {Vector} b 
     * @param {Number} t normalised in `[0 - 1]` inclusive
     * @returns {Vector} linearly interpolates between `a` and `b` based on `t`
     */
    static lerp(a, b, t) {
        return Vector.subtract(b, a).multiply(t).add(a);
    }

    static inBounds(v, minBound, maxBound) {
        return inRange(v.x, minBound.x, maxBound.x) && inRange(v.y, minBound.y, maxBound.y);
    }

    static inBoundsUnordered(v, bound1, bound2) {
        return inRangeUnordered(v.x, bound1.x, bound2.x) && inRangeUnordered(v.y, bound1.y, bound2.y);
    }
}
