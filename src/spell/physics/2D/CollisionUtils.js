
// =========================================================================
//
// Physics2D internal collision detection routines.
//
define(
	'spell/physics/2D/CollisionUtils',
	[
		'spell/physics/2D/TOIEvent'
	],
	function( Physics2DTOIEvent ) {

		var Physics2DCollisionUtils = function() {
		}
		Physics2DCollisionUtils.prototype.containsPoint = function (shape, point /*v2*/ ) {
			shape.body._update();
			return this._contains(shape, point[0], point[1]);
		};

		Physics2DCollisionUtils.prototype.signedDistance = function (shapeA, shapeB, witnessA /*v2*/ , witnessB /*v2*/ , axis /*v2*/ ) {
			shapeA.body._update();
			if (shapeB.body !== shapeA.body) {
				shapeB.body._update();
			}

			var data = this._toi._data;
			var ret = this._distance(shapeA, shapeB, data);
			witnessA[0] = data[(/*TOI_WITNESS_A*/ 2)];
			witnessA[1] = data[(/*TOI_WITNESS_A*/ 2) + 1];
			witnessB[0] = data[(/*TOI_WITNESS_B*/ 4)];
			witnessB[1] = data[(/*TOI_WITNESS_B*/ 4) + 1];
			axis[0] = data[(/*TOI_AXIS*/ 0)];
			axis[1] = data[(/*TOI_AXIS*/ 0) + 1];

			return ret;
		};

		Physics2DCollisionUtils.prototype.intersects = function (shapeA, shapeB) {
			shapeA.body._update();
			if (shapeB.body !== shapeA.body) {
				shapeB.body._update();
			}

			return this._test(shapeA, shapeB);
		};

		Physics2DCollisionUtils.prototype.rayTest = function (shape, ray, normal /*v2*/ , ignoreInnerSurfaces) {
			shape.body._update();
			return this._rayTest(shape, ray, normal, ignoreInnerSurfaces);
		};

		Physics2DCollisionUtils.prototype.sweepTest = function (shapeA, shapeB, deltaTime, point /*v2*/ , normal /*v2*/ ) {
			var toi = this._toi;
			toi.shapeA = shapeA;
			toi.shapeB = shapeB;

			var bodyA = shapeA.body;
			var bodyB = shapeB.body;
			var dataA = bodyA._data;
			var dataB = bodyB._data;
			dataA[(/*BODY_SWEEP_TIME*/ 18)] = 0;
			dataB[(/*BODY_SWEEP_TIME*/ 18)] = 0;
			dataA[(/*BODY_SWEEP_ANGVEL*/ 20)] = (dataA[(/*BODY_VEL*/ 7) + 2]);
			dataB[(/*BODY_SWEEP_ANGVEL*/ 20)] = (dataB[(/*BODY_VEL*/ 7) + 2]);
			var ret = this._dynamicSweep(toi, deltaTime, 0, true);
			bodyA._sweepIntegrate(0);
			bodyB._sweepIntegrate(0);
			shapeA._update(dataA[(/*BODY_POS*/ 2)], dataA[(/*BODY_POS*/ 2) + 1], dataA[(/*BODY_AXIS*/ 5)], dataA[(/*BODY_AXIS*/ 5) + 1]);
			shapeB._update(dataB[(/*BODY_POS*/ 2)], dataB[(/*BODY_POS*/ 2) + 1], dataB[(/*BODY_AXIS*/ 5)], dataB[(/*BODY_AXIS*/ 5) + 1]);

			if (ret < 0) {
				return undefined;
			}

			var data = toi._data;
			point[0] = (0.5 * (data[(/*TOI_WITNESS_A*/ 2)] + data[(/*TOI_WITNESS_B*/ 4)]));
			point[1] = (0.5 * (data[(/*TOI_WITNESS_A*/ 2) + 1] + data[(/*TOI_WITNESS_B*/ 4) + 1]));
			normal[0] = data[(/*TOI_AXIS*/ 0)];
			normal[1] = data[(/*TOI_AXIS*/ 0) + 1];
			return (ret * deltaTime);
		};

		//=======================================================================================
		//=======================================================================================
		// Private.
		// Test if (parametric) ray intersects
		// Shape between 0 and ray.maxFactor
		// Assume shape has been updated by a Body.
		// (need not be 'in' a body).
		Physics2DCollisionUtils.prototype._rayTest = function (shape, ray, normal, noInner) {
			if (shape._type === (/*TYPE_CIRCLE*/ 0)) {
				return this._rayTestCircle(shape, ray, normal, noInner);
			} else {
				return this._rayTestPolygon(shape, ray, normal, noInner);
			}
		};

		Physics2DCollisionUtils.prototype._rayTestPolygon = function (poly, ray, normal, noInner) {
			var origin = ray.origin;
			var direction = ray.direction;
			var data = poly._data;

			var ox = origin[0];
			var oy = origin[1];
			var dx = direction[0];
			var dy = direction[1];

			var min = ray.maxFactor;
			var edge, inner;

			var index = (/*POLY_VERTICES*/ 6);
			var limit = data.length;
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				var nx = data[index + (/*POLY_WNORMAL*/ 6)];
				var ny = data[index + (/*POLY_WNORMAL*/ 6) + 1];
				var den = (nx * dx) + (ny * dy);
				if ((den >= 0 && noInner) || (den * den) < Physics2DConfig.COLLINEAR_SQ_EPSILON) {
					continue;
				}

				var t = (data[index + (/*POLY_WPROJ*/ 9)] - ((ox * nx) + (oy * ny))) / den;
				if (t < 0 || t >= min) {
					continue;
				}

				var hitX = ox + (dx * t);
				var hitY = oy + (dy * t);
				var dproj = (nx * hitY) - (ny * hitX);
				if (dproj < data[index + (/*POLY_CROSS1*/ 10)] || dproj > data[index + (/*POLY_CROSS2*/ 11)]) {
					continue;
				}

				min = t;
				edge = index;
				inner = (den >= 0);
			}

			if (edge === undefined) {
				return undefined;
			} else {
				var scale = (inner ? -1 : 1);
				normal[0] = (data[edge + (/*POLY_WNORMAL*/ 6)] * scale);
				normal[1] = (data[edge + (/*POLY_WNORMAL*/ 6) + 1] * scale);
				return min;
			}
		};

		Physics2DCollisionUtils.prototype._rayTestCircle = function (circle, ray, normal, noInner) {
			var origin = ray.origin;
			var direction = ray.direction;
			var data = circle._data;

			var ox = origin[0];
			var oy = origin[1];
			var dx = direction[0];
			var dy = direction[1];
			var cx = data[(/*CIRCLE_WORLD*/ 9)];
			var cy = data[(/*CIRCLE_WORLD*/ 9) + 1];
			var radius = data[(/*CIRCLE_RADIUS*/ 6)];

			var ocX = (ox - cx);
			var ocY = (oy - cy);

			// Quadratic equation at^2 + bt + c = 0
			var a = ((dx * dx) + (dy * dy));
			var b = 2 * ((ocX * dx) + (ocY * dy));
			var c = (ocX * ocX) + (ocY * ocY) - (radius * radius);

			var determinant = ((b * b) - (4 * a * c));
			if (determinant < 0) {
				return undefined;
			}

			var normalScale = 1.0;
			var rec = (1 / (2 * a));
			var rootD = Math.sqrt(determinant);
			var distance = ((-b - rootD) * rec);
			if (distance < 0) {
				if (noInner) {
					return undefined;
				}
				distance += (rootD * 2 * rec);
				normalScale = -1.0;
			}

			if (0 <= distance && distance < ray.maxFactor) {
				var hitX = (ox + (dx * distance) - cx);
				var hitY = (oy + (dy * distance) - cy);
				var scale = (normalScale / radius);
				normal[0] = (hitX * scale);
				normal[1] = (hitY * scale);
				return distance;
			} else {
				return undefined;
			}
		};

		// =====================================================================
		// Test point containment in shape.
		// no AABB check is performed.
		// Assume shape has been updated by a Body.
		// (need not be 'in' a body).
		Physics2DCollisionUtils.prototype._contains = function (shape, x, y) {
			if (shape._type === (/*TYPE_CIRCLE*/ 0)) {
				return this._containsCircle(shape, x, y);
			} else {
				return this._containsPolygon(shape, x, y);
			}
		};

		Physics2DCollisionUtils.prototype._containsCircle = function (circle, x, y) {
			var data = circle._data;
			var dx = (data[(/*CIRCLE_WORLD*/ 9)] - x);
			var dy = (data[(/*CIRCLE_WORLD*/ 9) + 1] - y);
			var rad = data[(/*CIRCLE_RADIUS*/ 6)];
			return ((dx * dx) + (dy * dy) - (rad * rad)) <= Physics2DConfig.CONTAINS_SQ_EPSILON;
		};

		Physics2DCollisionUtils.prototype._containsPolygon = function (poly, x, y) {
			var data = poly._data;
			var index = (/*POLY_VERTICES*/ 6);
			var limit = data.length;
			var EPS = Physics2DConfig.CONTAINS_EPSILON;
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				var proj = ((data[index + (/*POLY_WNORMAL*/ 6)] * x) + (data[index + (/*POLY_WNORMAL*/ 6) + 1] * y)) - data[index + (/*POLY_WPROJ*/ 9)];
				if (proj > EPS) {
					return false;
				}
			}
			return true;
		};

		// =====================================================================
		// slowSweep is true when method is invoked from public API.
		// Or in convexSweep to be more accurate and fail less easily.
		// This is also to disable slipping TOI's and terminate as soon
		// as objects intersect.
		Physics2DCollisionUtils.prototype._dynamicSweep = function (toi, timeStep, negRadius, slowSweep) {
			var s1 = toi.shapeA;
			var s2 = toi.shapeB;
			var b1 = s1.body;
			var b2 = s2.body;
			var data1 = b1._data;
			var data2 = b2._data;

			// relative linear velocity and angular bias for distance calculation.
			var deltaX = (data2[(/*BODY_VEL*/ 7)] - data1[(/*BODY_VEL*/ 7)]);
			var deltaY = (data2[(/*BODY_VEL*/ 7) + 1] - data1[(/*BODY_VEL*/ 7) + 1]);
			var ang1 = data1[(/*BODY_SWEEP_ANGVEL*/ 20)];
			var ang2 = data2[(/*BODY_SWEEP_ANGVEL*/ 20)];
			var angBias = ((s1._data[(/*SHAPE_SWEEP_FACTOR*/ 5)] * (ang1 < 0 ? -ang1 : ang1)) + (s2._data[(/*SHAPE_SWEEP_FACTOR*/ 5)] * (ang2 < 0 ? -ang2 : ang2)));

			// If relative linear velocity is near zero
			// and angular bias is near zero, ignore continuous pair.
			if (!slowSweep) {
				if (((deltaX * deltaX) + (deltaY * deltaY)) < Physics2DConfig.EQUAL_SQ_VEL && angBias < Physics2DConfig.ZERO_ANG_BIAS) {
					toi._data[(/*TOI_TOI_ALPHA*/ 6)] = undefined;
					toi.failed = true;
					return;
				}
			}

			var curTOIAlpha = 0;
			var curIter = 0;
			var toiData = toi._data;

			var LIMIT = Physics2DConfig.SWEEP_LIMIT;
			var HALF_LIMIT = (LIMIT * 0.5);
			var MIN_ADVANCE = Physics2DConfig.MINIMUM_SWEEP_ADVANCE;
			var MAX_ITER = Physics2DConfig.MAX_SWEEP_ITER;

			while (true) {
				b1._sweepIntegrate(curTOIAlpha * timeStep);
				b2._sweepIntegrate(curTOIAlpha * timeStep);
				var posX = data1[(/*BODY_POS*/ 2)];
				var posY = data1[(/*BODY_POS*/ 2) + 1];
				s1._update(posX, posY, data1[(/*BODY_AXIS*/ 5)], data1[(/*BODY_AXIS*/ 5) + 1], true);
				posX = data2[(/*BODY_POS*/ 2)];
				posY = data2[(/*BODY_POS*/ 2) + 1];
				s2._update(posX, posY, data2[(/*BODY_AXIS*/ 5)], data2[(/*BODY_AXIS*/ 5) + 1], true);

				var sep = this._distance(s1, s2, toiData) + negRadius;
				var axisX = toiData[(/*TOI_AXIS*/ 0)];
				var axisY = toiData[(/*TOI_AXIS*/ 0) + 1];
				var dot = ((axisX * deltaX) + (axisY * deltaY));

				// Objects intersecting!
				if (sep < LIMIT) {
					if (slowSweep) {
						break;
					} else {
						var d1X = (toiData[(/*TOI_WITNESS_A*/ 2)] - posX);
						var d1Y = (toiData[(/*TOI_WITNESS_A*/ 2) + 1] - posY);
						var proj = (dot - (ang1 * ((d1X * axisY) - (d1Y * axisX))));

						// Terminate if velocity at witness indicates a non-seperating contact
						// Or if the penetration is too deep.
						//
						// Otherwise we continue and try to get a better collision time
						// To permit fast-rotation of a box about a vertex in collision.
						// (#)
						if (proj > 0) {
							toi.slipped = true;
						}
						if (proj <= 0 || sep < HALF_LIMIT) {
							break;
						}
					}
				}

				// Lower bound on TOI advancement
				var denom = (angBias - dot) * timeStep;
				if (denom <= 0) {
					// fail.
					curTOIAlpha = -1;
					break;
				}

				var delta = (sep / denom);

				// Permit small advancement when objects are already intersecting (#)
				// As well as to avoid failing when a box is rotating with its face
				// parallel to the other collider so that delta is roughly 0.
				//
				// This also helps with performance.
				if (delta < MIN_ADVANCE) {
					delta = MIN_ADVANCE;
				}

				curTOIAlpha += delta;
				if (curTOIAlpha >= 1) {
					// fail
					curTOIAlpha = -1;
					break;
				}

				curIter += 1;
				if (curIter >= MAX_ITER) {
					// If presently intersecting (ignoring slop)
					// Then we mark objects to have their angular
					// velocity set to 0 and permit tunnelling even
					// though we failed to reach tolerance.
					if (sep > negRadius) {
						toi.failed = true;
					} else if (slowSweep) {
						// fail
						curTOIAlpha = -1;
					}
					break;
				}
			}

			toiData[(/*TOI_TOI_ALPHA*/ 6)] = curTOIAlpha;
			return curTOIAlpha;
		};

		Physics2DCollisionUtils.prototype._staticSweep = function (toi, timeStep, negRadius) {
			var s1 = toi.shapeA;
			var s2 = toi.shapeB;
			var b1 = s1.body;
			var data1 = b1._data;

			// relative linear velocity and angular bias for distance calculation.
			var deltaX = -data1[(/*BODY_VEL*/ 7)];
			var deltaY = -data1[(/*BODY_VEL*/ 7) + 1];
			var ang1 = data1[(/*BODY_SWEEP_ANGVEL*/ 20)];
			var angBias = (s1._data[(/*SHAPE_SWEEP_FACTOR*/ 5)] * (ang1 < 0 ? -ang1 : ang1));

			var curTOIAlpha = 0;
			var curIter = 0;
			var toiData = toi._data;

			var LIMIT = Physics2DConfig.SWEEP_LIMIT;
			var HALF_LIMIT = (LIMIT * 0.5);
			var MIN_ADVANCE = Physics2DConfig.MINIMUM_SWEEP_ADVANCE;
			var MAX_ITER = Physics2DConfig.MAX_SWEEP_ITER;

			while (true) {
				b1._sweepIntegrate(curTOIAlpha * timeStep);
				var posX = data1[(/*BODY_POS*/ 2)];
				var posY = data1[(/*BODY_POS*/ 2) + 1];
				s1._update(posX, posY, data1[(/*BODY_AXIS*/ 5)], data1[(/*BODY_AXIS*/ 5) + 1], true);

				var sep = this._distance(s1, s2, toiData) + negRadius;
				var axisX = toiData[(/*TOI_AXIS*/ 0)];
				var axisY = toiData[(/*TOI_AXIS*/ 0) + 1];
				var dot = ((axisX * deltaX) + (axisY * deltaY));

				// Objects intersecting!
				if (sep < LIMIT) {
					var d1X = (toiData[(/*TOI_WITNESS_A*/ 2)] - posX);
					var d1Y = (toiData[(/*TOI_WITNESS_A*/ 2) + 1] - posY);
					var proj = (dot - (ang1 * ((d1X * axisY) - (d1Y * axisX))));

					// Terminate if velocity at witness indicates a non-seperating contact
					// Or if the penetration is too deep.
					//
					// Otherwise we continue and try to get a better collision time
					// To permit fast-rotation of a box about a vertex in collision.
					// (#)
					if (proj > 0) {
						toi.slipped = true;
					}
					if (proj <= 0 || sep < HALF_LIMIT) {
						break;
					}
				}

				// Lower bound on TOI advancement
				var denom = (angBias - dot) * timeStep;
				if (denom <= 0) {
					// fail.
					curTOIAlpha = -1;
					break;
				}

				var delta = (sep / denom);

				// Permit small advancement when objects are already intersecting (#)
				// As well as to avoid failing when a box is rotating with its face
				// parallel to the other collider so that delta is roughly 0.
				//
				// This also helps with performance.
				if (delta < MIN_ADVANCE) {
					delta = MIN_ADVANCE;
				}

				curTOIAlpha += delta;
				if (curTOIAlpha >= 1) {
					// fail
					curTOIAlpha = -1;
					break;
				}

				curIter += 1;
				if (curIter >= MAX_ITER) {
					// If presently intersecting (ignoring slop)
					// Then we mark objects to have their angular
					// velocity set to 0 and permit tunnelling even
					// though we failed to reach tolerance.
					if (sep > negRadius) {
						toi.failed = true;
					}
					break;
				}
			}

			toiData[(/*TOI_TOI_ALPHA*/ 6)] = curTOIAlpha;
			return curTOIAlpha;
		};

		// =====================================================================
		// Assumption, shapes have been updated by body.
		// need not be IN a body.
		Physics2DCollisionUtils.prototype._distance = function (shapeA, shapeB, toiData) {
			if (shapeA._type === (/*TYPE_CIRCLE*/ 0)) {
				if (shapeB._type === (/*TYPE_CIRCLE*/ 0)) {
					return this._distanceCircle2Circle(shapeA, shapeB, toiData);
				} else {
					return this._distanceCircle2Polygon(shapeA, shapeB, toiData);
				}
			} else {
				if (shapeB._type === (/*TYPE_CIRCLE*/ 0)) {
					var ret = this._distanceCircle2Polygon(shapeB, shapeA, toiData);

					// Reverse axis.
					toiData[(/*TOI_AXIS*/ 0)] = -toiData[(/*TOI_AXIS*/ 0)];
					toiData[(/*TOI_AXIS*/ 0) + 1] = -toiData[(/*TOI_AXIS*/ 0) + 1];

					// Swap witness points.
					var tmp = toiData[(/*TOI_WITNESS_A*/ 2)];
					toiData[(/*TOI_WITNESS_A*/ 2)] = toiData[(/*TOI_WITNESS_B*/ 4)];
					toiData[(/*TOI_WITNESS_B*/ 4)] = tmp;

					tmp = toiData[(/*TOI_WITNESS_A*/ 2) + 1];
					toiData[(/*TOI_WITNESS_A*/ 2) + 1] = toiData[(/*TOI_WITNESS_B*/ 4) + 1];
					toiData[(/*TOI_WITNESS_B*/ 4) + 1] = tmp;
					return ret;
				} else {
					return this._distancePolygon2Polygon(shapeA, shapeB, toiData);
				}
			}
		};

		Physics2DCollisionUtils.prototype._distanceCircle2Circle = function (circleA, circleB, toiData) {
			var dataA = circleA._data;
			var dataB = circleB._data;

			var cAX = dataA[(/*CIRCLE_WORLD*/ 9)];
			var cAY = dataA[(/*CIRCLE_WORLD*/ 9) + 1];
			var cBX = dataB[(/*CIRCLE_WORLD*/ 9)];
			var cBY = dataB[(/*CIRCLE_WORLD*/ 9) + 1];
			var radA = dataA[(/*CIRCLE_RADIUS*/ 6)];
			var radB = dataB[(/*CIRCLE_RADIUS*/ 6)];

			var dx = (cBX - cAX);
			var dy = (cBY - cAY);
			var rSum = (radA + radB);

			var len = Math.sqrt((dx * dx) + (dy * dy));
			if (len === 0) {
				toiData[(/*TOI_AXIS*/ 0)] = dx = 1;
				toiData[(/*TOI_AXIS*/ 0) + 1] = dy = 0;
			} else {
				var rec = (1 / len);
				toiData[(/*TOI_AXIS*/ 0)] = (dx *= rec);
				toiData[(/*TOI_AXIS*/ 0) + 1] = (dy *= rec);
			}
			toiData[(/*TOI_WITNESS_A*/ 2)] = cAX + (dx * radA);
			toiData[(/*TOI_WITNESS_A*/ 2) + 1] = cAY + (dy * radA);
			toiData[(/*TOI_WITNESS_B*/ 4)] = cBX - (dx * radB);
			toiData[(/*TOI_WITNESS_B*/ 4) + 1] = cBY - (dy * radB);

			return (len - rSum);
		};

		Physics2DCollisionUtils.prototype._distanceCircle2Polygon = function (circle, polygon, toiData) {
			var dataC = circle._data;
			var dataP = polygon._data;

			var cx = dataC[(/*CIRCLE_WORLD*/ 9)];
			var cy = dataC[(/*CIRCLE_WORLD*/ 9) + 1];
			var radius = dataC[(/*CIRCLE_RADIUS*/ 6)];

			var max = Number.NEGATIVE_INFINITY;
			var edge, proj;

			var index = (/*POLY_VERTICES*/ 6);
			var limit = dataP.length;
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				// proj = world-normal dot position
				proj = ((dataP[index + (/*POLY_WNORMAL*/ 6)] * cx) + (dataP[index + (/*POLY_WNORMAL*/ 6) + 1] * cy));
				var dist = proj - (radius + dataP[index + (/*POLY_WPROJ*/ 9)]);
				if (dist > max) {
					max = dist;
					edge = index;
				}
			}

			var nx = dataP[edge + (/*POLY_WNORMAL*/ 6)];
			var ny = dataP[edge + (/*POLY_WNORMAL*/ 6) + 1];
			proj = ((nx * cy) - (ny * cx));
			if (proj >= dataP[edge + (/*POLY_CROSS1*/ 10)]) {
				if (proj <= dataP[edge + (/*POLY_CROSS2*/ 11)]) {
					// circle center is within voronoi region of edge.
					toiData[(/*TOI_AXIS*/ 0)] = -nx;
					toiData[(/*TOI_AXIS*/ 0) + 1] = -ny;
					toiData[(/*TOI_WITNESS_A*/ 2)] = (cx -= (nx * radius));
					toiData[(/*TOI_WITNESS_A*/ 2) + 1] = (cy -= (ny * radius));
					toiData[(/*TOI_WITNESS_B*/ 4)] = (cx - (nx * max));
					toiData[(/*TOI_WITNESS_B*/ 4) + 1] = (cy - (ny * max));
					return max;
				} else {
					// skip to next edge.
					edge += (/*POLY_STRIDE*/ 13);
					if (edge === limit) {
						edge = (/*POLY_VERTICES*/ 6);
					}
				}
			}

			// Perform circle-vertex check.
			var vX = dataP[edge + (/*POLY_WORLD*/ 2)];
			var vY = dataP[edge + (/*POLY_WORLD*/ 2) + 1];
			var dx = (vX - cx);
			var dy = (vY - cy);

			var len = Math.sqrt((dx * dx) + (dy * dy));
			if (len === 0) {
				toiData[(/*TOI_AXIS*/ 0)] = dx = -nx;
				toiData[(/*TOI_AXIS*/ 0) + 1] = dy = -ny;
			} else {
				var rec = (1 / len);
				toiData[(/*TOI_AXIS*/ 0)] = (dx *= rec);
				toiData[(/*TOI_AXIS*/ 0) + 1] = (dy *= rec);
			}
			toiData[(/*TOI_WITNESS_A*/ 2)] = (cx + (dx * radius));
			toiData[(/*TOI_WITNESS_A*/ 2) + 1] = (cy + (dy * radius));
			toiData[(/*TOI_WITNESS_B*/ 4)] = vX;
			toiData[(/*TOI_WITNESS_B*/ 4) + 1] = vY;
			return (len - radius);
		};

		Physics2DCollisionUtils.prototype._distancePolygon2Polygon = function (polyA, polyB, toiData) {
			var inf = Number.POSITIVE_INFINITY;
			var dataA = polyA._data;
			var dataB = polyB._data;

			var limitA = dataA.length;
			var limitB = dataB.length;

			var i, j;
			var min, k, nx, ny;

			var max = -inf;
			var first, edge;

			for (i = (/*POLY_VERTICES*/ 6); i < limitA; i += (/*POLY_STRIDE*/ 13)) {
				min = inf;
				nx = dataA[i + (/*POLY_WNORMAL*/ 6)];
				ny = dataA[i + (/*POLY_WNORMAL*/ 6) + 1];
				for (j = (/*POLY_VERTICES*/ 6); j < limitB; j += (/*POLY_STRIDE*/ 13)) {
					k = (nx * dataB[j + (/*POLY_WORLD*/ 2)]) + (ny * dataB[j + (/*POLY_WORLD*/ 2) + 1]);
					if (k < min) {
						min = k;
					}
				}
				min -= dataA[i + (/*POLY_WPROJ*/ 9)];

				if (min > max) {
					max = min;
					edge = i;
					first = true;
				}
			}

			for (j = (/*POLY_VERTICES*/ 6); j < limitB; j += (/*POLY_STRIDE*/ 13)) {
				min = inf;
				nx = dataB[j + (/*POLY_WNORMAL*/ 6)];
				ny = dataB[j + (/*POLY_WNORMAL*/ 6) + 1];
				for (i = (/*POLY_VERTICES*/ 6); i < limitA; i += (/*POLY_STRIDE*/ 13)) {
					k = (nx * dataA[i + (/*POLY_WORLD*/ 2)]) + (ny * dataA[i + (/*POLY_WORLD*/ 2) + 1]);
					if (k < min) {
						min = k;
					}
				}
				min -= dataB[j + (/*POLY_WPROJ*/ 9)];

				if (min > max) {
					max = min;
					edge = j;
					first = false;
				}
			}

			// swap data so first polygon owns seperating axis.
			var flip = (first ? 1 : -1);
			var indA, indB;
			if (!first) {
				dataA = polyB._data;
				dataB = polyA._data;
				limitA = dataA.length;
				limitB = dataB.length;
				indA = (/*TOI_WITNESS_B*/ 4);
				indB = (/*TOI_WITNESS_A*/ 2);
			} else {
				indA = (/*TOI_WITNESS_A*/ 2);
				indB = (/*TOI_WITNESS_B*/ 4);
			}

			nx = dataA[edge + (/*POLY_WNORMAL*/ 6)];
			ny = dataA[edge + (/*POLY_WNORMAL*/ 6) + 1];

			// Find witness edge on dataB (not necessarigly polyB)
			min = inf;
			var witness;
			for (j = (/*POLY_VERTICES*/ 6); j < limitB; j += (/*POLY_STRIDE*/ 13)) {
				k = (nx * dataB[j + (/*POLY_WNORMAL*/ 6)]) + (ny * dataB[j + (/*POLY_WNORMAL*/ 6) + 1]);
				if (k < min) {
					min = k;
					witness = j;
				}
			}

			var next = witness + (/*POLY_STRIDE*/ 13);
			if (next === limitB) {
				next = (/*POLY_VERTICES*/ 6);
			}

			var kX, kY;
			var k1, k2;
			var x3, y3;
			var x4, y4;
			var dL;

			var x1 = dataB[witness + (/*POLY_WORLD*/ 2)];
			var y1 = dataB[witness + (/*POLY_WORLD*/ 2) + 1];
			var x2 = dataB[next + (/*POLY_WORLD*/ 2)];
			var y2 = dataB[next + (/*POLY_WORLD*/ 2) + 1];

			// Special case for parallel, intersecting edges.
			var parallel = (min < (Physics2DConfig.COLLINEAR_EPSILON - 1));
			if (max < 0 && parallel) {
				toiData[(/*TOI_AXIS*/ 0)] = (nx * flip);
				toiData[(/*TOI_AXIS*/ 0) + 1] = (ny * flip);

				// Clip (x1,y1), (x2,y2) to edge.
				// Projections relative to edge start.
				kX = dataA[edge + (/*POLY_WORLD*/ 2)];
				kY = dataA[edge + (/*POLY_WORLD*/ 2) + 1];
				dL = dataA[edge + (/*POLY_LENGTH*/ 12)];

				k1 = (nx * (y1 - kY)) - (ny * (x1 - kX));
				if (k1 >= 0 && k1 <= dL) {
					toiData[indB] = kX = x1;
					toiData[indB + 1] = kY = y1;
				} else {
					k2 = (nx * (y2 - kY)) - (ny * (x1 - kX));
					if (k2 >= 0 && k2 <= dL) {
						toiData[indB] = kX = x2;
						toiData[indB + 1] = kY = y2;
					} else {
						//clip one of the vertices (x1,y1) to the edge.
						if (k1 < 0) {
							k1 = -k1;
						} else if (k1 > dL) {
							k1 = (dL - k1);
						}

						toiData[indB] = kX = x1 - (ny * k1);
						toiData[indB + 1] = kY = y1 + (nx * k1);
					}
				}

				// Witness on toiDataA is the projection.
				toiData[indA] = kX - (nx * max);
				toiData[indA + 1] = kY - (ny * max);

				return max;
			} else {
				// Special case for intersection.
				if (max <= 0) {
					toiData[(/*TOI_AXIS*/ 0)] = (nx * flip);
					toiData[(/*TOI_AXIS*/ 0) + 1] = (ny * flip);

					// Find vertex on toiDataB that is 'deepest' This is a vertex of witness edge.
					k1 = (nx * x1) + (ny * y1);
					k2 = (nx * x2) + (ny * y2);
					if (k2 < k1) {
						witness = next;
					}

					// Witness on toiDataB is the deep vertex.
					toiData[indB] = kX = dataB[witness + (/*POLY_WORLD*/ 2)];
					toiData[indB + 1] = kY = dataB[witness + (/*POLY_WORLD*/ 2) + 1];

					// Witness on toiDataA is the projection.
					toiData[indA] = kX - (nx * max);
					toiData[indA + 1] = kY - (ny * max);
					return max;
				} else {
					// Find closest point on dataA edge to witness edge.
					// Witness on dataB is one of the witness vertices.
					// Witness on dataA is the closest point (projection of witness on dataB)
					dL = dataA[edge + (/*POLY_LENGTH*/ 12)];

					// !! Special case parallel edges.
					if (parallel) {
						// Need to swap if dataB is 'longer' edge than on dataA.
						var dL2 = dataB[witness + (/*POLY_LENGTH*/ 12)];
						if (dL2 > dL) {
							dL = dL2;

							// swap edge/witness
							next = edge;
							edge = witness;
							witness = next;

							next = (witness + (/*POLY_STRIDE*/ 13));
							if (next === limitA) {
								next = (/*POLY_VERTICES*/ 6);
							}

							x1 = dataA[witness + (/*POLY_WORLD*/ 2)];
							y1 = dataA[witness + (/*POLY_WORLD*/ 2) + 1];
							x2 = dataA[next + (/*POLY_WORLD*/ 2)];
							y2 = dataA[next + (/*POLY_WORLD*/ 2) + 1];

							// Change to dataB for (kX, kY) below.
							dataA = dataB;

							// flip everyyyyything.
							nx *= -1;
							ny *= -1;
							flip *= -1;

							var tmp = indA;
							indA = indB;
							indB = tmp;
						}
					}

					kX = dataA[edge + (/*POLY_WORLD*/ 2)];
					kY = dataA[edge + (/*POLY_WORLD*/ 2) + 1];

					// 'time' of point w1 along edge.
					k1 = -((nx * (kY - y1)) - (ny * (kX - x1)));
					var in1 = true;
					if (k1 < 0) {
						k1 = 0;
						in1 = false;
					} else if (k1 > dL) {
						k1 = dL;
						in1 = false;
					}

					// 'time' of point w2 along edge.
					k2 = -((nx * (kY - y2)) - (ny * (kX - x2)));
					var in2 = true;
					if (k2 < 0) {
						k2 = 0;
						in2 = false;
					} else if (k2 > dL) {
						k2 = dL;
						in2 = false;
					}

					// point on edge closest to w1/w2, relative to closest points for axis.
					x3 = x1 - (kX - (ny * k1));
					y3 = y1 - (kY + (nx * k1));
					x4 = x2 - (kX - (ny * k2));
					y4 = y2 - (kY + (nx * k2));

					k1 = ((x3 * x3) + (y3 * y3));
					k2 = ((x4 * x4) + (y4 * y4));
					var rec;
					if (k1 < k2) {
						// point closest to w1 is shorter distance.
						toiData[indB] = kX = x1;
						toiData[indB + 1] = kY = y1;
						max = Math.sqrt(k1);
						if (in1 || max < Physics2DConfig.NORMALIZE_EPSILON) {
							toiData[(/*TOI_AXIS*/ 0)] = (nx *= flip);
							toiData[(/*TOI_AXIS*/ 0) + 1] = (ny *= flip);
						} else {
							rec = flip / max;
							toiData[(/*TOI_AXIS*/ 0)] = nx = (x3 * rec);
							toiData[(/*TOI_AXIS*/ 0) + 1] = ny = (y3 * rec);
						}
					} else {
						// point closest to w2 is shorter distance.
						toiData[indB] = kX = x2;
						toiData[indB + 1] = kY = y2;
						max = Math.sqrt(k2);
						if (in2 || max < Physics2DConfig.NORMALIZE_EPSILON) {
							toiData[(/*TOI_AXIS*/ 0)] = (nx *= flip);
							toiData[(/*TOI_AXIS*/ 0) + 1] = (ny *= flip);
						} else {
							rec = flip / max;
							toiData[(/*TOI_AXIS*/ 0)] = nx = (x4 * rec);
							toiData[(/*TOI_AXIS*/ 0) + 1] = ny = (y4 * rec);
						}
					}

					toiData[indA] = kX - (nx * max * flip);
					toiData[indA + 1] = kY - (ny * max * flip);
					return max;
				}
			}
		};

		// =====================================================================
		// Assumption, shapes have been updated by body.
		//   shapes must also be 'in' a Body for special contact data.
		// This method is not quite modular as test/distance
		// due to the complicated values required for contacts etc.
		// no AABB test performed here.
		Physics2DCollisionUtils.prototype._collide = function (shapeA, shapeB, arb) {
			if (shapeA._type === (/*TYPE_CIRCLE*/ 0)) {
				if (shapeB._type === (/*TYPE_CIRCLE*/ 0)) {
					return this._collideCircle2Circle(shapeA, shapeB, arb);
				} else {
					return this._collideCircle2Polygon(shapeA, shapeB, arb, false);
				}
			} else {
				if (shapeB._type === (/*TYPE_CIRCLE*/ 0)) {
					return this._collideCircle2Polygon(shapeB, shapeA, arb, true);
				} else {
					return this._collidePolygon2Polygon(shapeA, shapeB, arb);
				}
			}
		};

		Physics2DCollisionUtils.prototype._collideCircle2Polygon = function (circle, polygon, arb, reverse) {
			var dataC = circle._data;
			var dataP = polygon._data;

			var cx = dataC[(/*CIRCLE_WORLD*/ 9)];
			var cy = dataC[(/*CIRCLE_WORLD*/ 9) + 1];
			var radius = dataC[(/*CIRCLE_RADIUS*/ 6)];

			var max = Number.NEGATIVE_INFINITY;

			var edge, proj;
			var index = (/*POLY_VERTICES*/ 6);
			var limit = dataP.length;
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				proj = ((dataP[index + (/*POLY_WNORMAL*/ 6)] * cx) + (dataP[index + (/*POLY_WNORMAL*/ 6) + 1] * cy)) - (dataP[index + (/*POLY_WPROJ*/ 9)] + radius);
				if (proj > 0) {
					return false;
				}
				if (proj > max) {
					max = proj;
					edge = index;
				}
			}

			var adata = arb._data;
			var con, cdata;

			var nx = dataP[edge + (/*POLY_WNORMAL*/ 6)];
			var ny = dataP[edge + (/*POLY_WNORMAL*/ 6) + 1];
			var vX, vY, lvX, lvY;
			var dx, dy;
			proj = ((nx * cy) - (ny * cx));
			if (proj >= dataP[edge + (/*POLY_CROSS1*/ 10)]) {
				if (proj <= dataP[edge + (/*POLY_CROSS2*/ 11)]) {
					// circle center within voronoi region of edge.
					// Take contact point to be consistently halfway into the overlap.
					proj = (radius + (max * 0.5));
					dx = (nx * proj);
					dy = (ny * proj);

					con = arb._injectContact(cx - dx, cy - dy, (reverse ? nx : -nx), (reverse ? ny : -ny), max, (/*HASH_CIRCLE*/ 0));

					arb._faceType = (reverse ? (/*FACE_1*/ 1) : (/*FACE_2*/ 2));
					arb._reverse = !reverse;
					adata[(/*ARB_LNORM*/ 11)] = dataP[edge + (/*POLY_LNORMAL*/ 4)];
					adata[(/*ARB_LNORM*/ 11) + 1] = dataP[edge + (/*POLY_LNORMAL*/ 4) + 1];
					adata[(/*ARB_LPROJ*/ 13)] = dataP[edge + (/*POLY_LPROJ*/ 8)];
					adata[(/*ARB_RADIUS*/ 14)] = radius;

					cdata = con._data;
					cdata[(/*CON_LREL1*/ 13)] = dataC[(/*CIRCLE_LOCAL*/ 7)];
					cdata[(/*CON_LREL1*/ 13) + 1] = dataC[(/*CIRCLE_LOCAL*/ 7) + 1];
					return true;
				} else {
					var next = edge + (/*POLY_STRIDE*/ 13);
					if (next === limit) {
						next = (/*POLY_VERTICES*/ 6);
					}
					vX = dataP[next + (/*POLY_WORLD*/ 2)];
					vY = dataP[next + (/*POLY_WORLD*/ 2) + 1];
					lvX = dataP[next + (/*POLY_LOCAL*/ 0)];
					lvY = dataP[next + (/*POLY_LOCAL*/ 0) + 1];
				}
			} else {
				vX = dataP[edge + (/*POLY_WORLD*/ 2)];
				vY = dataP[edge + (/*POLY_WORLD*/ 2) + 1];
				lvX = dataP[edge + (/*POLY_LOCAL*/ 0)];
				lvY = dataP[edge + (/*POLY_LOCAL*/ 0) + 1];
			}

			// Circle - Vertex
			dx = (cx - vX);
			dy = (cy - vY);
			var dsq = ((dx * dx) + (dy * dy));
			if (dsq > (radius * radius)) {
				return false;
			}

			if (dsq < Physics2DConfig.NORMALIZE_SQ_EPSILON) {
				// Take contact point to be consistently halfway into the overlap.
				con = arb._injectContact(cx, cy, (reverse ? nx : -nx), (reverse ? ny : -ny), 0, (/*HASH_CIRCLE*/ 0));
			} else {
				var dist = Math.sqrt(dsq);
				var invDist = (1 / dist);
				var df = 0.5 + (radius * invDist * 0.5);
				if (!reverse) {
					invDist = -invDist;
				}

				// Take contact point to be consistently halfway into the overlap.
				con = arb._injectContact(cx - (dx * df), cy - (dy * df), dx * invDist, dy * invDist, dist - radius, (/*HASH_CIRCLE*/ 0));
			}

			cdata = con._data;
			if (reverse) {
				cdata[(/*CON_LREL1*/ 13)] = lvX;
				cdata[(/*CON_LREL1*/ 13) + 1] = lvY;
				cdata[(/*CON_LREL2*/ 15)] = dataC[(/*CIRCLE_LOCAL*/ 7)];
				cdata[(/*CON_LREL2*/ 15) + 1] = dataC[(/*CIRCLE_LOCAL*/ 7) + 1];
			} else {
				cdata[(/*CON_LREL1*/ 13)] = dataC[(/*CIRCLE_LOCAL*/ 7)];
				cdata[(/*CON_LREL1*/ 13) + 1] = dataC[(/*CIRCLE_LOCAL*/ 7) + 1];
				cdata[(/*CON_LREL2*/ 15)] = lvX;
				cdata[(/*CON_LREL2*/ 15) + 1] = lvY;
			}

			adata[(/*ARB_RADIUS*/ 14)] = radius;
			arb._faceType = (/*FACE_CIRCLE*/ 0);
			arb._reverse = false;

			return true;
		};

		Physics2DCollisionUtils.prototype._collidePolygon2Polygon = function (polyA, polyB, arb) {
			var inf = Number.POSITIVE_INFINITY;
			var dataA = polyA._data;
			var dataB = polyB._data;

			var limitA = dataA.length;
			var limitB = dataB.length;

			var i, j;
			var min, k, nx, ny;

			var max = -inf;
			var first, edge, proj;

			for (i = (/*POLY_VERTICES*/ 6); i < limitA; i += (/*POLY_STRIDE*/ 13)) {
				min = inf;
				nx = dataA[i + (/*POLY_WNORMAL*/ 6)];
				ny = dataA[i + (/*POLY_WNORMAL*/ 6) + 1];
				proj = dataA[i + (/*POLY_WPROJ*/ 9)];
				for (j = (/*POLY_VERTICES*/ 6); j < limitB; j += (/*POLY_STRIDE*/ 13)) {
					k = (nx * dataB[j + (/*POLY_WORLD*/ 2)]) + (ny * dataB[j + (/*POLY_WORLD*/ 2) + 1]);
					if (k < min) {
						min = k;
					}
					if ((min - proj) <= max) {
						break;
					}
				}
				min -= proj;
				if (min >= 0) {
					return false;
				}
				if (min > max) {
					max = min;
					edge = i;
					first = true;
				}
			}

			for (j = (/*POLY_VERTICES*/ 6); j < limitB; j += (/*POLY_STRIDE*/ 13)) {
				min = inf;
				nx = dataB[j + (/*POLY_WNORMAL*/ 6)];
				ny = dataB[j + (/*POLY_WNORMAL*/ 6) + 1];
				proj = dataB[j + (/*POLY_WPROJ*/ 9)];
				for (i = (/*POLY_VERTICES*/ 6); i < limitA; i += (/*POLY_STRIDE*/ 13)) {
					k = (nx * dataA[i + (/*POLY_WORLD*/ 2)]) + (ny * dataA[i + (/*POLY_WORLD*/ 2) + 1]);
					if (k < min) {
						min = k;
					}
					if ((min - proj) <= max) {
						break;
					}
				}
				min -= proj;
				if (min >= 0) {
					return false;
				}
				if (min > max) {
					max = min;
					edge = j;
					first = false;
				}
			}

			// swap data so first polygon owns seperating axis.
			var flip = (first ? 1 : -1);
			var bdata;
			if (!first) {
				dataA = polyB._data;
				dataB = polyA._data;
				limitA = dataA.length;
				limitB = dataB.length;
				bdata = polyA.body._data;
			} else {
				bdata = polyB.body._data;
			}

			nx = dataA[edge + (/*POLY_WNORMAL*/ 6)];
			ny = dataA[edge + (/*POLY_WNORMAL*/ 6) + 1];

			// Find witness edge on dataB (not necessarigly polyB)
			min = inf;
			var witness;
			for (j = (/*POLY_VERTICES*/ 6); j < limitB; j += (/*POLY_STRIDE*/ 13)) {
				k = (nx * dataB[j + (/*POLY_WNORMAL*/ 6)]) + (ny * dataB[j + (/*POLY_WNORMAL*/ 6) + 1]);
				if (k < min) {
					min = k;
					witness = j;
				}
			}

			var next = witness + (/*POLY_STRIDE*/ 13);
			if (next === limitB) {
				next = (/*POLY_VERTICES*/ 6);
			}

			var c1X = dataB[witness + (/*POLY_WORLD*/ 2)];
			var c1Y = dataB[witness + (/*POLY_WORLD*/ 2) + 1];
			var c2X = dataB[next + (/*POLY_WORLD*/ 2)];
			var c2Y = dataB[next + (/*POLY_WORLD*/ 2) + 1];

			var dvX = (c2X - c1X);
			var dvY = (c2Y - c1Y);
			var d1 = (c1X * ny) - (c1Y * nx);
			var d2 = (c2X * ny) - (c2Y * nx);
			var den = (1 / (d2 - d1));

			// clip c1
			var t = (-dataA[edge + (/*POLY_CROSS2*/ 11)] - d1) * den;
			if (t > Physics2DConfig.CLIP_EPSILON) {
				c1X += (dvX * t);
				c1Y += (dvY * t);
			}

			// clip c2
			t = (-dataA[edge + (/*POLY_CROSS1*/ 10)] - d2) * den;
			if (t < -Physics2DConfig.CLIP_EPSILON) {
				c2X += (dvX * t);
				c2Y += (dvY * t);
			}

			var adata = arb._data;
			adata[(/*ARB_LNORM*/ 11)] = dataA[edge + (/*POLY_LNORMAL*/ 4)];
			adata[(/*ARB_LNORM*/ 11) + 1] = dataA[edge + (/*POLY_LNORMAL*/ 4) + 1];
			adata[(/*ARB_LPROJ*/ 13)] = dataA[edge + (/*POLY_LPROJ*/ 8)];
			adata[(/*ARB_RADIUS*/ 14)] = 0.0;
			arb._faceType = (first ? (/*FACE_1*/ 1) : (/*FACE_2*/ 2));

			// Per contact distance
			proj = dataA[edge + (/*POLY_WPROJ*/ 9)];
			var c1d = ((c1X * nx) + (c1Y * ny)) - proj;
			var c2d = ((c2X * nx) + (c2Y * ny)) - proj;

			var p1x = bdata[(/*BODY_POS*/ 2)];
			var p1y = bdata[(/*BODY_POS*/ 2) + 1];
			var cos = bdata[(/*BODY_AXIS*/ 5)];
			var sin = bdata[(/*BODY_AXIS*/ 5) + 1];

			if (c1d > 0 && c2d > 0) {
				return false;
			}

			var rx = (c1X - p1x);
			var ry = (c1Y - p1y);
			c1X -= (nx * c1d * 0.5);
			c1Y -= (ny * c1d * 0.5);
			var con = arb._injectContact(c1X, c1Y, nx * flip, ny * flip, c1d, (first ? (/*HASH_LEFT*/ 1) : (/*HASH_RIGHT*/ 2)), c1d > 0)._data;
			con[(/*CON_LREL1*/ 13)] = ((cos * rx) + (sin * ry));
			con[(/*CON_LREL1*/ 13) + 1] = ((cos * ry) - (sin * rx));

			rx = (c2X - p1x);
			ry = (c2Y - p1y);
			c2X -= (nx * c2d * 0.5);
			c2Y -= (ny * c2d * 0.5);
			con = arb._injectContact(c2X, c2Y, nx * flip, ny * flip, c2d, (first ? (/*HASH_RIGHT*/ 2) : (/*HASH_LEFT*/ 1)), c2d > 0)._data;
			con[(/*CON_LREL1*/ 13)] = ((cos * rx) + (sin * ry));
			con[(/*CON_LREL1*/ 13) + 1] = ((cos * ry) - (sin * rx));

			arb._reverse = (!first);

			return true;
		};

		Physics2DCollisionUtils.prototype._collideCircle2Circle = function (circleA, circleB, arb) {
			var dataA = circleA._data;
			var dataB = circleB._data;

			var x1 = dataA[(/*CIRCLE_WORLD*/ 9)];
			var y1 = dataA[(/*CIRCLE_WORLD*/ 9) + 1];
			var r1 = dataA[(/*CIRCLE_RADIUS*/ 6)];

			var dx = (dataB[(/*CIRCLE_WORLD*/ 9)] - x1);
			var dy = (dataB[(/*CIRCLE_WORLD*/ 9) + 1] - y1);
			var rSum = r1 + dataB[(/*CIRCLE_RADIUS*/ 6)];

			var dsq = ((dx * dx) + (dy * dy));
			if (dsq > (rSum * rSum)) {
				return false;
			}

			var con;
			if (dsq < Physics2DConfig.NORMALIZE_SQ_EPSILON) {
				// Take contact point to be consistently halfway into the overlap.
				con = arb._injectContact(x1 + (dx * 0.5), y1 + (dy * 0.5), 1, 0, -rSum, (/*HASH_CIRCLE*/ 0));
			} else {
				var dist = Math.sqrt(dsq);
				var invDist = (1 / dist);
				var df = (0.5 + ((r1 - (0.5 * rSum)) * invDist));

				// Take contact point to be consistently halfway into the overlap.
				con = arb._injectContact(x1 + (dx * df), y1 + (dy * df), dx * invDist, dy * invDist, dist - rSum, (/*HASH_CIRCLE*/ 0));
			}

			var data = con._data;
			data[(/*CON_LREL1*/ 13)] = dataA[(/*CIRCLE_LOCAL*/ 7)];
			data[(/*CON_LREL1*/ 13) + 1] = dataA[(/*CIRCLE_LOCAL*/ 7) + 1];
			data[(/*CON_LREL2*/ 15)] = dataB[(/*CIRCLE_LOCAL*/ 7)];
			data[(/*CON_LREL2*/ 15) + 1] = dataB[(/*CIRCLE_LOCAL*/ 7) + 1];

			data = arb._data;
			data[(/*ARB_RADIUS*/ 14)] = rSum;
			arb._faceType = (/*FACE_CIRCLE*/ 0);

			return true;
		};

		// =====================================================================
		// Assumption, shapes have been updated by body.
		// need not be 'in' a body.
		// No AABB test performed here.
		Physics2DCollisionUtils.prototype._test = function (shapeA, shapeB) {
			if (shapeA._type === (/*TYPE_CIRCLE*/ 0)) {
				if (shapeB._type === (/*TYPE_CIRCLE*/ 0)) {
					return this._testCircle2Circle(shapeA, shapeB);
				} else {
					return this._testCircle2Polygon(shapeA, shapeB);
				}
			} else {
				if (shapeB._type === (/*TYPE_CIRCLE*/ 0)) {
					return this._testCircle2Polygon(shapeB, shapeA);
				} else {
					return this._testPolygon2Polygon(shapeA, shapeB);
				}
			}
		};

		Physics2DCollisionUtils.prototype._testCircle2Circle = function (circleA, circleB) {
			var dataA = circleA._data;
			var dataB = circleB._data;

			var dx = (dataA[(/*CIRCLE_WORLD*/ 9)] - dataB[(/*CIRCLE_WORLD*/ 9)]);
			var dy = (dataA[(/*CIRCLE_WORLD*/ 9) + 1] - dataB[(/*CIRCLE_WORLD*/ 9) + 1]);
			var rSum = dataA[(/*CIRCLE_RADIUS*/ 6)] + dataB[(/*CIRCLE_RADIUS*/ 6)];

			return (((dx * dx) + (dy * dy)) <= (rSum * rSum));
		};

		Physics2DCollisionUtils.prototype._testCircle2Polygon = function (circle, polygon) {
			var dataC = circle._data;
			var dataP = polygon._data;

			var cx = dataC[(/*CIRCLE_WORLD*/ 9)];
			var cy = dataC[(/*CIRCLE_WORLD*/ 9) + 1];
			var radius = dataC[(/*CIRCLE_RADIUS*/ 6)];

			var max = Number.NEGATIVE_INFINITY;
			var edge, proj;

			var index = (/*POLY_VERTICES*/ 6);
			var limit = dataP.length;
			for (; index < limit; index += (/*POLY_STRIDE*/ 13)) {
				// proj = world-normal dot position
				proj = ((dataP[index + (/*POLY_WNORMAL*/ 6)] * cx) + (dataP[index + (/*POLY_WNORMAL*/ 6) + 1] * cy));
				var dist = proj - (radius + dataP[index + (/*POLY_WPROJ*/ 9)]);
				if (dist > 0) {
					return false;
				}

				if (dist > max) {
					max = dist;
					edge = index;
				}
			}

			// proj = world-normal perpdot position
			proj = ((dataP[edge + (/*POLY_WNORMAL*/ 6)] * cy) - (dataP[edge + (/*POLY_WNORMAL*/ 6) + 1] * cx));
			if (proj >= dataP[edge + (/*POLY_CROSS1*/ 10)]) {
				if (proj <= dataP[edge + (/*POLY_CROSS2*/ 11)]) {
					// circle center is within voronoi region of edge.
					return true;
				} else {
					// skip to next edge.
					edge += (/*POLY_STRIDE*/ 13);
					if (edge === limit) {
						edge = (/*POLY_VERTICES*/ 6);
					}
				}
			}

			// Perform circle-vertex check.
			// delta = position - vertex
			var dx = (cx - dataP[edge + (/*POLY_WORLD*/ 2)]);
			var dy = (cy - dataP[edge + (/*POLY_WORLD*/ 2) + 1]);
			return (((dx * dx) + (dy * dy)) <= (radius * radius));
		};

		Physics2DCollisionUtils.prototype._testPolygon2Polygon = function (polyA, polyB) {
			var inf = Number.POSITIVE_INFINITY;
			var dataA = polyA._data;
			var dataB = polyB._data;

			var limitA = dataA.length;
			var limitB = dataB.length;

			var i, j;
			var min, proj, nx, ny;

			for (i = (/*POLY_VERTICES*/ 6); i < limitA; i += (/*POLY_STRIDE*/ 13)) {
				min = inf;
				nx = dataA[i + (/*POLY_WNORMAL*/ 6)];
				ny = dataA[i + (/*POLY_WNORMAL*/ 6) + 1];
				for (j = (/*POLY_VERTICES*/ 6); j < limitB; j += (/*POLY_STRIDE*/ 13)) {
					proj = (nx * dataB[j + (/*POLY_WORLD*/ 2)]) + (ny * dataB[j + (/*POLY_WORLD*/ 2) + 1]);
					if (proj < min) {
						min = proj;
					}
				}
				if (min > dataA[i + (/*POLY_WPROJ*/ 9)]) {
					return false;
				}
			}

			for (j = (/*POLY_VERTICES*/ 6); j < limitB; j += (/*POLY_STRIDE*/ 13)) {
				min = inf;
				nx = dataB[j + (/*POLY_WNORMAL*/ 6)];
				ny = dataB[j + (/*POLY_WNORMAL*/ 6) + 1];
				for (i = (/*POLY_VERTICES*/ 6); i < limitA; i += (/*POLY_STRIDE*/ 13)) {
					proj = (nx * dataA[i + (/*POLY_WORLD*/ 2)]) + (ny * dataA[i + (/*POLY_WORLD*/ 2) + 1]);
					if (proj < min) {
						min = proj;
					}
				}
				if (min > dataB[j + (/*POLY_WPROJ*/ 9)]) {
					return false;
				}
			}

			return true;
		};

		Physics2DCollisionUtils.create = function () {
			var c = new Physics2DCollisionUtils();
			c._toi = Physics2DTOIEvent.allocate();
			return c;
		};

		return Physics2DCollisionUtils;
})