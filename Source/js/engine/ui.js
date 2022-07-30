const UI_COLLIDERS = {};
const UI_RENDERERS = {};

(() => {
	class RectangleCollider {
		/**
		 * 
		 * @param {Button} parent 
		 * @param {Number} width 
		 * @param {Number} height 
		 */
		constructor(parent, width, height) {
			this.parent = parent;
			this.size = new Vector(width, height);
		}
	
		/**
		 * 
		 * @param {Vector} position the point to test
		 * @returns {boolean} if the point is over this collider
		 */
		intersects(position) {
			let pos = this.parent.globalPosition;
			return inRange(position.x, pos.x, pos.x+this.size.x) && inRange(position.y, pos.y, pos.y+this.size.y);
		}
	}
	
	class CircleCollider {
		/**
		 * 
		 * @param {Button} parent 
		 * @param {Number} radius 
		 */
		constructor(parent, radius) {
			this.parent = parent;
			this.radius = radius;
		}
	
		/**
		 * 
		 * @param {Vector} position the point to test
		 * @returns {boolean} if the point is over this collider
		 */
		intersects(position) {
			return position.to(this.parent.globalPosition).sqrLength() < this.radius*this.radius;
		}
	}
	
	class RectangleRenderer {
		/**
		 * 
		 * @param {Button} parent 
		 * @param {Number} width 
		 * @param {Number} height 
		 * @param {String} bgcolour 
		 * @param {String} text 
		 * @param {String} txtcolour 
		 * @param {String} font 
		 */
		constructor(parent, width, height, bgcolour, hoverbg, text, txtcolour, font) {
			this.parent = parent;
			this.width = width;
			this.height = height;
			this.bgcolour = bgcolour;
			this.hoverbg = hoverbg;
			this.text = text;
			this.txtcolour = txtcolour;
			this.font = font;
		}
	
		render() {
			let position = this.parent.globalPosition;
			fillStyle(this.bgcolour);
			fillRect(position.x, position.y, this.width, this.height);
			if (this.parent.hover) {
				fillStyle(this.hoverbg);
				fillRect(position.x, position.y, this.width, this.height);
			}
			fillStyle(this.txtcolour);
			font(this.font);
			let textDetails = ctx.measureText(this.text);
			fillText(this.text, position.x-textDetails.width/2 + this.width/2, position.y+(textDetails.actualBoundingBoxAscent+textDetails.actualBoundingBoxDescent)/2 + this.height/2);
		}
	}
	
	class CircleRenderer {
		/**
		 * 
		 * @param {Button} parent 
		 * @param {Number} radius 
		 * @param {String} bgcolour 
		 * @param {String} hoverbg
		 * @param {String} text 
		 * @param {String} txtcolour 
		 * @param {String} font 
		 */
		constructor(parent, radius, bgcolour, hoverbg, text, txtcolour, font) {
			this.parent = parent;
			this.radius = radius;
			this.bgcolour = bgcolour;
			this.hoverbg = hoverbg;
			this.text = text;
			this.txtcolour = txtcolour;
			this.font = font;
		}
	
		render() {
			let position = this.parent.globalPosition;
			fillStyle(this.bgcolour);
			// beginPath();
			// arc(position.x, position.y, this.radius, 0, 2*PI);
			circle(position, this.radius);
			fill();
			if (this.parent.hover) {
				fillStyle(this.hoverbg);
				// beginPath();
				// arc(position.x, position.y, this.radius, 0, 2*PI);
				// fill();
				circle(position, this.radius);
			}
			fillStyle(this.txtcolour);
			font(this.font);
			let textDetails = ctx.measureText(this.text);
			fillText(this.text, position.x-textDetails.width/2, position.y+(textDetails.actualBoundingBoxAscent+textDetails.actualBoundingBoxDescent)/2);
		}
	}

	UI_COLLIDERS.RectangleCollider = RectangleCollider;
	UI_COLLIDERS.CircleCollider = CircleCollider;
	UI_RENDERERS.RectangleRenderer = RectangleRenderer;
	UI_RENDERERS.CircleRenderer = CircleRenderer;
	Object.freeze(UI_RENDERERS);
})();

