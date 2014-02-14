// =========================================================================
//
// Physics2D Circle
//
// CIRCLE DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*CIRCLE_RADIUS*/6    // Radius of circle about its origin
///*CIRCLE_LOCAL*/7     // Local position of circle origin (x, y)
///*CIRCLE_WORLD*/9     // World position of circle origin (x, y)
//
///*CIRCLE_DATA_SIZE*/11
define(
	'spell/physics/2D/Circle',
	[
		'spell/physics/2D/Shape',
		'spell/shared/util/platform/Types'
	],
	function(
		Physics2DShape,
	    Types
	) {
		var __extends = function (d, b) {
			for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
			function __() { this.constructor = d; }
			__.prototype = b.prototype;
			d.prototype = new __();
		};

		var Physics2DCircle = function() {
			Physics2DShape.call(this);
			this.type = "CIRCLE";
		}

		__extends(Physics2DCircle, Physics2DShape);

		// ==============================================================
		Physics2DCircle.prototype.computeArea = function () {
			var r = this._data[(/*CIRCLE_RADIUS*/ 6)];
			return (Math.PI * r * r);
		};

		Physics2DCircle.prototype.computeMasslessInertia = function () {
			var data = this._data;
			var r = this._data[(/*CIRCLE_RADIUS*/ 6)];
			var x = data[(/*CIRCLE_LOCAL*/ 7)];
			var y = data[(/*CIRCLE_LOCAL*/ 7) + 1];
			return ((0.5 * r * r) + ((x * x) + (y * y)));
		};

		// ==============================================================
		Physics2DCircle.prototype.getRadius = function () {
			return this._data[(/*CIRCLE_RADIUS*/ 6)];
		};

		Physics2DCircle.prototype.setRadius = function (radius) {
			var body = this.body;
			if (body && body.world && (body._type === (/*TYPE_STATIC*/ 2) || body.world._midStep)) {
				return;
			}

			var data = this._data;
			if (radius !== data[(/*CIRCLE_RADIUS*/ 6)]) {
				data[(/*CIRCLE_RADIUS*/ 6)] = radius;
				this._validate();
				if (body) {
					body._invalidate();
				}
			}
		};

		// ==============================================================
		Physics2DCircle.prototype.getOrigin = function (dst /*v2*/ ) {
			if (dst === undefined) {
				dst = new Types.createFloatArray(2);
			}
			var data = this._data;
			dst[0] = data[(/*CIRCLE_LOCAL*/ 7)];
			dst[1] = data[(/*CIRCLE_LOCAL*/ 7) + 1];
			return dst;
		};

		Physics2DCircle.prototype.setOrigin = function (origin /*v2*/ ) {
			var body = this.body;
			if (body && body.world && (body._type === (/*TYPE_STATIC*/ 2) || body.world._midStep)) {
				return;
			}

			var data = this._data;
			var originX = origin[0];
			var originY = origin[1];

			if (data[(/*CIRCLE_LOCAL*/ 7)] !== originX || data[(/*CIRCLE_LOCAL*/ 7) + 1] !== originY) {
				data[(/*CIRCLE_LOCAL*/ 7)] = originX;
				data[(/*CIRCLE_LOCAL*/ 7) + 1] = originY;
				this._validate();
				if (body) {
					body._invalidate();
				}
			}
		};

		// ==============================================================
		Physics2DCircle.prototype.clone = function () {
			var c = new Physics2DCircle();
			Physics2DShape.prototype.copyCommon(this, c);
			return c;
		};

		// ==============================================================
		Physics2DCircle.prototype.scale = function (scale) {
			if (scale <= 0) {
				return;
			}

			var body = this.body;
			if (body && body.world && (body._type === (/*TYPE_STATIC*/ 2) || body.world._midStep)) {
				return;
			}

			var data = this._data;
			data[(/*CIRCLE_LOCAL*/ 7)] *= scale;
			data[(/*CIRCLE_LOCAL*/ 7) + 1] *= scale;
			data[(/*CIRCLE_RADIUS*/ 6)] *= scale;

			this._validate();
			if (body) {
				body._invalidate();
			}
		};

		Physics2DCircle.prototype.translate = function (translation /*v2*/ , skip) {
			var body = this.body;
			if (!skip && body && body.world && (body._type === (/*TYPE_STATIC*/ 2) || body.world._midStep)) {
				return;
			}

			var data = this._data;
			data[(/*CIRCLE_LOCAL*/ 7)] += translation[0];
			data[(/*CIRCLE_LOCAL*/ 7) + 1] += translation[1];

			this._validate();
			if (!skip && body) {
				body._invalidate();
			}
		};

		Physics2DCircle.prototype.rotate = function (rotation) {
			var body = this.body;
			if (body && body.world && (body._type === (/*TYPE_STATIC*/ 2) || body.world._midStep)) {
				return;
			}

			var cos = Math.cos(rotation);
			var sin = Math.sin(rotation);
			var data = this._data;
			var x = data[(/*CIRCLE_LOCAL*/ 7)];
			var y = data[(/*CIRCLE_LOCAL*/ 7) + 1];
			data[(/*CIRCLE_LOCAL*/ 7)] = ((cos * x) - (sin * y));
			data[(/*CIRCLE_LOCAL*/ 7) + 1] = ((sin * x) + (cos * y));

			this._validate();
			if (body) {
				body._invalidate();
			}
		};

		Physics2DCircle.prototype.transform = function (matrix /*m23*/ ) {
			var body = this.body;
			if (body && body.world && (body._type === (/*TYPE_STATIC*/ 2) || body.world._midStep)) {
				return;
			}

			// a b tx
			// c d ty
			var a = matrix[0];
			var b = matrix[2];
			var c = matrix[1];
			var d = matrix[3];

			var data = this._data;
			var det = ((a * d) - (b * c));
			if (det <= 0) {
				return;
			}

			data[(/*CIRCLE_RADIUS*/ 6)] *= Math.sqrt(det);

			var x = data[(/*CIRCLE_LOCAL*/ 7)];
			var y = data[(/*CIRCLE_LOCAL*/ 7) + 1];
			data[(/*CIRCLE_LOCAL*/ 7)] = ((a * x) + (b * y) + matrix[4]);
			data[(/*CIRCLE_LOCAL*/ 7) + 1] = ((c * x) + (d * y) + matrix[5]);

			this._validate();
			if (body) {
				body._invalidate();
			}
		};

		// ==============================================================
		Physics2DCircle.prototype._update = function (posX, posY, cos, sin, skipAABB) {
			var data = this._data;
			var originX = data[(/*CIRCLE_LOCAL*/ 7)];
			var originY = data[(/*CIRCLE_LOCAL*/ 7) + 1];
			var ox = data[(/*CIRCLE_WORLD*/ 9)] = posX + (cos * originX) - (sin * originY);
			var oy = data[(/*CIRCLE_WORLD*/ 9) + 1] = posY + (sin * originX) + (cos * originY);

			if (!skipAABB) {
				var radius = data[(/*CIRCLE_RADIUS*/ 6)];
				data[(/*SHAPE_AABB*/ 0)] = (ox - radius);
				data[(/*SHAPE_AABB*/ 0) + 1] = (oy - radius);
				data[(/*SHAPE_AABB*/ 0) + 2] = (ox + radius);
				data[(/*SHAPE_AABB*/ 0) + 3] = (oy + radius);
			}
		};

		Physics2DCircle.prototype._validate = function () {
			var data = this._data;
			var originX = data[(/*CIRCLE_LOCAL*/ 7)];
			var originY = data[(/*CIRCLE_LOCAL*/ 7) + 1];
			var radius = data[(/*CIRCLE_RADIUS*/ 6)];

			var olength = Math.sqrt((originX * originX) + (originY * originY));
			data[(/*SHAPE_SWEEP_RADIUS*/ 4)] = (radius + olength);
			data[(/*SHAPE_SWEEP_FACTOR*/ 5)] = (data[(/*SHAPE_SWEEP_RADIUS*/ 4)] - Math.max(radius - olength, 0));
		};

		Physics2DCircle.prototype.computeCenterOfMass = function (dst /*v2*/ ) {
			return this.getOrigin(dst);
		};

		// params = {
		//      radius: ##,
		//      origin: [##, ##] = [0, 0],
		//      ... common shape props.
		// }
		Physics2DCircle.create = function (params) {
			var c = new Physics2DCircle();
			c._type = (/*TYPE_CIRCLE*/ 0);
			Physics2DShape.prototype.init(c, params);

			var radius = params.radius;
			var originX = (params.origin ? params.origin[0] : 0);
			var originY = (params.origin ? params.origin[1] : 0);

			var data = c._data = Types.createFloatArray((/*CIRCLE_DATA_SIZE*/ 11));
			data[(/*CIRCLE_RADIUS*/ 6)] = radius;
			data[(/*CIRCLE_LOCAL*/ 7)] = originX;
			data[(/*CIRCLE_LOCAL*/ 7) + 1] = originY;
			c._validate();

			return c;
		};
		Physics2DCircle.version = 1;

		return Physics2DCircle;

});