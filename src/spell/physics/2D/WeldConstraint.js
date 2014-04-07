

// =========================================================================
//
// Weld Constraint
//
// WELD DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*WELD_LANCHOR1*/5  // Locally defined anchor on first body.
///*WELD_LANCHOR2*/7  // Locally defined anchor on second body.
///*WELD_RANCHOR1*/9  // Relatively defined anchor on first body.
///*WELD_RANCHOR2*/11 // Relatively defined anchor on second body.
///*WELD_PHASE*/13    // Rotational phase between bodies
///*WELD_KMASS*/14    // Effective mass matrix [ a b c ; b d e ; c e f ] symmetric.
///*WELD_JACC*/20     // Accumulated impulse (x, y, w).
///*WELD_JMAX*/23     // Maximum impulse magnitude (maxForce derived).
///*WELD_GAMMA*/24    // Gamma for soft constraint
///*WELD_BIAS*/25     // Bias for soft constraint (x, y, w) (maxError derived).
//
///*WELD_DATA_SIZE*/28
define(
	'spell/physics/2D/WeldConstraint',
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

	var Physics2DWeldConstraint = function() {
			Physics2DConstraint.apply(this, arguments);
			this.type = "WELD";
			this.dimension = 3;
			// ===============================================
			// Inherited
			this._ANCHOR_A = (/*WELD_LANCHOR1*/ 5);
			this._ANCHOR_B = (/*WELD_LANCHOR2*/ 7);
			// =======================================================
			// Inherited
			this._JACC = (/*WELD_JACC*/ 20);
		}
		__extends(Physics2DWeldConstraint, Physics2DConstraint);


		Physics2DWeldConstraint.prototype.getPhase = function () {
			return this._data[(/*WELD_PHASE*/ 13)];
		};
		Physics2DWeldConstraint.prototype.setPhase = function (phase) {
			var data = this._data;
			if (phase !== data[(/*WELD_PHASE*/ 13)]) {
				data[(/*WELD_PHASE*/ 13)] = phase;
				this.wake(true);
			}
		};

		Physics2DWeldConstraint.prototype._preStep = function (deltaTime) {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			Physics2DConstraint.prototype.rotateAnchor(data, b1, (/*WELD_LANCHOR1*/ 5), (/*WELD_RANCHOR1*/ 9));
			var rx1 = data[(/*WELD_RANCHOR1*/ 9)];
			var ry1 = data[(/*WELD_RANCHOR1*/ 9) + 1];

			Physics2DConstraint.prototype.rotateAnchor(data, b2, (/*WELD_LANCHOR2*/ 7), (/*WELD_RANCHOR2*/ 11));
			var rx2 = data[(/*WELD_RANCHOR2*/ 11)];
			var ry2 = data[(/*WELD_RANCHOR2*/ 11) + 1];

			// Compute non-inverted effective mass.
			var massSum = (b1[(/*BODY_IMASS*/ 0)] + b2[(/*BODY_IMASS*/ 0)]);
			var ii1 = b1[(/*BODY_IINERTIA*/ 1)];
			var ii2 = b2[(/*BODY_IINERTIA*/ 1)];
			data[(/*WELD_KMASS*/ 14)] = massSum + (ry1 * ii1 * ry1) + (ry2 * ii2 * ry2);
			data[(/*WELD_KMASS*/ 14) + 1] = -(rx1 * ii1 * ry1) - (rx2 * ii2 * ry2);
			data[(/*WELD_KMASS*/ 14) + 2] = -(ry1 * ii1) - (ry2 * ii2);
			data[(/*WELD_KMASS*/ 14) + 3] = massSum + (rx1 * ii1 * rx1) + (rx2 * ii2 * rx2);
			data[(/*WELD_KMASS*/ 14) + 4] = (rx1 * ii1) + (rx2 * ii2);
			data[(/*WELD_KMASS*/ 14) + 5] = ii1 + ii2;

			// Invert effective mass
			Physics2DConstraint.prototype.safe_invert3(data, (/*WELD_KMASS*/ 14), (/*WELD_JACC*/ 20));

			if (!this._stiff) {
				data[(/*WELD_BIAS*/ 25)] = ((b1[(/*BODY_POS*/ 2)] + rx1) - (b2[(/*BODY_POS*/ 2)] + rx2));
				data[(/*WELD_BIAS*/ 25) + 1] = ((b1[(/*BODY_POS*/ 2) + 1] + ry1) - (b2[(/*BODY_POS*/ 2) + 1] + ry2));
				data[(/*WELD_BIAS*/ 25) + 2] = ((b1[(/*BODY_POS*/ 2) + 2] + data[(/*WELD_PHASE*/ 13)]) - b2[(/*BODY_POS*/ 2) + 2]);
				if (Physics2DConstraint.prototype.soft_params3(data, (/*WELD_KMASS*/ 14), (/*WELD_GAMMA*/ 24), (/*WELD_BIAS*/ 25), deltaTime, this._breakUnderError)) {
					return true;
				}
			} else {
				data[(/*WELD_GAMMA*/ 24)] = 0.0;
				data[(/*WELD_BIAS*/ 25)] = 0.0;
				data[(/*WELD_BIAS*/ 25) + 1] = 0.0;
				data[(/*WELD_BIAS*/ 25) + 2] = 0.0;
			}

			var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
			data[(/*WELD_JACC*/ 20)] *= dtRatio;
			data[(/*WELD_JACC*/ 20) + 1] *= dtRatio;
			data[(/*WELD_JACC*/ 20) + 2] *= dtRatio;
			data[(/*WELD_JMAX*/ 23)] = (data[(/*JOINT_MAX_FORCE*/ 2)] * deltaTime);

			return false;
		};

		Physics2DWeldConstraint.prototype._warmStart = function () {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var jx = data[(/*WELD_JACC*/ 20)];
			var jy = data[(/*WELD_JACC*/ 20) + 1];
			var jz = data[(/*WELD_JACC*/ 20) + 2];

			var im = b1[(/*BODY_IMASS*/ 0)];
			b1[(/*BODY_VEL*/ 7)] -= (jx * im);
			b1[(/*BODY_VEL*/ 7) + 1] -= (jy * im);
			b1[(/*BODY_VEL*/ 7) + 2] -= (((data[(/*WELD_RANCHOR1*/ 9)] * jy) - (data[(/*WELD_RANCHOR1*/ 9) + 1] * jx) + jz) * b1[(/*BODY_IINERTIA*/ 1)]);

			im = b2[(/*BODY_IMASS*/ 0)];
			b2[(/*BODY_VEL*/ 7)] += (jx * im);
			b2[(/*BODY_VEL*/ 7) + 1] += (jy * im);
			b2[(/*BODY_VEL*/ 7) + 2] += (((data[(/*WELD_RANCHOR2*/ 11)] * jy) - (data[(/*WELD_RANCHOR2*/ 11) + 1] * jx) + jz) * b2[(/*BODY_IINERTIA*/ 1)]);
		};

		Physics2DWeldConstraint.prototype.getImpulseForBody = function (body, dst /*v2*/ ) {
			if (dst === undefined) {
				dst = Types.createFloatArray(3);
			}

			var data = this._data;
			var jx = data[(/*WELD_JACC*/ 20)];
			var jy = data[(/*WELD_JACC*/ 20) + 1];
			var jz = data[(/*WELD_JACC*/ 20) + 2];

			if (body === this.bodyA) {
				dst[0] = -jx;
				dst[1] = -jy;
				dst[2] = -((data[(/*WELD_RANCHOR1*/ 9)] * jy) - (data[(/*WELD_RANCHOR1*/ 9) + 1] * jx) + jz);
			} else if (body === this.bodyB) {
				dst[0] = jx;
				dst[1] = jy;
				dst[2] = ((data[(/*WELD_RANCHOR2*/ 11)] * jy) - (data[(/*WELD_RANCHOR2*/ 11) + 1] * jx) + jz);
			} else {
				dst[0] = dst[1] = dst[2] = 0;
			}

			return dst;
		};

		Physics2DWeldConstraint.prototype._iterateVel = function () {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var rx1 = data[(/*WELD_RANCHOR1*/ 9)];
			var ry1 = data[(/*WELD_RANCHOR1*/ 9) + 1];
			var rx2 = data[(/*WELD_RANCHOR2*/ 11)];
			var ry2 = data[(/*WELD_RANCHOR2*/ 11) + 1];

			// (x, y, z) = Bias - VelocityError
			var vw1 = b1[(/*BODY_VEL*/ 7) + 2];
			var vw2 = b2[(/*BODY_VEL*/ 7) + 2];
			var x = (data[(/*WELD_BIAS*/ 25)] - (b2[(/*BODY_VEL*/ 7)] - (ry2 * vw2)) + (b1[(/*BODY_VEL*/ 7)] - (ry1 * vw1)));
			var y = (data[(/*WELD_BIAS*/ 25) + 1] - (b2[(/*BODY_VEL*/ 7) + 1] + (rx2 * vw2)) + (b1[(/*BODY_VEL*/ 7) + 1] + (rx1 * vw1)));
			var z = (data[(/*WELD_BIAS*/ 25) + 2] - vw2 + vw1);

			var jOldX = data[(/*WELD_JACC*/ 20)];
			var jOldY = data[(/*WELD_JACC*/ 20) + 1];
			var jOldZ = data[(/*WELD_JACC*/ 20) + 2];
			var gamma = data[(/*WELD_GAMMA*/ 24)];

			// Impulse.
			// (jx, jy, jz) = K * (x, y, z) - (JAcc * gamma);
			var Kb = data[(/*WELD_KMASS*/ 14) + 1];
			var Kc = data[(/*WELD_KMASS*/ 14) + 2];
			var Ke = data[(/*WELD_KMASS*/ 14) + 4];
			var jx = ((data[(/*WELD_KMASS*/ 14)] * x) + (Kb * y) + (Kc * z)) - (jOldX * gamma);
			var jy = ((Kb * x) + (data[(/*WELD_KMASS*/ 14) + 3] * y) + (Ke * z)) - (jOldY * gamma);
			var jz = ((Kc * x) + (Ke * y) + (data[(/*WELD_KMASS*/ 14) + 5] * z)) - (jOldZ * gamma);

			// Accumulate and clamp.
			var jAccX = (jOldX + jx);
			var jAccY = (jOldY + jy);
			var jAccZ = (jOldZ + jz);
			var jsq = ((jAccX * jAccX) + (jAccY * jAccY) + (jAccZ * jAccZ));
			var jMax = data[(/*WELD_JMAX*/ 23)];
			if (this._breakUnderForce) {
				if (jsq > (jMax * jMax)) {
					return true;
				}
			} else if (!this._stiff) {
				if (jsq > (jMax * jMax)) {
					jsq = (jMax / Math.sqrt(jsq));
					jAccX *= jsq;
					jAccY *= jsq;
					jAccZ *= jsq;
				}
			}

			jx = (jAccX - jOldX);
			jy = (jAccY - jOldY);
			jz = (jAccZ - jOldZ);
			data[(/*WELD_JACC*/ 20)] = jAccX;
			data[(/*WELD_JACC*/ 20) + 1] = jAccY;
			data[(/*WELD_JACC*/ 20) + 2] = jAccZ;

			// Apply impulse
			var im = b1[(/*BODY_IMASS*/ 0)];
			b1[(/*BODY_VEL*/ 7)] -= (jx * im);
			b1[(/*BODY_VEL*/ 7) + 1] -= (jy * im);
			b1[(/*BODY_VEL*/ 7) + 2] -= (((rx1 * jy) - (ry1 * jx) + jz) * b1[(/*BODY_IINERTIA*/ 1)]);

			im = b2[(/*BODY_IMASS*/ 0)];
			b2[(/*BODY_VEL*/ 7)] += (jx * im);
			b2[(/*BODY_VEL*/ 7) + 1] += (jy * im);
			b2[(/*BODY_VEL*/ 7) + 2] += (((rx2 * jy) - (ry2 * jx) + jz) * b2[(/*BODY_IINERTIA*/ 1)]);

			return false;
		};

		Physics2DWeldConstraint.prototype._iteratePos = function () {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var im1 = b1[(/*BODY_IMASS*/ 0)];
			var im2 = b2[(/*BODY_IMASS*/ 0)];
			var ii1 = b1[(/*BODY_IINERTIA*/ 1)];
			var ii2 = b2[(/*BODY_IINERTIA*/ 1)];

			Physics2DConstraint.prototype.rotateAnchor(data, b1, (/*WELD_LANCHOR1*/ 5), (/*WELD_RANCHOR1*/ 9));
			var rx1 = data[(/*WELD_RANCHOR1*/ 9)];
			var ry1 = data[(/*WELD_RANCHOR1*/ 9) + 1];

			Physics2DConstraint.prototype.rotateAnchor(data, b2, (/*WELD_LANCHOR2*/ 7), (/*WELD_RANCHOR2*/ 11));
			var rx2 = data[(/*WELD_RANCHOR2*/ 11)];
			var ry2 = data[(/*WELD_RANCHOR2*/ 11) + 1];

			// Positional error
			var errX = ((b1[(/*BODY_POS*/ 2)] + rx1) - (b2[(/*BODY_POS*/ 2)] + rx2));
			var errY = ((b1[(/*BODY_POS*/ 2) + 1] + ry1) - (b2[(/*BODY_POS*/ 2) + 1] + ry2));
			var errZ = ((b1[(/*BODY_POS*/ 2) + 2] + data[(/*WELD_PHASE*/ 13)]) - b2[(/*BODY_POS*/ 2) + 2]);

			var elsq = ((errX * errX) + (errY * errY));
			var wlsq = (errZ * errZ);
			var maxError = data[(/*JOINT_MAX_ERROR*/ 3)];
			if (this._breakUnderError && (elsq + wlsq > (maxError * maxError))) {
				return true;
			}

			if (elsq < Physics2DConfig.WELD_LINEAR_SLOP_SQ && wlsq < Physics2DConfig.WELD_ANGULAR_SLOP_SQ) {
				return false;
			}

			var scale = Physics2DConfig.WELD_BIAS_COEF;
			errX *= scale;
			errY *= scale;
			errZ *= scale;
			elsq *= (scale * scale);

			var massSum = (im1 + im2);
			var jx, jy;

			// Handle large error seperately.
			if (elsq > Physics2DConfig.WELD_LARGE_ERROR_SQ) {
				if (massSum > Physics2DConfig.EFF_MASS_EPSILON) {
					var K = (Physics2DConfig.WELD_BIAS_COEF / massSum);
					jx = (errX * K);
					jy = (errY * K);

					// Clamp
					var jsq = ((jx * jx) + (jy * jy));
					var maxJ = Physics2DConfig.WELD_LARGE_ERROR_MAX;
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
			data[(/*WELD_KMASS*/ 14)] = massSum + (ry1 * ii1 * ry1) + (ry2 * ii2 * ry2);
			data[(/*WELD_KMASS*/ 14) + 1] = -(rx1 * ii1 * ry1) - (rx2 * ii2 * ry2);
			data[(/*WELD_KMASS*/ 14) + 2] = -(ry1 * ii1) - (ry2 * ii2);
			data[(/*WELD_KMASS*/ 14) + 3] = massSum + (rx1 * ii1 * rx1) + (rx2 * ii2 * rx2);
			data[(/*WELD_KMASS*/ 14) + 4] = (rx1 * ii1) + (rx2 * ii2);
			data[(/*WELD_KMASS*/ 14) + 5] = ii1 + ii2;

			if (elsq > Physics2DConfig.WELD_MAX_LINEAR_ERROR_SQ) {
				elsq = (Physics2DConfig.WELD_MAX_LINEAR_ERROR / Math.sqrt(elsq));
				errX *= elsq;
				errY *= elsq;
			}

			var maxW = Physics2DConfig.WELD_MAX_ANGULAR_ERROR;
			if (errZ > maxW) {
				errZ = maxW;
			} else if (errZ < -maxW) {
				errZ = -maxW;
			}

			data[(/*WELD_BIAS*/ 25)] = errX;
			data[(/*WELD_BIAS*/ 25) + 1] = errY;
			data[(/*WELD_BIAS*/ 25) + 2] = errZ;
			Physics2DConstraint.prototype.safe_solve3(data, (/*WELD_KMASS*/ 14), (/*WELD_BIAS*/ 25), (/*WELD_BIAS*/ 25));
			jx = data[(/*WELD_BIAS*/ 25)];
			jy = data[(/*WELD_BIAS*/ 25) + 1];
			var jz = data[(/*WELD_BIAS*/ 25) + 2];

			// Apply impulse
			b1[(/*BODY_POS*/ 2)] -= (jx * im1);
			b1[(/*BODY_POS*/ 2) + 1] -= (jy * im1);
			var dW = -(((rx1 * jy) - (ry1 * jx) + jz) * ii1);
			if (dW !== 0) {
				this.bodyA._deltaRotation(dW);
			}

			b2[(/*BODY_POS*/ 2)] += (jx * im2);
			b2[(/*BODY_POS*/ 2) + 1] += (jy * im2);
			dW = (((rx2 * jy) - (ry2 * jx) + jz) * ii2);
			if (dW !== 0) {
				this.bodyB._deltaRotation(dW);
			}

			return false;
		};

		// params = {
		//   bodyA, bodyB,
		//   anchorA, anchorB,
		//   phase
		//   ... common constraint params
		// }
		Physics2DWeldConstraint.create = function (params) {
			var p = new Physics2DWeldConstraint();
			var data = p._data = Types.createFloatArray((/*WELD_DATA_SIZE*/ 28));
			Physics2DConstraint.prototype.init(p, params);

			var anchor = params.anchorA;
			data[(/*WELD_LANCHOR1*/ 5)] = (anchor ? anchor[0] : 0);
			data[(/*WELD_LANCHOR1*/ 5) + 1] = (anchor ? anchor[1] : 0);

			anchor = params.anchorB;
			data[(/*WELD_LANCHOR2*/ 7)] = (anchor ? anchor[0] : 0);
			data[(/*WELD_LANCHOR2*/ 7) + 1] = (anchor ? anchor[1] : 0);

			data[(/*WELD_PHASE*/ 13)] = (params.phase !== undefined ? params.phase : 0);

			p.bodyA = params.bodyA;
			p.bodyB = params.bodyB;

			return p;
		};

		// Inherited
		Physics2DWeldConstraint.prototype._inWorld = Physics2DConstraint.prototype.twoBodyInWorld;
		Physics2DWeldConstraint.prototype._outWorld = Physics2DConstraint.prototype.twoBodyOutWorld;
		Physics2DWeldConstraint.prototype._pairExists = Physics2DConstraint.prototype.twoBodyPairExists;
		Physics2DWeldConstraint.prototype._wakeConnected = Physics2DConstraint.prototype.twoBodyWakeConnected;
		Physics2DWeldConstraint.prototype._sleepComputation = Physics2DConstraint.prototype.twoBodySleepComputation;

		Physics2DWeldConstraint.prototype._draw = function weldDrawFn(debug) {
			var colA = (this.sleeping ? debug.constraintSleepingColorA : debug.constraintColorA);
			var colB = (this.sleeping ? debug.constraintSleepingColorB : debug.constraintColorB);
			var colE = (this.sleeping ? debug.constraintErrorSleepingColorC : debug.constraintErrorColorC);

			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var x1 = (b1[(/*BODY_POS*/ 2)] + data[(/*WELD_RANCHOR1*/ 9)]);
			var y1 = (b1[(/*BODY_POS*/ 2) + 1] + data[(/*WELD_RANCHOR1*/ 9) + 1]);
			var x2 = (b2[(/*BODY_POS*/ 2)] + data[(/*WELD_RANCHOR2*/ 11)]);
			var y2 = (b2[(/*BODY_POS*/ 2) + 1] + data[(/*WELD_RANCHOR2*/ 11) + 1]);

			var rad = (debug.constraintAnchorRadius * debug.screenToPhysics2D);
			debug._drawAnchor(x1, y1, rad, colA);
			debug._drawAnchor(x2, y2, rad, colB);

			if (this._stiff) {
				debug.drawLine(x1, y1, x2, y2, colE);
			} else {
				var numCoils = debug.constraintSpringNumCoils;
				var radius = (debug.constraintSpringRadius * debug.screenToPhysics2D);
				debug.drawLinearSpring(x1, y1, x2, y2, numCoils, radius, colE);

				var minRadius = (debug.constraintSpiralMinRadius * debug.screenToPhysics2D);
				var deltaRadius = (debug.constraintSpiralDeltaRadius * debug.screenToPhysics2D);
				var indicatorSize = (debug.constraintAnchorRadius * debug.screenToPhysics2D);
				numCoils = debug.constraintSpiralNumCoils;

				var target, min;

				// angle indication on bodyA
				min = b1[(/*BODY_POS*/ 2) + 2];
				target = (b2[(/*BODY_POS*/ 2) + 2] - data[(/*WELD_PHASE*/ 13)]);

				var colSA = (this.sleeping ? debug.constraintErrorSleepingColorA : debug.constraintErrorColorA);
				var colSB = (this.sleeping ? debug.constraintErrorSleepingColorB : debug.constraintErrorColorB);

				debug.drawSpiralSpring(b1[(/*BODY_POS*/ 2)], b1[(/*BODY_POS*/ 2) + 1], min, target, minRadius, minRadius + ((target - min) * deltaRadius), numCoils, colSB);
				debug._drawAngleIndicator(b1[(/*BODY_POS*/ 2)], b1[(/*BODY_POS*/ 2) + 1], min, minRadius, indicatorSize, colSA);

				min = b2[(/*BODY_POS*/ 2) + 2];
				target = (data[(/*WELD_PHASE*/ 13)] + b1[(/*BODY_POS*/ 2) + 2]);

				debug.drawSpiralSpring(b2[(/*BODY_POS*/ 2)], b2[(/*BODY_POS*/ 2) + 1], min, target, minRadius, minRadius + ((target - min) * deltaRadius), numCoils, colSA);
				debug._drawAngleIndicator(b2[(/*BODY_POS*/ 2)], b2[(/*BODY_POS*/ 2) + 1], min, minRadius, indicatorSize, colSB);
			}
		};

		return Physics2DWeldConstraint;
})