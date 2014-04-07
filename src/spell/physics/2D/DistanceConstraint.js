
// =========================================================================
//
// Distance Constraint
//
// DIST DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*DIST_JOINTMIN*/5   // Joint limits
///*DIST_JOINTMAX*/6   //
///*DIST_LANCHOR1*/7   // Local anchor on bodyA (x, y)
///*DIST_LANCHOR2*/9   // Local anchor on bodyB (x, y)
///*DIST_RANCHOR1*/11  // Relative anchor on bodyA (x, y)
///*DIST_RANCHOR2*/13  // Relative anchor on bodyB (x, y)
///*DIST_KMASS*/15     // Effective mass matrix (scalar)
///*DIST_JACC*/16      // Accumulated impulse
///*DIST_JMAX*/17      // Maximum impulse (maxForce derived)
///*DIST_GAMMA*/18     // Soft constraint gamma
///*DIST_BIAS*/19      // Bias for soft constraint (scalar)
///*DIST_NORMAL*/20    // Direction of constraint error (x, y)
///*DIST_CX1*/22       // (RANCHOR1 cross NORMAL)
///*DIST_CX2*/23       // (RANCHOR2 cross NORMAL)
//
///*DIST_DATA_SIZE*/24
define(
	'spell/physics/2D/DistanceConstraint',
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

		var Physics2DDistanceConstraint = function() {
			Physics2DConstraint.apply(this, arguments);
			this.type = "DISTANCE";
			this.dimension = 1;
			// Inherited
			this._ANCHOR_A = (/*DIST_LANCHOR1*/ 7);
			this._ANCHOR_B = (/*DIST_LANCHOR2*/ 9);
			// =======================================================
			// Inherited
			this._JACC = (/*DIST_JACC*/ 16);
		}
		__extends(Physics2DDistanceConstraint, Physics2DConstraint);


		// ===============================================
		Physics2DDistanceConstraint.prototype.getLowerBound = function () {
			return this._data[(/*DIST_JOINTMIN*/ 5)];
		};
		Physics2DDistanceConstraint.prototype.getUpperBound = function () {
			return this._data[(/*DIST_JOINTMAX*/ 6)];
		};

		Physics2DDistanceConstraint.prototype.setLowerBound = function (lowerBound) {
			var data = this._data;
			if (data[(/*DIST_JOINTMIN*/ 5)] !== lowerBound) {
				data[(/*DIST_JOINTMIN*/ 5)] = lowerBound;
				this._equal = (lowerBound === data[(/*DIST_JOINTMAX*/ 6)]);
				this.wake(true);
			}
		};
		Physics2DDistanceConstraint.prototype.setUpperBound = function (upperBound) {
			var data = this._data;
			if (data[(/*DIST_JOINTMAX*/ 6)] !== upperBound) {
				data[(/*DIST_JOINTMAX*/ 6)] = upperBound;
				this._equal = (upperBound === data[(/*DIST_JOINTMIN*/ 5)]);
				this.wake(true);
			}
		};

		Physics2DDistanceConstraint.prototype._posError = function () {
			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var jointMin = data[(/*DIST_JOINTMIN*/ 5)];
			var jointMax = data[(/*DIST_JOINTMAX*/ 6)];

			Physics2DConstraint.prototype.rotateAnchor(data, b1, (/*DIST_LANCHOR1*/ 7), (/*DIST_RANCHOR1*/ 11));
			Physics2DConstraint.prototype.rotateAnchor(data, b2, (/*DIST_LANCHOR2*/ 9), (/*DIST_RANCHOR2*/ 13));

			var nx = ((b2[(/*BODY_POS*/ 2)] + data[(/*DIST_RANCHOR2*/ 13)]) - (b1[(/*BODY_POS*/ 2)] + data[(/*DIST_RANCHOR1*/ 11)]));
			var ny = ((b2[(/*BODY_POS*/ 2) + 1] + data[(/*DIST_RANCHOR2*/ 13) + 1]) - (b1[(/*BODY_POS*/ 2) + 1] + data[(/*DIST_RANCHOR1*/ 11) + 1]));

			var err = ((nx * nx) + (ny * ny));
			if (err < Physics2DConfig.NORMALIZE_SQ_EPSILON) {
				nx = data[(/*DIST_NORMAL*/ 20)];
				ny = data[(/*DIST_NORMAL*/ 20) + 1];
				err = 0;
			} else {
				err = Math.sqrt(err);
				var rec = (1 / err);
				nx *= rec;
				ny *= rec;
			}

			if (this._equal) {
				err -= jointMin;
				this._slack = false;
			} else if (err < jointMin) {
				err = (jointMin - err);
				nx = -nx;
				ny = -ny;
				this._slack = false;
			} else if (err > jointMax) {
				err -= jointMax;
				this._slack = false;
			} else {
				// Don't set normals to 0.
				// In this case that _slack is true, we do no further work
				// So we permit normals to persist so that should constraint
				// become degenerate we can still choose a 'good' direction.
				//
				// Constraint only becomes degenerate when jointMin = 0 and we reach this
				// limit. In this condition we want negated normals, so that's what we
				// allow to persist.
				nx = -nx;
				ny = -ny;

				err = 0;
				this._slack = true;
			}

			data[(/*DIST_NORMAL*/ 20)] = nx;
			data[(/*DIST_NORMAL*/ 20) + 1] = ny;
			data[(/*DIST_BIAS*/ 19)] = (-err);
		};

		Physics2DDistanceConstraint.prototype._preStep = function (deltaTime) {
			this._posError();
			if (this._slack) {
				return false;
			}

			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			// Compute non-inverted effective mass.
			var nx = data[(/*DIST_NORMAL*/ 20)];
			var ny = data[(/*DIST_NORMAL*/ 20) + 1];
			var cx1 = data[(/*DIST_CX1*/ 22)] = ((data[(/*DIST_RANCHOR1*/ 11)] * ny) - (data[(/*DIST_RANCHOR1*/ 11) + 1] * nx));
			var cx2 = data[(/*DIST_CX2*/ 23)] = ((data[(/*DIST_RANCHOR2*/ 13)] * ny) - (data[(/*DIST_RANCHOR2*/ 13) + 1] * nx));
			data[(/*DIST_KMASS*/ 15)] = (b1[(/*BODY_IMASS*/ 0)] + (cx1 * b1[(/*BODY_IINERTIA*/ 1)] * cx1) + b2[(/*BODY_IMASS*/ 0)] + (cx2 * b2[(/*BODY_IINERTIA*/ 1)] * cx2));

			// Invert effective mass
			Physics2DConstraint.prototype.safe_invert(data, (/*DIST_KMASS*/ 15), (/*DIST_JACC*/ 16));

			if (!this._stiff) {
				if (Physics2DConstraint.prototype.soft_params(data, (/*DIST_KMASS*/ 15), (/*DIST_GAMMA*/ 18), (/*DIST_BIAS*/ 19), deltaTime, this._breakUnderError)) {
					return true;
				}
			} else {
				data[(/*DIST_GAMMA*/ 18)] = 0.0;
				data[(/*DIST_BIAS*/ 19)] = 0.0;
			}

			var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
			data[(/*DIST_JACC*/ 16)] *= dtRatio;
			data[(/*DIST_JMAX*/ 17)] = (data[(/*JOINT_MAX_FORCE*/ 2)] * deltaTime);

			return false;
		};

		Physics2DDistanceConstraint.prototype._warmStart = function () {
			if (this._slack) {
				return;
			}

			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var jAcc = data[(/*DIST_JACC*/ 16)];
			var jx = (data[(/*DIST_NORMAL*/ 20)] * jAcc);
			var jy = (data[(/*DIST_NORMAL*/ 20) + 1] * jAcc);

			var im = b1[(/*BODY_IMASS*/ 0)];
			b1[(/*BODY_VEL*/ 7)] -= (jx * im);
			b1[(/*BODY_VEL*/ 7) + 1] -= (jy * im);
			b1[(/*BODY_VEL*/ 7) + 2] -= (data[(/*DIST_CX1*/ 22)] * jAcc * b1[(/*BODY_IINERTIA*/ 1)]);

			im = b2[(/*BODY_IMASS*/ 0)];
			b2[(/*BODY_VEL*/ 7)] += (jx * im);
			b2[(/*BODY_VEL*/ 7) + 1] += (jy * im);
			b2[(/*BODY_VEL*/ 7) + 2] += (data[(/*DIST_CX2*/ 23)] * jAcc * b2[(/*BODY_IINERTIA*/ 1)]);
		};

		Physics2DDistanceConstraint.prototype.getImpulseForBody = function (body, dst /*v2*/ ) {
			if (dst === undefined) {
				dst = Types.createFloatArray(3);
			}

			var data = this._data;

			var jAcc = data[(/*DIST_JACC*/ 16)];
			var jx = (data[(/*DIST_NORMAL*/ 20)] * jAcc);
			var jy = (data[(/*DIST_NORMAL*/ 20) + 1] * jAcc);

			if (body === this.bodyA) {
				dst[0] = -jx;
				dst[1] = -jy;
				dst[2] = -(data[(/*DIST_CX1*/ 22)] * jAcc);
			} else if (body === this.bodyB) {
				dst[0] = jx;
				dst[1] = jy;
				dst[2] = (data[(/*DIST_CX2*/ 23)] * jAcc);
			} else {
				dst[0] = dst[1] = dst[2] = 0;
			}

			return dst;
		};

		Physics2DDistanceConstraint.prototype._iterateVel = function () {
			if (this._slack) {
				return false;
			}

			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			// x = Bias - VelocityError
			var nx = data[(/*DIST_NORMAL*/ 20)];
			var ny = data[(/*DIST_NORMAL*/ 20) + 1];
			var cx1 = data[(/*DIST_CX1*/ 22)];
			var cx2 = data[(/*DIST_CX2*/ 23)];
			var x = (data[(/*DIST_BIAS*/ 19)] - ((nx * (b2[(/*BODY_VEL*/ 7)] - b1[(/*BODY_VEL*/ 7)])) + (ny * (b2[(/*BODY_VEL*/ 7) + 1] - b1[(/*BODY_VEL*/ 7) + 1])) + (cx2 * b2[(/*BODY_VEL*/ 7) + 2]) - (cx1 * b1[(/*BODY_VEL*/ 7) + 2])));

			var jOld = data[(/*DIST_JACC*/ 16)];

			// Impulse.
			// j = K * x - Jacc * gamma
			var j = ((data[(/*DIST_KMASS*/ 15)] * x) - (jOld * data[(/*DIST_GAMMA*/ 18)]));

			// Accumulate and clamp.
			var jAcc = (jOld + j);
			var jMax = data[(/*DIST_JMAX*/ 17)];
			if (!this._equal && jAcc > 0) {
				jAcc = 0;
			}
			if (this._breakUnderForce) {
				if (jAcc > jMax || jAcc < -jMax) {
					return true;
				}
			} else if (!this._stiff) {
				if (jAcc > jMax) {
					jAcc = jMax;
				} else if (jAcc < -jMax) {
					jAcc = -jMax;
				}
			}

			j = (jAcc - jOld);
			data[(/*DIST_JACC*/ 16)] = jAcc;

			// Apply impulse.
			var jx = (nx * j);
			var jy = (ny * j);

			var im = b1[(/*BODY_IMASS*/ 0)];
			b1[(/*BODY_VEL*/ 7)] -= (jx * im);
			b1[(/*BODY_VEL*/ 7) + 1] -= (jy * im);
			b1[(/*BODY_VEL*/ 7) + 2] -= (data[(/*DIST_CX1*/ 22)] * j * b1[(/*BODY_IINERTIA*/ 1)]);

			im = b2[(/*BODY_IMASS*/ 0)];
			b2[(/*BODY_VEL*/ 7)] += (jx * im);
			b2[(/*BODY_VEL*/ 7) + 1] += (jy * im);
			b2[(/*BODY_VEL*/ 7) + 2] += (data[(/*DIST_CX2*/ 23)] * j * b2[(/*BODY_IINERTIA*/ 1)]);

			return false;
		};

		Physics2DDistanceConstraint.prototype._iteratePos = function () {
			this._posError();
			if (this._slack) {
				return false;
			}

			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var im1 = b1[(/*BODY_IMASS*/ 0)];
			var im2 = b2[(/*BODY_IMASS*/ 0)];
			var ii1 = b1[(/*BODY_IINERTIA*/ 1)];
			var ii2 = b2[(/*BODY_IINERTIA*/ 1)];

			var err = data[(/*DIST_BIAS*/ 19)];
			var maxError = data[(/*JOINT_MAX_ERROR*/ 3)];
			if (this._breakUnderError && (err > maxError || err < -maxError)) {
				return true;
			}

			var slop = Physics2DConfig.DIST_SLOP_SQ;
			if ((err * err) < slop) {
				return false;
			}

			err *= Physics2DConfig.DIST_BIAS_COEF;

			var massSum = (im1 + im2);
			var nx = data[(/*DIST_NORMAL*/ 20)];
			var ny = data[(/*DIST_NORMAL*/ 20) + 1];

			var j, jx, jy;

			// Handle large error seperately
			if ((err * err) > Physics2DConfig.DIST_LARGE_ERROR_SQ) {
				if (massSum > Physics2DConfig.EFF_MASS_EPSILON) {
					j = (err * Physics2DConfig.DIST_LARGE_ERROR_BIAS / massSum);
					if (this._equal || j < 0) {
						jx = (nx * j);
						jy = (ny * j);
						b1[(/*BODY_POS*/ 2)] -= (jx * im1);
						b1[(/*BODY_POS*/ 2) + 1] -= (jy * im1);
						b2[(/*BODY_POS*/ 2)] += (jx * im2);
						b2[(/*BODY_POS*/ 2) + 1] += (jy * im2);

						// Recalculate error.
						this._posError();
						err = data[(/*DIST_BIAS*/ 19)] * Physics2DConfig.DIST_BIAS_COEF;
						nx = data[(/*DIST_NORMAL*/ 20)];
						ny = data[(/*DIST_NORMAL*/ 20) + 1];
					}
				}
			}

			var cx1 = ((data[(/*DIST_RANCHOR1*/ 11)] * ny) - (data[(/*DIST_RANCHOR1*/ 11) + 1] * nx));
			var cx2 = ((data[(/*DIST_RANCHOR2*/ 13)] * ny) - (data[(/*DIST_RANCHOR2*/ 13) + 1] * nx));
			data[(/*DIST_KMASS*/ 15)] = (massSum + (cx1 * ii1 * cx1) + (cx2 * ii2 * cx2));

			data[(/*DIST_BIAS*/ 19)] = err;
			Physics2DConstraint.prototype.safe_solve(data, (/*DIST_KMASS*/ 15), (/*DIST_BIAS*/ 19), (/*DIST_BIAS*/ 19));
			j = data[(/*DIST_BIAS*/ 19)];

			if (this._equal || j < 0) {
				jx = (nx * j);
				jy = (ny * j);

				b1[(/*BODY_POS*/ 2)] -= (jx * im1);
				b1[(/*BODY_POS*/ 2) + 1] -= (jy * im1);
				var dr = (-cx1 * ii1 * j);
				if (dr !== 0) {
					this.bodyA._deltaRotation(dr);
				}

				b2[(/*BODY_POS*/ 2)] += (jx * im2);
				b2[(/*BODY_POS*/ 2) + 1] += (jy * im2);
				dr = (cx2 * ii2 * j);
				if (dr !== 0) {
					this.bodyB._deltaRotation(dr);
				}
			}

			return false;
		};

		// params = {
		//   bodyA, bodyB
		//   anchorA, anchorB,
		//   lowerBound, upperBound
		//   .. common constraint params
		// }
		Physics2DDistanceConstraint.create = function (params) {
			var p = new Physics2DDistanceConstraint();
			var data = p._data = Types.createFloatArray(/*DIST_DATA_SIZE*/ 24);
			Physics2DConstraint.prototype.init(p, params);

			var anchor = params.anchorA;
			data[(/*DIST_LANCHOR1*/ 7)] = (anchor ? anchor[0] : 0);
			data[(/*DIST_LANCHOR1*/ 7) + 1] = (anchor ? anchor[1] : 0);

			anchor = params.anchorB;
			data[(/*DIST_LANCHOR2*/ 9)] = (anchor ? anchor[0] : 0);
			data[(/*DIST_LANCHOR2*/ 9) + 1] = (anchor ? anchor[1] : 0);

			var min = data[(/*DIST_JOINTMIN*/ 5)] = (params.lowerBound !== undefined ? params.lowerBound : 0);
			var max = data[(/*DIST_JOINTMAX*/ 6)] = (params.upperBound !== undefined ? params.upperBound : 0);
			p._equal = (min === max);

			p._slack = false;

			p.bodyA = params.bodyA;
			p.bodyB = params.bodyB;

			// Seed normal incase initial anchors are degenerate.
			data[(/*DIST_NORMAL*/ 20)] = 1;
			data[(/*DIST_NORMAL*/ 20) + 1] = 0;

			return p;
		};

		// Redirect some methods
		Physics2DDistanceConstraint.prototype._inWorld = Physics2DConstraint.prototype.twoBodyInWorld;
		Physics2DDistanceConstraint.prototype._outWorld = Physics2DConstraint.prototype.twoBodyOutWorld;
		Physics2DDistanceConstraint.prototype._pairExists = Physics2DConstraint.prototype.twoBodyPairExists;
		Physics2DDistanceConstraint.prototype._wakeConnected = Physics2DConstraint.prototype.twoBodyWakeConnected;
		Physics2DDistanceConstraint.prototype._sleepComputation = Physics2DConstraint.prototype.twoBodySleepComputation;


		Physics2DDistanceConstraint.prototype._draw = function distanceDrawFn(debug) {
			var colA = (this.sleeping ? debug.constraintSleepingColorA : debug.constraintColorA);
			var colB = (this.sleeping ? debug.constraintSleepingColorB : debug.constraintColorB);
			var colSA = (this.sleeping ? debug.constraintErrorSleepingColorA : debug.constraintErrorColorA);
			var colSB = (this.sleeping ? debug.constraintErrorSleepingColorB : debug.constraintErrorColorB);

			var data = this._data;
			var b1 = this.bodyA._data;
			var b2 = this.bodyB._data;

			var x1 = (b1[(/*BODY_POS*/ 2)] + data[(/*DIST_RANCHOR1*/ 11)]);
			var y1 = (b1[(/*BODY_POS*/ 2) + 1] + data[(/*DIST_RANCHOR1*/ 11) + 1]);
			var x2 = (b2[(/*BODY_POS*/ 2)] + data[(/*DIST_RANCHOR2*/ 13)]);
			var y2 = (b2[(/*BODY_POS*/ 2) + 1] + data[(/*DIST_RANCHOR2*/ 13) + 1]);

			var nx = (x2 - x1);
			var ny = (y2 - y1);
			var nlsq = ((nx * nx) + (ny * ny));
			if (nlsq > Physics2DConfig.NORMALIZE_SQ_EPSILON) {
				var nl = Math.sqrt(nlsq);
				var rec = (1 / nl);
				nx *= rec;
				ny *= rec;

				var midX = (0.5 * (x1 + x2));
				var midY = (0.5 * (y1 + y2));

				var jointMin = data[(/*DIST_JOINTMIN*/ 5)];
				var jointMax = data[(/*DIST_JOINTMAX*/ 6)];
				var minX1 = (midX - (nx * (jointMin * 0.5)));
				var minY1 = (midY - (ny * (jointMin * 0.5)));
				var minX2 = (midX + (nx * (jointMin * 0.5)));
				var minY2 = (midY + (ny * (jointMin * 0.5)));
				var maxX1 = (midX - (nx * (jointMax * 0.5)));
				var maxY1 = (midY - (ny * (jointMax * 0.5)));
				var maxX2 = (midX + (nx * (jointMax * 0.5)));
				var maxY2 = (midY + (ny * (jointMax * 0.5)));

				debug.drawLine(minX1, minY1, minX2, minY2, colSA);
				debug.drawLine(maxX1, maxY1, minX1, minY1, colSB);
				debug.drawLine(maxX2, maxY2, minX2, minY2, colSB);

				if (!this._stiff) {
					var numCoils = debug.constraintSpringNumCoils;
					var radius = (debug.constraintSpringRadius * debug.screenToPhysics2D);
					if (nl > jointMax) {
						debug.drawLinearSpring(maxX1, maxY1, x1, y1, numCoils, radius, colSB);
						debug.drawLinearSpring(maxX2, maxY2, x2, y2, numCoils, radius, colSB);
					} else if (nl < jointMin) {
						debug.drawLinearSpring(minX1, minY1, x1, y1, numCoils, radius, colSA);
						debug.drawLinearSpring(minX2, minY2, x2, y2, numCoils, radius, colSA);
					}
				}
			}

			var rad = (debug.constraintAnchorRadius * debug.screenToPhysics2D);
			debug._drawAnchor(x1, y1, rad, colA);
			debug._drawAnchor(x2, y2, rad, colB);
		};

		return Physics2DDistanceConstraint;
})