/**
 * @typedef {UI_COLLIDERS.RectangleCollider|UI_COLLIDERS.CircleCollider} Collider
 */

class Button {
	/**
	 * 
	 * @param {Menu?} parent 
	 * @param {Vector} position 
	 * @param {Collider} collider
	 * @param {Renderer} renderer
	 * @param {Function[]} callbacks 
	 * @param {Collider} collider
	 */
	constructor(parent, position, collider, renderer, callbacks) {
		this.collider = collider;
		this.renderer = renderer;
		this.collider.parent = this;
		this.renderer.parent = this;
		this.callbacks = callbacks;
		this.position = position.copy();
		this.parent = parent; // a menu
		if (this.parent) this.parent.addButton(this);
	}

	get hover() {
		return this.collider.intersects(Mouse.position);
	}

	get globalPosition() {
		return Vector.add(this.parent.globalPosition, this.position);
	}

	click() {
		for (let callback of this.callbacks) {
			callback.bind(this, this)();
		}
	}

	draw() {
		this.renderer.render();
	}
}

class Menu {
	/**
	 * 
	 * @param {Vector} position 
	 * @param {Menu?} parent 
	 */
	constructor(position, parent) {
		this.position = position.copy();
		// NOTE: add dragging stuff to menu, not button
		this.parent = parent; // Menu or null
		if (this.parent) this.parent.addMenu(this);
		/**
		 * @type {Button[]}
		 */
		this.buttons = [];
		/**
		 * @type {Menu[]}
		 */
		this.menus = [];
	}

	get hover() {
		return this.collider.intersects(Mouse.position);
	}

	get globalPosition() {
		return this.parent == null ? this.position.copy() : Vector.add(this.parent.globalPosition, this.position);
	}

	/**
	 * 
	 * @param {Button} btn 
	 */
	addButton(btn) {
		if (!this.buttons.includes(btn)) this.buttons.push(btn);
		btn.parent = this;
	}

	/**
	 * 
	 * @param {Menu} menu 
	 */
	addMenu(menu) {
		if (!this.menus.includes(menu)) this.menus.push(menu);
		menu.parent = this;
	}

	update() {
		for (let button of this.buttons) {
			if (button.hover) button.click();
		}
		for (let menu of this.menus) menu.update();
	}

	draw() {
		// this.renderer.render();
		for (let menu of this.menus) {
			menu.draw();
		}
		for (let button of this.buttons) {
			button.draw();
		}
	}
}
/**
 * 
 * @param {Menu?} parent 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} width 
 * @param {Number} height 
 * @param {String} bgcolour 
 * @param {String} hoverbg
 * @param {String} text 
 * @param {String} txtcolour 
 * @param {String} font 
 * @param {Function[]} callbacks 
 * @returns {Button} a button with a `UI_COLLIDERS.RectangleCollider` and `UI_RENDERERS.RectangleRenderer`
 */
const RectangleButton = (parent, x, y, width, height, bgcolour, hoverbg, text, txtcolour, font, callbacks) => {
	return new Button(
		parent, new Vector(x, y),
		new UI_COLLIDERS.RectangleCollider(null, width, height),
		new UI_RENDERERS.RectangleRenderer(null, width, height, bgcolour, hoverbg, text, txtcolour, font),
		callbacks
	);
}

/**
 * 
 * @param {Menu?} parent 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} radius 
 * @param {String} bgcolour 
 * @param {String} hoverbg 
 * @param {String} text 
 * @param {String} txtcolour 
 * @param {String} font 
 * @param {Function[]} callbacks 
 * @returns {Button} a button with a `UI_COLLIDERS.CircleCollider` and a `UI_RENDERERS.CircleRenderer`
 */
const CircleButton = (parent, x, y, radius, bgcolour, hoverbg, text, txtcolour, font, callbacks) => {
	return new Button(
		parent, new Vector(x, y),
		new UI_COLLIDERS.CircleCollider(null, radius),
		new UI_RENDERERS.CircleRenderer(null, radius, bgcolour, hoverbg, text, txtcolour, font),
		callbacks
	);
}
