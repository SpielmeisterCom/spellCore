
// =========================================================================
//
// Point Constraint
//
// POINT DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*POINT_LANCHOR1*/5  // Locally defined anchor on first body.
///*POINT_LANCHOR2*/7  // Locally defined anchor on second body.
///*POINT_RANCHOR1*/9  // Relatively defined anchor on first body.
///*POINT_RANCHOR2*/11 // Relatively defined anchor on second body.
///*POINT_KMASS*/13    // Effective mass matrix [ a b ; b c] symmetric.
///*POINT_JACC*/16     // Accumulated impulses (x, y).
///*POINT_JMAX*/18     // Maximimum impulse magnitude (maxForce derived).
///*POINT_GAMMA*/19    // Gamma for soft constraint.
///*POINT_BIAS*/20     // Bias for soft constraint (x, y) (maxError derived).
//
///*POINT_DATA_SIZE*/22
define(
	'spell/physics/2D/PointConstraint',
	[
		'spell/physics/2D/Config',
		'spell/physics/2D/Constraint',
		'spell/shared/util/platform/Types'
	],
	function(
		Physics2DConfig,
		Physics2DConstraint,
		Types
		) {
		var __extends = function (d, b) {
			for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
			function __() { this.constructor = d; }
			__.prototype = b.prototype;
			d.prototype = new __();
		};

		var Physics2DPointConstraint = function() {
			Physics2DConstraint.apply(this, arguments);
			this.type = "POINT";
			this.dimension = 2;
			// ===============================================
			// Inherited
			this._ANCHOR_A = (/*POINT_LANCHOR1*/ 5);
			this._ANCHOR_B = (/*POINT_LANCHOR2*/ 7);
			// =========================================================
			// Inherited
			this._JACC = (/*POINT_JACC*/ 16);
		}

		__extends(Physics2DPointConstraint, Physics2DConstraint);


		Physics2DPointConstraint.prototype._preStep = function (deltaTime) {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			Physics2DConstraint.prototype.rotateAnchor(data, b1, (/*POINT_LANCHOR1*/ 5), (/*POINT_RANCHOR1*/ 9));
			var rx1 = data[(/*POINT_RANCHOR1*/ 9)];
			var ry1 = data[(/*POINT_RANCHOR1*/ 9) + 1];

			Physics2DConstraint.prototype.rotateAnchor(data, b2, (/*POINT_LANCHOR2*/ 7), (/*POINT_RANCHOR2*/ 11));
			var rx2 = data[(/*POINT_RANCHOR2*/ 11)];
			var ry2 = data[(/*POINT_RANCHOR2*/ 11) + 1];

			// Compute non-inverted effective mass.
			var massSum = (b1[(/*BODY_IMASS*/ 0)] + b2[(/*BODY_IMASS*/ 0)]);
			var ii1 = b1[(/*BODY_IINERTIA*/ 1)];
			var ii2 = b2[(/*BODY_IINERTIA*/ 1)];
			data[(/*POINT_KMASS*/ 13)] = massSum + (ry1 * ii1 * ry1) + (ry2 * ii2 * ry2);
			data[(/*POINT_KMASS*/ 13) + 1] = -(rx1 * ii1 * ry1) - (rx2 * ii2 * ry2);
			data[(/*POINT_KMASS*/ 13) + 2] = massSum + (rx1 * ii1 * rx1) + (rx2 * ii2 * rx2);

			// Invert effective mass
			Physics2DConstraint.prototype.safe_invert2(data, (/*POINT_KMASS*/ 13), (/*POINT_JACC*/ 16));

			if (!this._stiff) {
				data[(/*POINT_BIAS*/ 20)] = ((b1[(/*BODY_POS*/ 2)] + rx1) - (b2[(/*BODY_POS*/ 2)] + rx2));
				data[(/*POINT_BIAS*/ 20) + 1] = ((b1[(/*BODY_POS*/ 2) + 1] + ry1) - (b2[(/*BODY_POS*/ 2) + 1] + ry2));
				if (Physics2DConstraint.prototype.soft_params2(data, (/*POINT_KMASS*/ 13), (/*POINT_GAMMA*/ 19), (/*POINT_BIAS*/ 20), deltaTime, this._breakUnderError)) {
					return true;
				}
			} else {
				data[(/*POINT_GAMMA*/ 19)] = 0.0;
				data[(/*POINT_BIAS*/ 20)] = 0.0;
				data[(/*POINT_BIAS*/ 20) + 1] = 0.0;
			}

			var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
			data[(/*POINT_JACC*/ 16)] *= dtRatio;
			data[(/*POINT_JACC*/ 16) + 1] *= dtRatio;
			data[(/*POINT_JMAX*/ 18)] = (data[(/*JOINT_MAX_FORCE*/ 2)] * deltaTime);

			return false;
		};

		Physics2DPointConstraint.prototype._warmStart = function () {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var jx = data[(/*POINT_JACC*/ 16)];
			var jy = data[(/*POINT_JACC*/ 16) + 1];

			var im = b1[(/*BODY_IMASS*/ 0)];
			b1[(/*BODY_VEL*/ 7)] -= (jx * im);
			b1[(/*BODY_VEL*/ 7) + 1] -= (jy * im);
			b1[(/*BODY_VEL*/ 7) + 2] -= (((data[(/*POINT_RANCHOR1*/ 9)] * jy) - (data[(/*POINT_RANCHOR1*/ 9) + 1] * jx)) * b1[(/*BODY_IINERTIA*/ 1)]);

			im = b2[(/*BODY_IMASS*/ 0)];
			b2[(/*BODY_VEL*/ 7)] += (jx * im);
			b2[(/*BODY_VEL*/ 7) + 1] += (jy * im);
			b2[(/*BODY_VEL*/ 7) + 2] += (((data[(/*POINT_RANCHOR2*/ 11)] * jy) - (data[(/*POINT_RANCHOR2*/ 11) + 1] * jx)) * b2[(/*BODY_IINERTIA*/ 1)]);
		};

		Physics2DPointConstraint.prototype.getImpulseForBody = function (body, dst /*v2*/ ) {
			if (dst === undefined) {
				dst = Types.createFloatArray(3);
			}

			var data = this._data;

			var jx = data[(/*POINT_JACC*/ 16)];
			var jy = data[(/*POINT_JACC*/ 16) + 1];

			if (body === this.bodyA) {
				dst[0] = -jx;
				dst[1] = -jy;
				dst[2] = -((data[(/*WELD_RANCHOR1*/ 9)] * jy) - (data[(/*WELD_RANCHOR1*/ 9) + 1] * jx));
			} else if (body === this.bodyB) {
				dst[0] = jx;
				dst[1] = jy;
				dst[2] = ((data[(/*WELD_RANCHOR2*/ 11)] * jy) - (data[(/*WELD_RANCHOR2*/ 11) + 1] * jx));
			} else {
				dst[0] = dst[1] = dst[2] = 0;
			}

			return dst;
		};

		Physics2DPointConstraint.prototype._iterateVel = function () {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var rx1 = data[(/*POINT_RANCHOR1*/ 9)];
			var ry1 = data[(/*POINT_RANCHOR1*/ 9) + 1];
			var rx2 = data[(/*POINT_RANCHOR2*/ 11)];
			var ry2 = data[(/*POINT_RANCHOR2*/ 11) + 1];

			// (x, y) = Bias - VelocityError
			var vw1 = b1[(/*BODY_VEL*/ 7) + 2];
			var vw2 = b2[(/*BODY_VEL*/ 7) + 2];
			var x = (data[(/*POINT_BIAS*/ 20)] - (b2[(/*BODY_VEL*/ 7)] - (ry2 * vw2)) + (b1[(/*BODY_VEL*/ 7)] - (ry1 * vw1)));
			var y = (data[(/*POINT_BIAS*/ 20) + 1] - (b2[(/*BODY_VEL*/ 7) + 1] + (rx2 * vw2)) + (b1[(/*BODY_VEL*/ 7) + 1] + (rx1 * vw1)));

			var jOldX = data[(/*POINT_JACC*/ 16)];
			var jOldY = data[(/*POINT_JACC*/ 16) + 1];
			var Kb = data[(/*POINT_KMASS*/ 13) + 1];
			var gamma = data[(/*POINT_GAMMA*/ 19)];

			// Impulse.
			// (jx, jy) = K * (x, y) - (JAcc * gamma);
			var jx = ((data[(/*POINT_KMASS*/ 13)] * x) + (Kb * y)) - (jOldX * gamma);
			var jy = ((Kb * x) + (data[(/*POINT_KMASS*/ 13) + 2] * y)) - (jOldY * gamma);

			// Accumulate and clamp.
			var jAccX = (jOldX + jx);
			var jAccY = (jOldY + jy);
			var jsq = ((jAccX * jAccX) + (jAccY * jAccY));
			var jMax = data[(/*POINT_JMAX*/ 18)];
			if (this._breakUnderForce) {
				if (jsq > (jMax * jMax)) {
					return true;
				}
			} else if (!this._stiff) {
				if (jsq > (jMax * jMax)) {
					jsq = (jMax / Math.sqrt(jsq));
					jAccX *= jsq;
					jAccY *= jsq;
				}
			}

			jx = (jAccX - jOldX);
			jy = (jAccY - jOldY);
			data[(/*POINT_JACC*/ 16)] = jAccX;
			data[(/*POINT_JACC*/ 16) + 1] = jAccY;

			// Apply impulse
			var im = b1[(/*BODY_IMASS*/ 0)];
			b1[(/*BODY_VEL*/ 7)] -= (jx * im);
			b1[(/*BODY_VEL*/ 7) + 1] -= (jy * im);
			b1[(/*BODY_VEL*/ 7) + 2] -= (((rx1 * jy) - (ry1 * jx)) * b1[(/*BODY_IINERTIA*/ 1)]);

			im = b2[(/*BODY_IMASS*/ 0)];
			b2[(/*BODY_VEL*/ 7)] += (jx * im);
			b2[(/*BODY_VEL*/ 7) + 1] += (jy * im);
			b2[(/*BODY_VEL*/ 7) + 2] += (((rx2 * jy) - (ry2 * jx)) * b2[(/*BODY_IINERTIA*/ 1)]);

			return false;
		};

		Physics2DPointConstraint.prototype._iteratePos = function () {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var im1 = b1[(/*BODY_IMASS*/ 0)];
			var im2 = b2[(/*BODY_IMASS*/ 0)];
			var ii1 = b1[(/*BODY_IINERTIA*/ 1)];
			var ii2 = b2[(/*BODY_IINERTIA*/ 1)];

			Physics2DConstraint.prototype.rotateAnchor(data, b1, (/*POINT_LANCHOR1*/ 5), (/*POINT_RANCHOR1*/ 9));
			var rx1 = data[(/*POINT_RANCHOR1*/ 9)];
			var ry1 = data[(/*POINT_RANCHOR1*/ 9) + 1];

			Physics2DConstraint.prototype.rotateAnchor(data, b2, (/*POINT_LANCHOR2*/ 7), (/*POINT_RANCHOR2*/ 11));
			var rx2 = data[(/*POINT_RANCHOR2*/ 11)];
			var ry2 = data[(/*POINT_RANCHOR2*/ 11) + 1];

			// Positional error
			var errX = ((b1[(/*BODY_POS*/ 2)] + rx1) - (b2[(/*BODY_POS*/ 2)] + rx2));
			var errY = ((b1[(/*BODY_POS*/ 2) + 1] + ry1) - (b2[(/*BODY_POS*/ 2) + 1] + ry2));
			var elsq = ((errX * errX) + (errY * errY));
			var maxError = data[(/*JOINT_MAX_ERROR*/ 3)];
			if (this._breakUnderError && (elsq > (maxError * maxError))) {
				return true;
			}

			if (elsq < Physics2DConfig.POINT_SLOP_SQ) {
				return false;
			}

			var scale = Physics2DConfig.POINT_BIAS_COEF;
			errX *= scale;
			errY *= scale;
			elsq *= (scale * scale);

			var massSum = (im1 + im2);
			var jx, jy;

			// Handle large seperation  for stability
			if (elsq > Physics2DConfig.POINT_LARGE_ERROR_SQ) {
				if (massSum > Physics2DConfig.EFF_MASS_EPSILON) {
					// We resolve error assuming infinite inertia (ignore rotation).
					var K = (Physics2DConfig.POINT_LARGE_ERROR_BIAS / massSum);
					jx = (errX * K);
					jy = (errY * K);

					// Clamp
					var jsq = ((jx * jx) + (jy * jy));
					var maxJ = Physics2DConfig.POINT_LARGE_ERROR_MAX;
					if (jsq > (maxJ * maxJ)) {
						jsq = (maxJ / Math.sqrt(jsq));
						jx *= jsq;
						jy *= jsq;
					}

					// Apply impulse
					b1[(/*BODY_POS*/ 2)] -= (jx * im1);
					b1[(/*BODY_POS*/ 2) + 1] -= (jy * im1);
					b2[(/*BODY_POS*/ 2)] += (jx * im1);
					b2[(/*BODY_POS*/ 2) + 1] += (jy * im1);

					// Recompute error.
					errX = ((b1[(/*BODY_POS*/ 2)] + rx1) - (b2[(/*BODY_POS*/ 2)] + rx2));
					errY = ((b1[(/*BODY_POS*/ 2) + 1] + ry1) - (b2[(/*BODY_POS*/ 2) + 1] + ry2));
					errX *= scale;
					errY *= scale;
					elsq = ((errX * errX) + (errY * errY));
				}
			}

			// Compute non-inverted effective mass.
			data[(/*POINT_KMASS*/ 13)] = (massSum + (ry1 * ii1 * ry1) + (ry2 * ii2 * ry2));
			data[(/*POINT_KMASS*/ 13) + 1] = (-(rx1 * ii1 * ry1) - (rx2 * ii2 * ry2));
			data[(/*POINT_KMASS*/ 13) + 2] = (massSum + (rx1 * ii1 * rx1) + (rx2 * ii2 * rx2));

			if (elsq > Physics2DConfig.POINT_MAX_ERROR_SQ) {
				elsq = (Physics2DConfig.POINT_MAX_ERROR / Math.sqrt(elsq));
				errX *= elsq;
				errY *= elsq;
			}

			data[(/*POINT_BIAS*/ 20)] = errX;
			data[(/*POINT_BIAS*/ 20) + 1] = errY;
			Physics2DConstraint.prototype.safe_solve2(data, (/*POINT_KMASS*/ 13), (/*POINT_BIAS*/ 20), (/*POINT_BIAS*/ 20));
			jx = data[(/*POINT_BIAS*/ 20)];
			jy = data[(/*POINT_BIAS*/ 20) + 1];

			// Apply impulse
			b1[(/*BODY_POS*/ 2)] -= (jx * im1);
			b1[(/*BODY_POS*/ 2) + 1] -= (jy * im1);
			var dW = -(((rx1 * jy) - (ry1 * jx)) * ii1);
			if (dW !== 0) {
				this.bodyA._deltaRotation(dW);
			}

			b2[(/*BODY_POS*/ 2)] += (jx * im2);
			b2[(/*BODY_POS*/ 2) + 1] += (jy * im2);
			dW = (((rx2 * jy) - (ry2 * jx)) * ii2);
			if (dW !== 0) {
				this.bodyB._deltaRotation(dW);
			}

			return false;
		};

		// params = {
		//   bodyA, bodyB,
		//   anchorA, anchorB,
		//   ... common constraint params
		// }
		Physics2DPointConstraint.create = function (params) {
			var p = new Physics2DPointConstraint();
			var data = p._data = Types.createFloatArray((/*POINT_DATA_SIZE*/ 22));
			Physics2DConstraint.prototype.init(p, params);

			var anchor = params.anchorA;
			data[(/*POINT_LANCHOR1*/ 5)] = (anchor ? anchor[0] : 0);
			data[(/*POINT_LANCHOR1*/ 5) + 1] = (anchor ? anchor[1] : 0);

			anchor = params.anchorB;
			data[(/*POINT_LANCHOR2*/ 7)] = (anchor ? anchor[0] : 0);
			data[(/*POINT_LANCHOR2*/ 7) + 1] = (anchor ? anchor[1] : 0);

			p.bodyA = params.bodyA;
			p.bodyB = params.bodyB;

			return p;
		};

		// Inherited
		Physics2DPointConstraint.prototype._inWorld = Physics2DConstraint.prototype.twoBodyInWorld;
		Physics2DPointConstraint.prototype._outWorld = Physics2DConstraint.prototype.twoBodyOutWorld;
		Physics2DPointConstraint.prototype._pairExists = Physics2DConstraint.prototype.twoBodyPairExists;
		Physics2DPointConstraint.prototype._wakeConnected = Physics2DConstraint.prototype.twoBodyWakeConnected;
		Physics2DPointConstraint.prototype._sleepComputation = Physics2DConstraint.prototype.twoBodySleepComputation;


		Physics2DPointConstraint.prototype._draw = function pointDrawFn(debug) {
			var colA = (this.sleeping ? debug.constraintSleepingColorA : debug.constraintColorA);
			var colB = (this.sleeping ? debug.constraintSleepingColorB : debug.constraintColorB);
			var colE = (this.sleeping ? debug.constraintErrorSleepingColorC : debug.constraintErrorColorC);

			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var x1 = (b1[(/*BODY_POS*/ 2)] + data[(/*POINT_RANCHOR1*/ 9)]);
			var y1 = (b1[(/*BODY_POS*/ 2) + 1] + data[(/*POINT_RANCHOR1*/ 9) + 1]);
			var x2 = (b2[(/*BODY_POS*/ 2)] + data[(/*POINT_RANCHOR2*/ 11)]);
			var y2 = (b2[(/*BODY_POS*/ 2) + 1] + data[(/*POINT_RANCHOR2*/ 11) + 1]);

			var rad = (debug.constraintAnchorRadius * debug.screenToPhysics2D);
			debug._drawAnchor(x1, y1, rad, colA);
			debug._drawAnchor(x2, y2, rad, colB);

			if (this._stiff) {
				debug.drawLine(x1, y1, x2, y2, colE);
			} else {
				var numCoils = debug.constraintSpringNumCoils;
				var radius = (debug.constraintSpringRadius * debug.screenToPhysics2D);
				debug.drawLinearSpring(x1, y1, x2, y2, numCoils, radius, colE);
			}
		};
		return Physics2DPointConstraint;
})