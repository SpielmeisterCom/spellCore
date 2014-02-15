

// =========================================================================
//
// Line Constraint
//
// LINE DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*LINE_JOINTMIN*/5   // Joint limits (axial)
///*LINE_JOINTMAX*/6   //
///*LINE_LANCHOR1*/7   // Local anchor on bodyA (x, y)
///*LINE_LANCHOR2*/9   // Local anchor on bodyB (x, y)
///*LINE_LAXIS*/11     // Local axis on bodyA (x, y)
///*LINE_RANCHOR1*/13  // Relative anchor on bodyA (x, y)
///*LINE_RANCHOR2*/15  // Relative anchor on bodyB (x, y)
///*LINE_RAXIS*/17     // Relative/World axis on bodyA (x, y)
///*LINE_KMASS*/19     // Effective mass [a b; b c] (symmetric)
///*LINE_JACC*/22      // Accumulated impuse (x, y)
///*LINE_JMAX*/24      // Maximum impulse magnitude
///*LINE_GAMMA*/25     // Soft constraint gamma
///*LINE_BIAS*/26      // Soft constraint bias (x, y)
///*LINE_CX1*/28
///*LINE_CX2*/29
///*LINE_DOT1*/30
///*LINE_DOT2*/31
///*LINE_SCALE*/32     // Direction scaling of axis.
//
///*LINE_DATA_SIZE*/33
define(
	'spell/physics/2D/LineConstraint',
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

		var Physics2DLineConstraint = function() {
			Physics2DConstraint.apply(this, arguments);
			this.type = "LINE";
			this.dimension = 2;
			// Inherited
			this._ANCHOR_A = (/*LINE_LANCHOR1*/ 7);
			this._ANCHOR_B = (/*LINE_LANCHOR2*/ 9);
			// ==========================================================
			// Inherited
			this._JACC = (/*LINE_JACC*/ 22);
		}

		__extends(Physics2DLineConstraint, Physics2DConstraint);


		// ===============================================
		Physics2DLineConstraint.prototype.getLowerBound = function () {
			return this._data[(/*LINE_JOINTMIN*/ 5)];
		};
		Physics2DLineConstraint.prototype.getUpperBound = function () {
			return this._data[(/*LINE_JOINTMAX*/ 6)];
		};

		Physics2DLineConstraint.prototype.setLowerBound = function (lowerBound) {
			var data = this._data;
			if (data[(/*LINE_JOINTMIN*/ 5)] !== lowerBound) {
				data[(/*LINE_JOINTMIN*/ 5)] = lowerBound;
				this._equal = (lowerBound === data[(/*LINE_JOINTMAX*/ 6)]);
				this.wake(true);
			}
		};
		Physics2DLineConstraint.prototype.setUpperBound = function (upperBound) {
			var data = this._data;
			if (data[(/*LINE_JOINTMAX*/ 6)] !== upperBound) {
				data[(/*LINE_JOINTMAX*/ 6)] = upperBound;
				this._equal = (upperBound === data[(/*LINE_JOINTMIN*/ 5)]);
				this.wake(true);
			}
		};

		Physics2DLineConstraint.prototype.getAxis = function (dst /*v2*/ ) {
			if (dst === undefined) {
				dst = Types.createFloatArray(2);
			}
			var data = this._data;
			dst[0] = data[(/*LINE_LAXIS*/ 11)];
			dst[1] = data[(/*LINE_LAXIS*/ 11) + 1];
			return dst;
		};
		Physics2DLineConstraint.prototype.setAxis = function (axis /*v2*/ ) {
			var data = this._data;
			var newX = axis[0];
			var newY = axis[1];
			if (newX !== data[(/*LINE_LAXIS*/ 11)] || newY !== data[(/*LINE_LAXIS*/ 11) + 1]) {
				var nlsq = ((newX * newX) + (newY * newY));
				if (nlsq === 0) {
					return;
				} else {
					nlsq = (1 / Math.sqrt(nlsq));
					newX *= nlsq;
					newY *= nlsq;
				}
				data[(/*LINE_LAXIS*/ 11)] = newX;
				data[(/*LINE_LAXIS*/ 11) + 1] = newY;
				this.wake(true);
			}
		};

		Physics2DLineConstraint.prototype._posError = function () {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			Physics2DConstraint.prototype.rotateAnchor(data, b1, (/*LINE_LANCHOR1*/ 7), (/*LINE_RANCHOR1*/ 13));
			Physics2DConstraint.prototype.rotateAnchor(data, b2, (/*LINE_LANCHOR2*/ 9), (/*LINE_RANCHOR2*/ 15));
			Physics2DConstraint.prototype.rotateAnchor(data, b1, (/*LINE_LAXIS*/ 11), (/*LINE_RAXIS*/ 17));

			var jointMin = data[(/*LINE_JOINTMIN*/ 5)];
			var jointMax = data[(/*LINE_JOINTMAX*/ 6)];

			var rx1 = data[(/*LINE_RANCHOR1*/ 13)];
			var ry1 = data[(/*LINE_RANCHOR1*/ 13) + 1];
			var rx2 = data[(/*LINE_RANCHOR2*/ 15)];
			var ry2 = data[(/*LINE_RANCHOR2*/ 15) + 1];
			var nx = data[(/*LINE_RAXIS*/ 17)];
			var ny = data[(/*LINE_RAXIS*/ 17) + 1];

			// Store (dx, dy) in (cx1, cx2) temporarigly.
			// As this information is needed in subsequent calculations for eff-mass.
			// We take care not to alias values!
			var dx = data[(/*LINE_CX1*/ 28)] = ((b2[(/*BODY_POS*/ 2)] + rx2) - (b1[(/*BODY_POS*/ 2)] + rx1));
			var dy = data[(/*LINE_CX2*/ 29)] = ((b2[(/*BODY_POS*/ 2) + 1] + ry2) - (b1[(/*BODY_POS*/ 2) + 1] + ry1));

			var errX = ((nx * dy) - (ny * dx));
			var errY = ((nx * dx) + (ny * dy));
			if (this._equal) {
				errY -= jointMin;
				data[(/*LINE_SCALE*/ 32)] = 1.0;
			} else {
				if (errY > jointMax) {
					errY -= jointMax;
					data[(/*LINE_SCALE*/ 32)] = 1.0;
				} else if (errY < jointMin) {
					errY = (jointMin - errY);
					data[(/*LINE_SCALE*/ 32)] = -1.0;
				} else {
					errY = 0;
					data[(/*LINE_SCALE*/ 32)] = 0.0;
				}
			}

			data[(/*LINE_BIAS*/ 26)] = (-errX);
			data[(/*LINE_BIAS*/ 26) + 1] = (-errY);
		};

		Physics2DLineConstraint.prototype._preStep = function (deltaTime) {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			// Must compute (dx, dy) (stored into cx1/cx2)
			// As well as scale for eff-mass computation.
			this._posError();

			// Compute non-inverted effective mass.
			var rx1 = data[(/*LINE_RANCHOR1*/ 13)];
			var ry1 = data[(/*LINE_RANCHOR1*/ 13) + 1];
			var rx2 = data[(/*LINE_RANCHOR2*/ 15)];
			var ry2 = data[(/*LINE_RANCHOR2*/ 15) + 1];
			var nx = data[(/*LINE_RAXIS*/ 17)];
			var ny = data[(/*LINE_RAXIS*/ 17) + 1];
			var scale = data[(/*LINE_SCALE*/ 32)];
			var delX = (data[(/*LINE_CX1*/ 28)] + rx1);
			var delY = (data[(/*LINE_CX2*/ 29)] + ry1);

			var cx1 = data[(/*LINE_CX1*/ 28)] = (nx * delY) - (ny * delX);
			var cx2 = data[(/*LINE_CX2*/ 29)] = (nx * ry2) - (ny * rx2);
			var dot1 = data[(/*LINE_DOT1*/ 30)] = (nx * delX) + (ny * delY);
			var dot2 = data[(/*LINE_DOT2*/ 31)] = (nx * rx2) + (ny * ry2);

			var massSum = (b1[(/*BODY_IMASS*/ 0)] + b2[(/*BODY_IMASS*/ 0)]);
			var ii1 = b1[(/*BODY_IINERTIA*/ 1)];
			var ii2 = b2[(/*BODY_IINERTIA*/ 1)];

			data[(/*LINE_KMASS*/ 19)] = massSum + (dot1 * ii1 * dot1) + (dot2 * ii2 * dot2);
			data[(/*LINE_KMASS*/ 19) + 1] = -scale * ((dot1 * ii1 * cx1) + (dot2 * ii2 * cx2));
			data[(/*LINE_KMASS*/ 19) + 2] = scale * scale * (massSum + (cx1 * ii1 * cx1) + (cx2 * ii2 * cx2));

			// Invert effective mass.
			Physics2DConstraint.prototype.safe_invert2(data, (/*LINE_KMASS*/ 19), (/*LINE_JACC*/ 22));

			if (!this._stiff) {
				if (Physics2DConstraint.prototype.soft_params2(data, (/*LINE_KMASS*/ 19), (/*LINE_GAMMA*/ 25), (/*LINE_BIAS*/ 26), deltaTime, this._breakUnderError)) {
					return true;
				}
			} else {
				data[(/*LINE_GAMMA*/ 25)] = 0;
				data[(/*LINE_BIAS*/ 26)] = 0;
				data[(/*LINE_BIAS*/ 26) + 1] = 0;
			}

			var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
			data[(/*LINE_JACC*/ 22)] *= dtRatio;
			data[(/*LINE_JACC*/ 22) + 1] *= dtRatio;
			data[(/*LINE_JMAX*/ 24)] = (data[(/*JOINT_MAX_FORCE*/ 2)] * deltaTime);

			return false;
		};

		Physics2DLineConstraint.prototype._warmStart = function () {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var jx = data[(/*LINE_JACC*/ 22)];
			var jy = data[(/*LINE_JACC*/ 22) + 1];
			var scale = data[(/*LINE_SCALE*/ 32)];
			var nx = data[(/*LINE_RAXIS*/ 17)];
			var ny = data[(/*LINE_RAXIS*/ 17) + 1];

			var lx = (scale * nx * jy) - (ny * jx);
			var ly = (nx * jx) + (scale * ny * jy);

			var im = b1[(/*BODY_IMASS*/ 0)];
			b1[(/*BODY_VEL*/ 7)] -= (lx * im);
			b1[(/*BODY_VEL*/ 7) + 1] -= (ly * im);
			b1[(/*BODY_VEL*/ 7) + 2] += (((scale * data[(/*LINE_CX1*/ 28)] * jy) - (data[(/*LINE_DOT1*/ 30)] * jx)) * b1[(/*BODY_IINERTIA*/ 1)]);

			im = b2[(/*BODY_IMASS*/ 0)];
			b2[(/*BODY_VEL*/ 7)] += (lx * im);
			b2[(/*BODY_VEL*/ 7) + 1] += (ly * im);
			b2[(/*BODY_VEL*/ 7) + 2] += (((data[(/*LINE_DOT2*/ 31)] * jx) - (scale * data[(/*LINE_CX2*/ 29)] * jy)) * b2[(/*BODY_IINERTIA*/ 1)]);
		};

		Physics2DLineConstraint.prototype.getImpulseForBody = function (body, dst /*v2*/ ) {
			if (dst === undefined) {
				dst = Types.createFloatArray(3);
			}

			var data = this._data;
			var jx = data[(/*LINE_JACC*/ 22)];
			var jy = data[(/*LINE_JACC*/ 22) + 1];
			var scale = data[(/*LINE_SCALE*/ 32)];
			var nx = data[(/*LINE_RAXIS*/ 17)];
			var ny = data[(/*LINE_RAXIS*/ 17) + 1];

			var lx = (scale * nx * jy) - (ny * jx);
			var ly = (nx * jx) + (scale * ny * jy);

			if (body === this.bodyA) {
				dst[0] = -lx;
				dst[1] = -ly;
				dst[2] = ((scale * data[(/*LINE_CX1*/ 28)] * jy) - (data[(/*LINE_DOT1*/ 30)] * jx));
			} else if (body === this.bodyB) {
				dst[0] = lx;
				dst[1] = ly;
				dst[2] = ((data[(/*LINE_DOT2*/ 31)] * jx) - (scale * data[(/*LINE_CX2*/ 29)] * jy));
			} else {
				dst[0] = dst[1] = dst[2] = 0;
			}

			return dst;
		};

		Physics2DLineConstraint.prototype._iterateVel = function () {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			// (x, y) = Bias - VelocityError
			var scale = data[(/*LINE_SCALE*/ 32)];
			var nx = data[(/*LINE_RAXIS*/ 17)];
			var ny = data[(/*LINE_RAXIS*/ 17) + 1];
			var cx1 = data[(/*LINE_CX1*/ 28)];
			var cx2 = data[(/*LINE_CX2*/ 29)];
			var dot1 = data[(/*LINE_DOT1*/ 30)];
			var dot2 = data[(/*LINE_DOT2*/ 31)];

			var vx = (b2[(/*BODY_VEL*/ 7)] - b1[(/*BODY_VEL*/ 7)]);
			var vy = (b2[(/*BODY_VEL*/ 7) + 1] - b1[(/*BODY_VEL*/ 7) + 1]);
			var vw1 = b1[(/*BODY_VEL*/ 7) + 2];
			var vw2 = b2[(/*BODY_VEL*/ 7) + 2];
			var x = (data[(/*LINE_BIAS*/ 26)] - ((nx * vy) - (ny * vx) + (vw2 * dot2) - (vw1 * dot1)));
			var y = (data[(/*LINE_BIAS*/ 26) + 1] - (scale * ((nx * vx) + (ny * vy) - (vw2 * cx2) + (vw1 * cx1))));

			var jOldX = data[(/*LINE_JACC*/ 22)];
			var jOldY = data[(/*LINE_JACC*/ 22) + 1];
			var gamma = data[(/*LINE_GAMMA*/ 25)];

			// Impulse.
			// (jx, jy) = K * (x, y) - Jacc * gamma
			var Kb = data[(/*LINE_KMASS*/ 19) + 1];
			var jx = ((data[(/*LINE_KMASS*/ 19)] * x) + (Kb * y)) - (jOldX * gamma);
			var jy = ((Kb * x) + (data[(/*LINE_KMASS*/ 19) + 2] * y)) - (jOldY * gamma);

			// Accumulate and clamp
			var jAccX = (jOldX + jx);
			var jAccY = (jOldY + jy);
			if (!this._equal && jAccY > 0) {
				jAccY = 0;
			}

			var jlsq = ((jAccX * jAccX) + (jAccY * jAccY));
			var jMax = data[(/*LINE_JMAX*/ 24)];
			if (this._breakUnderForce) {
				if (jlsq > (jMax * jMax)) {
					return true;
				}
			} else if (!this._stiff) {
				if (jlsq > (jMax * jMax)) {
					jlsq = (jMax / Math.sqrt(jlsq));
					jAccX *= jlsq;
					jAccY *= jlsq;
				}
			}

			jx = (jAccX - jOldX);
			jy = (jAccY - jOldY);
			data[(/*LINE_JACC*/ 22)] = jAccX;
			data[(/*LINE_JACC*/ 22) + 1] = jAccY;

			// Apply impulse.
			var lx = (scale * nx * jy) - (ny * jx);
			var ly = (nx * jx) + (scale * ny * jy);

			var im = b1[(/*BODY_IMASS*/ 0)];
			b1[(/*BODY_VEL*/ 7)] -= (lx * im);
			b1[(/*BODY_VEL*/ 7) + 1] -= (ly * im);
			b1[(/*BODY_VEL*/ 7) + 2] += (((scale * cx1 * jy) - (dot1 * jx)) * b1[(/*BODY_IINERTIA*/ 1)]);

			im = b2[(/*BODY_IMASS*/ 0)];
			b2[(/*BODY_VEL*/ 7)] += (lx * im);
			b2[(/*BODY_VEL*/ 7) + 1] += (ly * im);
			b2[(/*BODY_VEL*/ 7) + 2] += (((dot2 * jx) - (scale * cx2 * jy)) * b2[(/*BODY_IINERTIA*/ 1)]);

			return false;
		};

		Physics2DLineConstraint.prototype._iteratePos = function () {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			this._posError();
			var errX = data[(/*LINE_BIAS*/ 26)];
			var errY = data[(/*LINE_BIAS*/ 26) + 1];
			var elsq = ((errX * errX) + (errY * errY));

			var maxError = data[(/*JOINT_MAX_ERROR*/ 3)];
			if (this._breakUnderError && elsq > (maxError * maxError)) {
				return true;
			}

			var slop = Physics2DConfig.LINE_SLOP_SQ;
			if (elsq < slop) {
				return false;
			}

			var bias = Physics2DConfig.LINE_BIAS_COEF;
			errX *= bias;
			errY *= bias;
			elsq *= (bias * bias);

			var im1 = b1[(/*BODY_MASS*/ 0)];
			var im2 = b2[(/*BODY_MASS*/ 0)];
			var ii1 = b1[(/*BODY_IINERTIA*/ 1)];
			var ii2 = b2[(/*BODY_IINERTIA*/ 1)];
			var massSum = (im1 + im2);

			var nx = data[(/*LINE_RAXIS*/ 17)];
			var ny = data[(/*LINE_RAXIS*/ 17) + 1];
			var scale = data[(/*LINE_SCALE*/ 32)];

			var lx, ly;

			// Solve large error case seperately.
			if (elsq > Physics2DConfig.LINE_LARGE_ERROR_SQ) {
				if (massSum > Physics2DConfig.EFF_MASS_EPSILON) {
					var K = (Physics2DConfig.LINE_LARGE_ERROR_BIAS / massSum);
					lx = K * ((ny * errX) - (scale * nx * errY));
					ly = K * ((nx * errX * scale) - (ny * errX));

					b1[(/*BODY_POS*/ 2)] -= (lx * im1);
					b1[(/*BODY_POS*/ 2) + 1] -= (ly * im1);
					b2[(/*BODY_POS*/ 2)] += (lx * im2);
					b2[(/*BODY_POS*/ 2) + 1] += (ly * im2);

					this._posError();
					nx = data[(/*LINE_RAXIS*/ 17)];
					ny = data[(/*LINE_RAXIS*/ 17) + 1];
					scale = data[(/*LINE_SCALE*/ 32)];

					errX = (data[(/*LINE_BIAS*/ 26)] * bias);
					errY = (data[(/*LINE_BIAS*/ 26) + 1] * bias);
				}
			}

			// Compute non-inverted effective mass.
			var rx1 = data[(/*LINE_RANCHOR1*/ 13)];
			var ry1 = data[(/*LINE_RANCHOR1*/ 13) + 1];
			var rx2 = data[(/*LINE_RANCHOR2*/ 15)];
			var ry2 = data[(/*LINE_RANCHOR2*/ 15) + 1];
			var delX = (data[(/*LINE_CX1*/ 28)] + rx1);
			var delY = (data[(/*LINE_CX2*/ 29)] + ry1);

			var cx1 = (nx * delY) - (ny * delX);
			var cx2 = (nx * ry2) - (ny * rx2);
			var dot1 = (nx * delX) + (ny * delY);
			var dot2 = (nx * rx2) + (ny * ry2);

			data[(/*LINE_KMASS*/ 19)] = massSum + (dot1 * ii1 * dot1) + (dot2 * ii2 * dot2);
			data[(/*LINE_KMASS*/ 19) + 1] = -scale * ((dot1 * ii1 * cx1) + (dot2 * ii2 * cx2));
			data[(/*LINE_KMASS*/ 19) + 2] = scale * scale * (massSum + (cx1 * ii1 * cx1) + (cx2 * ii2 * cx2));

			data[(/*LINE_BIAS*/ 26)] = errX;
			data[(/*LINE_BIAS*/ 26) + 1] = errY;
			Physics2DConstraint.prototype.safe_solve2(data, (/*LINE_KMASS*/ 19), (/*LINE_BIAS*/ 26), (/*LINE_BIAS*/ 26));
			var jx = data[(/*LINE_BIAS*/ 26)];
			var jy = data[(/*LINE_BIAS*/ 26) + 1];

			if (!this._equal && jy > 0) {
				jy = 0;
			}

			lx = (scale * nx * jy) - (ny * jx);
			ly = (nx * jx) + (scale * ny * jy);

			b1[(/*BODY_POS*/ 2)] -= (lx * im1);
			b1[(/*BODY_POS*/ 2) + 1] -= (ly * im1);
			var dr = (((scale * cx1 * jy) - (dot1 * jx)) * ii1);
			if (dr !== 0) {
				this.bodyA._deltaRotation(dr);
			}

			b2[(/*BODY_POS*/ 2)] += (lx * im2);
			b2[(/*BODY_POS*/ 2) + 1] += (ly * im2);
			dr = (((dot2 * jx) - (scale * cx2 * jy)) * ii2);
			if (dr !== 0) {
				this.bodyB._deltaRotation(dr);
			}

			return false;
		};

		// params = {
		//   bodyA, bodyB
		//   anchorA, anchorB, axis
		//   lowerBound, upperBound
		//   .. common constraint params
		// }
		Physics2DLineConstraint.create = function (params) {
			var p = new Physics2DLineConstraint();
			var data = p._data = Types.createFloatArray(/*LINE_DATA_SIZE*/ 33);
			Physics2DConstraint.prototype.init(p, params);

			var anchor = params.anchorA;
			data[(/*LINE_LANCHOR1*/ 7)] = (anchor ? anchor[0] : 0);
			data[(/*LINE_LANCHOR1*/ 7) + 1] = (anchor ? anchor[1] : 0);

			anchor = params.anchorB;
			data[(/*LINE_LANCHOR2*/ 9)] = (anchor ? anchor[0] : 0);
			data[(/*LINE_LANCHOR2*/ 9) + 1] = (anchor ? anchor[1] : 0);

			anchor = params.axis;
			data[(/*LINE_LAXIS*/ 11)] = anchor[0];
			data[(/*LINE_LAXIS*/ 11) + 1] = anchor[1];

			var min = data[(/*LINE_JOINTMIN*/ 5)] = (params.lowerBound !== undefined ? params.lowerBound : Number.NEGATIVE_INFINITY);
			var max = data[(/*LINE_JOINTMAX*/ 6)] = (params.upperBound !== undefined ? params.upperBound : Number.POSITIVE_INFINITY);
			p._equal = (min === max);

			p.bodyA = params.bodyA;
			p.bodyB = params.bodyB;

			return p;
		};

		// Redirect some methods
		Physics2DLineConstraint.prototype._inWorld = Physics2DConstraint.prototype.twoBodyInWorld;
		Physics2DLineConstraint.prototype._outWorld = Physics2DConstraint.prototype.twoBodyOutWorld;
		Physics2DLineConstraint.prototype._pairExists = Physics2DConstraint.prototype.twoBodyPairExists;
		Physics2DLineConstraint.prototype._wakeConnected = Physics2DConstraint.prototype.twoBodyWakeConnected;
		Physics2DLineConstraint.prototype._sleepComputation = Physics2DConstraint.prototype.twoBodySleepComputation;



		Physics2DLineConstraint.prototype._draw = function lineDrawFn(debug) {
			var colA = (this.sleeping ? debug.constraintSleepingColorA : debug.constraintColorA);
			var colB = (this.sleeping ? debug.constraintSleepingColorB : debug.constraintColorB);
			var colSA = (this.sleeping ? debug.constraintErrorSleepingColorA : debug.constraintErrorColorA);
			var colSB = (this.sleeping ? debug.constraintErrorSleepingColorB : debug.constraintErrorColorB);
			var colSC = (this.sleeping ? debug.constraintErrorSleepingColorC : debug.constraintErrorColorC);

			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var x1 = (b1[(/*BODY_POS*/ 2)] + data[(/*LINE_RANCHOR1*/ 13)]);
			var y1 = (b1[(/*BODY_POS*/ 2) + 1] + data[(/*LINE_RANCHOR1*/ 13) + 1]);
			var x2 = (b2[(/*BODY_POS*/ 2)] + data[(/*LINE_RANCHOR2*/ 15)]);
			var y2 = (b2[(/*BODY_POS*/ 2) + 1] + data[(/*LINE_RANCHOR2*/ 15) + 1]);
			var dx = data[(/*LINE_RAXIS*/ 17)];
			var dy = data[(/*LINE_RAXIS*/ 17) + 1];

			var jointMin = data[(/*LINE_JOINTMIN*/ 5)];
			var jointMax = data[(/*LINE_JOINTMAX*/ 6)];
			if (jointMin === Number.NEGATIVE_INFINITY) {
				jointMin = -1e20;
			}
			if (jointMax === Number.POSITIVE_INFINITY) {
				jointMax = 1e20;
			}

			var delX = (x2 - x1);
			var delY = (y2 - y1);
			var pn = (delX * dx) + (delY * dy);

			var ex1 = (x1 + (dx * jointMin));
			var ey1 = (y1 + (dy * jointMin));
			var ex2 = (x1 + (dx * jointMax));
			var ey2 = (y1 + (dy * jointMax));

			var t;
			if (pn > jointMin) {
				t = Math.min(pn, jointMax);
				debug.drawLine(ex1, ey1, x1 + (dx * t), y1 + (dy * t), colSA);
			}
			if (pn < jointMax) {
				t = Math.max(pn, jointMin);
				debug.drawLine(ex2, ey2, x1 + (dx * t), y1 + (dy * t), colSB);
			}

			if (!this._stiff) {
				var anchX = (pn < jointMin ? ex1 : (pn > jointMax ? ex2 : (x1 + (dx * pn))));
				var anchY = (pn < jointMin ? ey1 : (pn > jointMax ? ey2 : (y1 + (dy * pn))));

				var numCoils = debug.constraintSpringNumCoils;
				var radius = (debug.constraintSpringRadius * debug.screenToPhysics2D);
				debug.drawLinearSpring(anchX, anchY, x2, y2, numCoils, radius, colSC);
			}

			var rad = (debug.constraintAnchorRadius * debug.screenToPhysics2D);
			debug._drawAnchor(x1, y1, rad, colA);
			debug._drawAnchor(x2, y2, rad, colB);
		};

		return Physics2DLineConstraint;
})