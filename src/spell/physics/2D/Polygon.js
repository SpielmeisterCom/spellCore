// =========================================================================
//
// Physics2D Polygon
//
// POLYGON DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*POLY_VERTICES*/6   // Start of vertex data
///*POLY_STRIDE*/13    // Values per vertex till end of object.
//
// PER VERTEX CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*POLY_LOCAL*/0     // Local position of vertex (x, y)
///*POLY_WORLD*/2     // World position of vertex (x, y)
///*POLY_LNORMAL*/4   // Local normal of edge starting at vertex (x, y)
///*POLY_WNORMAL*/6   // World normal of edge starting at vertex (x, y)
///*POLY_LPROJ*/8     // Local projection of polygon to edge.
///*POLY_WPROJ*/9      // World projection of polygon to edge.
///*POLY_CROSS1*/10    // World cross-projection of vertex to its edge.
///*POLY_CROSS2*/11   // World cross-projection of 'next' vertex to this edge.
///*POLY_LENGTH*/12   // Length of edge startinga t this vertex.
define(
	'spell/physics/2D/Polygon',
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

		var Physics2DPolygon = function Physics2DPolygon() {
			Physics2DShape.call(this);
			this.type = "POLYGON";
		}

		__extends(Physics2DPolygon, Physics2DShape);

		Physics2DPolygon.prototype.computeArea = function () {
			var data = this._data;
			var index = (/*POLY_VERTICES*/ 6);
			var limit = data.length;
			var doubleArea = 0;
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				var next = index + (/*POLY_STRIDE*/ 13);
				if (next === limit) {
					next = (/*POLY_VERTICES*/ 6);
				}

				doubleArea += ((data[index + (/*POLY_LOCAL*/ 0)] * data[next + (/*POLY_LOCAL*/ 0) + 1]) - (data[index + (/*POLY_LOCAL*/ 0) + 1] * data[next + (/*POLY_LOCAL*/ 0)]));
			}
			return (doubleArea * 0.5);
		};

		Physics2DPolygon.prototype.computeMasslessInertia = function () {
			var data = this._data;
			var index = (/*POLY_VERTICES*/ 6);
			var limit = data.length;
			var s1 = 0;
			var s2 = 0;
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				var next = index + (/*POLY_STRIDE*/ 13);
				if (next === limit) {
					next = (/*POLY_VERTICES*/ 6);
				}

				var x1 = data[index + (/*POLY_LOCAL*/ 0)];
				var y1 = data[index + (/*POLY_LOCAL*/ 0) + 1];
				var x2 = data[next + (/*POLY_LOCAL*/ 0)];
				var y2 = data[next + (/*POLY_LOCAL*/ 0) + 1];

				var a = (x1 * y2) - (x2 * y1);
				var b = ((x1 * x1) + (y1 * y1)) + ((x2 * x2) + (y2 * y2)) + ((x1 * x2) + (y1 * y2));

				s1 += (a * b);
				s2 += a;
			}

			return (s1 / (6 * s2));
		};

		// Workaround for TS lack of support for abstract methods
		Physics2DPolygon.prototype.computeCenterOfMass = function (dst /*v2*/ ) {
			if (dst === undefined) {
				dst = Types.createFloatArray(2);
			}

			var data = this._data;
			var index = (/*POLY_VERTICES*/ 6);
			var limit = data.length;
			var doubleArea = 0;
			var cx = 0;
			var cy = 0;
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				var next = index + (/*POLY_STRIDE*/ 13);
				if (next === limit) {
					next = (/*POLY_VERTICES*/ 6);
				}

				var x1 = data[index + (/*POLY_LOCAL*/ 0)];
				var y1 = data[index + (/*POLY_LOCAL*/ 0) + 1];
				var x2 = data[next + (/*POLY_LOCAL*/ 0)];
				var y2 = data[next + (/*POLY_LOCAL*/ 0) + 1];

				var cross = ((x1 * y2) - (y1 * x2));
				doubleArea += cross;
				cx += ((x1 + x2) * cross);
				cy += ((y1 + y2) * cross);
			}

			var rec = (1 / (3 * doubleArea));
			dst[0] = (cx * rec);
			dst[1] = (cy * rec);

			return dst;
		};

		// ===========================================================================
		Physics2DPolygon.prototype.setVertices = function (vertices /*v2[]*/ ) {
			var body = this.body;
			if (body && body.world && (body._type === (/*TYPE_STATIC*/ 2) || body.world._midStep)) {
				return;
			}

			this._validate(vertices);
			if (body) {
				body._invalidate();
			}
		};

		// ===========================================================================
		Physics2DPolygon.prototype.clone = function () {
			var c = new Physics2DPolygon();
			Physics2DShape.prototype.copyCommon(this, c);
			return c;
		};

		// ===========================================================================
		Physics2DPolygon.prototype.scale = function (scaleX, scaleY) {
			var body = this.body;
			if (body && body.world && (body._type === (/*TYPE_STATIC*/ 2) || body.world._midStep)) {
				return;
			}

			if (scaleY === undefined) {
				scaleY = scaleX;
			}

			if (scaleX <= 0 || scaleY <= 0) {
				return;
			}

			var iscaleX = (1 / scaleX);
			var iscaleY = (1 / scaleY);

			var data = this._data;
			var limit = data.length;
			var index = (/*POLY_VERTICES*/ 6);

			var radius = 0.0;
			var minProj = Number.POSITIVE_INFINITY;
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				var x = (data[index + (/*POLY_LOCAL*/ 0)] *= scaleX);
				var y = (data[index + (/*POLY_LOCAL*/ 0) + 1] *= scaleY);

				var nx = (data[index + (/*POLY_LNORMAL*/ 4)] * iscaleX);
				var ny = (data[index + (/*POLY_LNORMAL*/ 4) + 1] * iscaleY);
				var rec = (1 / Math.sqrt((nx * nx) + (ny * ny)));

				data[index + (/*POLY_LNORMAL*/ 4)] = (nx *= rec);
				data[index + (/*POLY_LNORMAL*/ 4) + 1] = (ny *= rec);
				var lproj = data[index + (/*POLY_LPROJ*/ 8)] = ((nx * x) + (ny * y));
				if (lproj < minProj) {
					minProj = lproj;
				}
				var vlsq = ((x * x) + (y * y));
				if (vlsq > radius) {
					radius = vlsq;
				}

				var next = (index + (/*POLY_STRIDE*/ 13));
				if (next === limit) {
					next = (/*POLY_VERTICES*/ 6);
				}

				var dx = ((data[next + (/*POLY_LOCAL*/ 0)] * scaleX) - x);
				var dy = ((data[next + (/*POLY_LOCAL*/ 0) + 1] * scaleY) - y);
				var dL = Math.sqrt((dx * dx) + (dy * dy));
				data[index + (/*POLY_LENGTH*/ 12)] = dL;
			}

			data[(/*SHAPE_SWEEP_RADIUS*/ 4)] = Math.sqrt(radius);
			data[(/*SHAPE_SWEEP_FACTOR*/ 5)] = (data[(/*SHAPE_SWEEP_RADIUS*/ 4)] - Math.max(minProj, 0));
			if (body) {
				body._invalidate();
			}
		};

		Physics2DPolygon.prototype.translate = function (translation /*v2*/ , skip) {
			var body = this.body;
			if (!skip && body && body.world && (body._type === (/*TYPE_STATIC*/ 2) || body.world._midStep)) {
				return;
			}

			var data = this._data;
			var limit = data.length;
			var index = (/*POLY_VERTICES*/ 6);

			var tx = translation[0];
			var ty = translation[1];

			var radius = 0.0;
			var minProj = Number.POSITIVE_INFINITY;
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				var x = (data[index + (/*POLY_LOCAL*/ 0)] += tx);
				var y = (data[index + (/*POLY_LOCAL*/ 0) + 1] += ty);

				var nx = data[index + (/*POLY_LNORMAL*/ 4)];
				var ny = data[index + (/*POLY_LNORMAL*/ 4) + 1];
				var lproj = (data[index + (/*POLY_LPROJ*/ 8)] += ((nx * tx) + (ny * ty)));
				if (lproj < minProj) {
					minProj = lproj;
				}
				var vlsq = ((x * x) + (y * y));
				if (vlsq > radius) {
					radius = vlsq;
				}
				// Translation does not effect local normal or edge length.
			}

			data[(/*SHAPE_SWEEP_RADIUS*/ 4)] = Math.sqrt(radius);
			data[(/*SHAPE_SWEEP_FACTOR*/ 5)] = (data[(/*SHAPE_SWEEP_RADIUS*/ 4)] - Math.max(minProj, 0));
			if (!skip && body) {
				body._invalidate();
			}
		};

		Physics2DPolygon.prototype.rotate = function (rotation) {
			var body = this.body;
			if (body && body.world && (body._type === (/*TYPE_STATIC*/ 2) || body.world._midStep)) {
				return;
			}

			var data = this._data;
			var limit = data.length;
			var index = (/*POLY_VERTICES*/ 6);

			var cos = Math.cos(rotation);
			var sin = Math.sin(rotation);

			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				var x = data[index + (/*POLY_LOCAL*/ 0)];
				var y = data[index + (/*POLY_LOCAL*/ 0) + 1];
				data[index + (/*POLY_LOCAL*/ 0)] = ((x * cos) - (y * sin));
				data[index + (/*POLY_LOCAL*/ 0) + 1] = ((x * sin) + (y * cos));

				x = data[index + (/*POLY_LNORMAL*/ 4)];
				y = data[index + (/*POLY_LNORMAL*/ 4) + 1];
				data[index + (/*POLY_LNORMAL*/ 4)] = ((x * cos) - (y * sin));
				data[index + (/*POLY_LNORMAL*/ 4) + 1] = ((x * sin) + (y * cos));
				// Rotation does not effect local projection, edge length
				// nor does it effect radius and sweep factor.
			}

			if (body) {
				body._invalidate();
			}
		};

		Physics2DPolygon.prototype.transform = function (matrix /*m32*/ ) {
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
			var tx = matrix[4];
			var ty = matrix[5];

			if (((a * d) - (b * c)) <= 0) {
				return;
			}

			var data = this._data;
			var limit = data.length;
			var index = (/*POLY_VERTICES*/ 6);
			var x, y;
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				x = data[index + (/*POLY_LOCAL*/ 0)];
				y = data[index + (/*POLY_LOCAL*/ 0) + 1];
				data[index + (/*POLY_LOCAL*/ 0)] = ((a * x) + (b * y) + tx);
				data[index + (/*POLY_LOCAL*/ 0) + 1] = ((c * x) + (d * y) + ty);
			}

			var radius = 0.0;
			var minProj = Number.POSITIVE_INFINITY;
			index = (/*POLY_VERTICES*/ 6);
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				x = data[index + (/*POLY_LOCAL*/ 0)];
				y = data[index + (/*POLY_LOCAL*/ 0) + 1];

				var next = (index + (/*POLY_STRIDE*/ 13));
				if (next === limit) {
					next = (/*POLY_VERTICES*/ 6);
				}

				var dx = -(data[next + (/*POLY_LOCAL*/ 0)] - x);
				var dy = -(data[next + (/*POLY_LOCAL*/ 0) + 1] - y);
				var dL = Math.sqrt((dx * dx) + (dy * dy));
				var rec = (1 / dL);

				var nx = (-dy * rec);
				var ny = (dx * rec);

				data[index + (/*POLY_LNORMAL*/ 4)] = nx;
				data[index + (/*POLY_LNORMAL*/ 4) + 1] = ny;
				data[index + (/*POLY_LENGTH*/ 12)] = dL;
				var lproj = data[index + (/*POLY_LPROJ*/ 8)] = ((nx * x) + (ny * y));

				var vlsq = ((x * x) + (y * y));
				if (vlsq > radius) {
					radius = vlsq;
				}
				if (lproj < minProj) {
					minProj = lproj;
				}
			}

			data[(/*SHAPE_SWEEP_RADIUS*/ 4)] = Math.sqrt(radius);
			data[(/*SHAPE_SWEEP_FACTOR*/ 5)] = (data[(/*SHAPE_SWEEP_RADIUS*/ 4)] - Math.max(minProj, 0));
			if (body) {
				body._invalidate();
			}
		};

		// ===========================================================================
		Physics2DPolygon.prototype._update = function (posX, posY, cos, sin, skipAABB) {
			var data = this._data;
			var limit = data.length;
			var index = (/*POLY_VERTICES*/ 6);
			var j;

			var minX, minY, maxX, maxY;
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				// Compute world-space vertex.
				var x = data[index + (/*POLY_LOCAL*/ 0)];
				var y = data[index + (/*POLY_LOCAL*/ 0) + 1];
				var vX = data[index + (/*POLY_WORLD*/ 2)] = posX + (cos * x) - (sin * y);
				var vY = data[index + (/*POLY_WORLD*/ 2) + 1] = posY + (sin * x) + (cos * y);

				// Compute world-space normal.
				x = data[index + (/*POLY_LNORMAL*/ 4)];
				y = data[index + (/*POLY_LNORMAL*/ 4) + 1];
				var nx = data[index + (/*POLY_WNORMAL*/ 6)] = (cos * x) - (sin * y);
				var ny = data[index + (/*POLY_WNORMAL*/ 6) + 1] = (sin * x) + (cos * y);

				// Compute world-space projections.
				data[index + (/*POLY_WPROJ*/ 9)] = (nx * vX) + (ny * vY);
				data[index + (/*POLY_CROSS1*/ 10)] = (nx * vY) - (ny * vX);
				if (index !== (/*POLY_VERTICES*/ 6)) {
					j = index - (/*POLY_STRIDE*/ 13);
					data[j + (/*POLY_CROSS2*/ 11)] = ((data[j + (/*POLY_WNORMAL*/ 6)] * vY) - (data[j + (/*POLY_WNORMAL*/ 6) + 1] * vX));

					if (!skipAABB) {
						// Update partial AABB.
						if (vX < minX) {
							minX = vX;
						} else if (vX > maxX) {
							maxX = vX;
						}

						if (vY < minY) {
							minY = vY;
						} else if (vY > maxY) {
							maxY = vY;
						}
					}
				} else if (!skipAABB) {
					// Init. partial AABB.
					minX = maxX = vX;
					minY = maxY = vY;
				}
			}

			// Compute remaining projection
			index = (/*POLY_VERTICES*/ 6);
			j = data.length - (/*POLY_STRIDE*/ 13);
			data[j + (/*POLY_CROSS2*/ 11)] = ((data[j + (/*POLY_WNORMAL*/ 6)] * data[index + (/*POLY_WORLD*/ 2) + 1]) - (data[j + (/*POLY_WNORMAL*/ 6) + 1] * data[index + (/*POLY_WORLD*/ 2)]));

			if (!skipAABB) {
				// AABB
				data[(/*SHAPE_AABB*/ 0)] = minX;
				data[(/*SHAPE_AABB*/ 0) + 1] = minY;
				data[(/*SHAPE_AABB*/ 0) + 2] = maxX;
				data[(/*SHAPE_AABB*/ 0) + 3] = maxY;
			}
		};

		Physics2DPolygon.prototype._validate = function (vertices /*v2[]*/ ) {
			var vCount = vertices.length;
			var data = this._data;

			// Avoid recreating array if number of vertices is unchanged!
			var newLimit = (/*POLY_VERTICES*/ 6) + (vCount * (/*POLY_STRIDE*/ 13));
			if (!data || newLimit !== data.length) {
				data = this._data = Types.createFloatArray(newLimit);
			}

			var radius = 0.0;
			var minProj = Number.POSITIVE_INFINITY;

			var index = (/*POLY_VERTICES*/ 6);
			var i;
			for (i = 0; i < vCount; i += 1, index += (/*POLY_STRIDE*/ 13)) {
				var v1 = vertices[i];
				var v2 = vertices[(i === (vCount - 1) ? 0 : (i + 1))];

				var x = v1[0];
				var y = v1[1];
				var dx = x - v2[0];
				var dy = y - v2[1];
				var dL = Math.sqrt((dx * dx) + (dy * dy));
				var rec = (1 / dL);

				var nx = (-dy * rec);
				var ny = (dx * rec);

				data[index + (/*POLY_LOCAL*/ 0)] = x;
				data[index + (/*POLY_LOCAL*/ 0) + 1] = y;
				data[index + (/*POLY_LNORMAL*/ 4)] = nx;
				data[index + (/*POLY_LNORMAL*/ 4) + 1] = ny;
				data[index + (/*POLY_LENGTH*/ 12)] = dL;
				var lproj = data[index + (/*POLY_LPROJ*/ 8)] = ((nx * x) + (ny * y));

				// ---
				var vlsq = ((x * x) + (y * y));
				if (vlsq > radius) {
					radius = vlsq;
				}
				if (lproj < minProj) {
					minProj = lproj;
				}
			}

			data[(/*SHAPE_SWEEP_RADIUS*/ 4)] = Math.sqrt(radius);
			data[(/*SHAPE_SWEEP_FACTOR*/ 5)] = (data[(/*SHAPE_SWEEP_RADIUS*/ 4)] - Math.max(minProj, 0));
		};

		// params = {
		//      vertices: [v2, v2, ...]  (CLOCKWISE)
		//      ... common shape props.
		// }
		// inVertices optionally replacing params.vertices
		Physics2DPolygon.create = function (params, inVertices) {
			var p = new Physics2DPolygon();
			p._type = (/*TYPE_POLYGON*/ 1);
			Physics2DShape.prototype.init(p, params);

			p._validate(inVertices || params.vertices);
			return p;
		};

	Physics2DPolygon.version = 1;

	return Physics2DPolygon;
})