
// =========================================================================
//
// Angle Constraint
//
// ANGLE DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*ANGLE_JOINTMIN*/5 // Joint limits
///*ANGLE_JOINTMAX*/6 //
///*ANGLE_RATIO*/7    // Angle ratio for constraint
///*ANGLE_KMASS*/8    // Effective mass matrix (Scalar)
///*ANGLE_JACC*/9     // Accumulated impulse
///*ANGLE_JMAX*/10    // Maximum impulse (maxForce derived)
///*ANGLE_GAMMA*/11   // Gamma for soft constraint
///*ANGLE_BIAS*/12    // Bias for soft constraint (scalar)
///*ANGLE_SCALE*/13   // Scaling for impulse direction.
//
///*ANGLE_DATA_SIZE*/14
define(
	'spell/physics/2D/AngleConstraint',
	[
		'spell/physics/2D/Constraint',
		'spell/physics/2D/Config',
		'spell/shared/util/platform/Types'
	],
	function(
		Physics2DConstraint,
		Physics2DConfig,
		Types
	) {
		var __extends = function (d, b) {
			for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
			function __() { this.constructor = d; }
			__.prototype = b.prototype;
			d.prototype = new __();
		};

		var Physics2DAngleConstraint = function() {
				Physics2DConstraint.apply(this, arguments);
				this.type = "ANGLE";
				this.dimension = 1;
				// =======================================================
				// Inherited
				this._JACC = (/*ANGLE_JACC*/ 9);
			}
			__extends(Physics2DAngleConstraint, Physics2DConstraint);

			// ===============================================
			Physics2DAngleConstraint.prototype.getLowerBound = function () {
				return this._data[(/*ANGLE_JOINTMIN*/ 5)];
			};
			Physics2DAngleConstraint.prototype.getUpperBound = function () {
				return this._data[(/*ANGLE_JOINTMAX*/ 6)];
			};
			Physics2DAngleConstraint.prototype.getRatio = function () {
				return this._data[(/*ANGLE_RATIO*/ 7)];
			};

			Physics2DAngleConstraint.prototype.setLowerBound = function (lowerBound) {
				var data = this._data;
				if (data[(/*ANGLE_JOINTMIN*/ 5)] !== lowerBound) {
					data[(/*ANGLE_JOINTMIN*/ 5)] = lowerBound;
					this._equal = (lowerBound === data[(/*ANGLE_JOINTMAX*/ 6)]);
					this.wake(true);
				}
			};
			Physics2DAngleConstraint.prototype.setUpperBound = function (upperBound) {
				var data = this._data;
				if (data[(/*ANGLE_JOINTMAX*/ 6)] !== upperBound) {
					data[(/*ANGLE_JOINTMAX*/ 6)] = upperBound;
					this._equal = (upperBound === data[(/*ANGLE_JOINTMIN*/ 5)]);
					this.wake(true);
				}
			};
			Physics2DAngleConstraint.prototype.setRatio = function (ratio) {
				var data = this._data;
				if (data[(/*ANGLE_RATIO*/ 7)] !== ratio) {
					data[(/*ANGLE_RATIO*/ 7)] = ratio;
					this.wake(true);
				}
			};

			Physics2DAngleConstraint.prototype._posError = function () {
				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;

				var ratio = data[(/*ANGLE_RATIO*/ 7)];
				var jointMin = data[(/*ANGLE_JOINTMIN*/ 5)];
				var jointMax = data[(/*ANGLE_JOINTMAX*/ 6)];

				var err = ((ratio * b2[(/*BODY_POS*/ 2) + 2]) - b1[(/*BODY_POS*/ 2) + 2]);
				if (this._equal) {
					err -= jointMax;
					this._slack = false;
					data[(/*ANGLE_SCALE*/ 13)] = 1;
				} else {
					if (err < jointMin) {
						err = (jointMin - err);
						this._slack = false;
						data[(/*ANGLE_SCALE*/ 13)] = -1;
					} else if (err > jointMax) {
						err -= jointMax;
						this._slack = false;
						data[(/*ANGLE_SCALE*/ 13)] = 1;
					} else {
						err = 0;
						this._slack = true;
						data[(/*ANGLE_SCALE*/ 13)] = 0;
					}
				}
				data[(/*ANGLE_BIAS*/ 12)] = (-err);
			};

			Physics2DAngleConstraint.prototype._preStep = function (deltaTime) {
				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;

				// Compute effective mass before existing on _slack
				// As effective-mass is not recomputed in iteratePos
				// for stiff constraints.
				var ratio = data[(/*ANGLE_RATIO*/ 7)];

				// Compute non-inverted effective mass.
				var ii1 = b1[(/*BODY_IINERTIA*/ 1)];
				var ii2 = b2[(/*BODY_IINERTIA*/ 1)];
				data[(/*ANGLE_KMASS*/ 8)] = ii1 + (ratio * ratio * ii2);

				// Invert effective mass
				Physics2DConstraint.prototype.safe_invert(data, (/*ANGLE_KMASS*/ 8), (/*ANGLE_JACC*/ 9));

				this._posError();
				if (this._slack) {
					return false;
				}

				if (!this._stiff) {
					if (Physics2DConstraint.prototype.soft_params(data, (/*ANGLE_KMASS*/ 8), (/*ANGLE_GAMMA*/ 11), (/*ANGLE_BIAS*/ 12), deltaTime, this._breakUnderError)) {
						return true;
					}
				} else {
					data[(/*ANGLE_GAMMA*/ 11)] = 0;
					data[(/*ANGLE_BIAS*/ 12)] = 0;
				}

				var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
				data[(/*ANGLE_JACC*/ 9)] *= dtRatio;
				data[(/*ANGLE_JMAX*/ 10)] = (data[(/*JOINT_MAX_FORCE*/ 2)] * deltaTime);

				return false;
			};

			Physics2DAngleConstraint.prototype._warmStart = function () {
				if (this._slack) {
					return;
				}

				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;

				var j = (data[(/*ANGLE_JACC*/ 9)] * data[(/*ANGLE_SCALE*/ 13)]);
				b1[(/*BODY_VEL*/ 7) + 2] -= (j * b1[(/*BODY_IINERTIA*/ 1)]);
				b2[(/*BODY_VEL*/ 7) + 2] += (j * data[(/*ANGLE_RATIO*/ 7)] * b2[(/*BODY_IINERTIA*/ 1)]);
			};

			Physics2DAngleConstraint.prototype.getImpulseForBody = function (body, dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(3);
				}

				var data = this._data;
				var j = (data[(/*ANGLE_JACC*/ 9)] * data[(/*ANGLE_SCALE*/ 13)]);

				dst[0] = dst[1] = 0;
				dst[2] = (body === this.bodyA ? -1 : (body === this.bodyB ? data[(/*ANGLE_RATIO*/ 7)] : 0)) * j;

				return dst;
			};

			Physics2DAngleConstraint.prototype._iterateVel = function () {
				if (this._slack) {
					return false;
				}

				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;

				// x = Bias - VelocityError
				var scale = data[(/*ANGLE_SCALE*/ 13)];
				var ratio = data[(/*ANGLE_RATIO*/ 7)];
				var x = (data[(/*ANGLE_BIAS*/ 12)] - (scale * ((ratio * b2[(/*BODY_VEL*/ 7) + 2]) - b1[(/*BODY_VEL*/ 7) + 2])));

				var jOld = data[(/*ANGLE_JACC*/ 9)];

				// Impulse.
				// j = K * x - Jacc * gamma
				var j = (data[(/*ANGLE_KMASS*/ 8)] * x) - (jOld * data[(/*ANGLE_GAMMA*/ 11)]);

				// Accumulate and clamp
				var jAcc = (jOld + j);
				var jMax = data[(/*ANGLE_JMAX*/ 10)];
				if (this._breakUnderForce) {
					if (jAcc > jMax || jAcc < -jMax) {
						return true;
					} else if (!this._equal && jAcc > 0) {
						jAcc = 0;
					}
				} else if (!this._stiff) {
					if (!this._equal) {
						if (jAcc > 0) {
							jAcc = 0;
						} else if (jAcc < -jMax) {
							jAcc = -jMax;
						}
					} else {
						if (jAcc > jMax) {
							jAcc = jMax;
						} else if (jAcc < -jMax) {
							jAcc = -jMax;
						}
					}
				} else if (!this._equal && jAcc > 0) {
					jAcc = 0;
				}

				j = (jAcc - jOld);
				data[(/*ANGLE_JACC*/ 9)] = jAcc;

				// Apply impulse
				j *= scale;
				b1[(/*BODY_VEL*/ 7) + 2] -= (j * b1[(/*BODY_IINERTIA*/ 1)]);
				b2[(/*BODY_VEL*/ 7) + 2] += (j * ratio * b2[(/*BODY_IINERTIA*/ 1)]);

				return false;
			};

			Physics2DAngleConstraint.prototype._iteratePos = function () {
				this._posError();
				if (this._slack) {
					return false;
				}

				var data = this._data;
				var err = data[(/*ANGLE_BIAS*/ 12)];
				var maxError = data[(/*JOINT_MAX_ERROR*/ 3)];
				if (this._breakUnderError && (err > maxError || err < -maxError)) {
					return true;
				}

				var slop = Physics2DConfig.ANGLE_SLOP_SQ;
				if ((err * err) < slop) {
					return false;
				}

				err *= Physics2DConfig.ANGLE_BIAS_COEF;
				var j = (err * Physics2DConfig.ANGLE_BIAS_COEF * data[(/*ANGLE_KMASS*/ 8)]);

				if (this._equal || j < 0) {
					var b = this.bodyA;
					j *= data[(/*ANGLE_SCALE*/ 13)];
					var dr = (-j * b._data[(/*BODY_IINERTIA*/ 1)]);
					if (dr !== 0) {
						b._deltaRotation(dr);
					}

					b = this.bodyB;
					dr = (j * b._data[(/*BODY_IINERTIA*/ 1)]);
					if (dr !== 0) {
						b._deltaRotation(dr);
					}
				}

				return false;
			};

			// params = {
			//   bodyA, bodyB,
			//   lowerBound, upperBound, ratio
			//   ... common constraint params
			// }
			Physics2DAngleConstraint.create = function (params) {
				var p = new Physics2DAngleConstraint();
				var data = p._data = Types.createFloatArray((/*ANGLE_DATA_SIZE*/ 14));
				Physics2DConstraint.prototype.init(p, params);

				data[(/*ANGLE_RATIO*/ 7)] = (params.ratio !== undefined ? params.ratio : 1);
				var min = data[(/*ANGLE_JOINTMIN*/ 5)] = (params.lowerBound !== undefined ? params.lowerBound : 0);
				var max = data[(/*ANGLE_JOINTMAX*/ 6)] = (params.upperBound !== undefined ? params.upperBound : 0);
				p._equal = (min === max);

				p._slack = false;

				p.bodyA = params.bodyA;
				p.bodyB = params.bodyB;

				return p;
			};

			// Inherited
			Physics2DAngleConstraint.prototype._inWorld = Physics2DConstraint.prototype.twoBodyInWorld;
			Physics2DAngleConstraint.prototype._outWorld = Physics2DConstraint.prototype.twoBodyOutWorld;
			Physics2DAngleConstraint.prototype._pairExists = Physics2DConstraint.prototype.twoBodyPairExists;
			Physics2DAngleConstraint.prototype._wakeConnected = Physics2DConstraint.prototype.twoBodyWakeConnected;
			Physics2DAngleConstraint.prototype._sleepComputation = Physics2DConstraint.prototype.twoBodySleepComputation;


			Physics2DAngleConstraint.prototype._draw = function angleDrawFn(debug) {
				var colA = (this.sleeping ? debug.constraintSleepingColorA : debug.constraintColorA);
				var colB = (this.sleeping ? debug.constraintSleepingColorB : debug.constraintColorB);
				var colSA = (this.sleeping ? debug.constraintErrorSleepingColorA : debug.constraintErrorColorA);
				var colSB = (this.sleeping ? debug.constraintErrorSleepingColorB : debug.constraintErrorColorB);

				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;

				var ratio = data[(/*ANGLE_RATIO*/ 7)];
				this._drawForBody(debug, b1, b2, ratio, -1, colSA, colSB, colA);
				this._drawForBody(debug, b2, b1, (1 / ratio), (1 / ratio), colSA, colSB, colB);
			};

			Physics2DAngleConstraint.prototype._drawForBody = function _drawForBodyFn(debug, b1, b2, bodyScale, limitScale, colA, colB, col) {
				var data = this._data;
				var jointMin = data[(/*ANGLE_JOINTMIN*/ 5)];
				var jointMax = data[(/*ANGLE_JOINTMAX*/ 6)];

				var min = (b2[(/*BODY_POS*/ 2) + 2] * bodyScale) + (jointMin * limitScale);
				var max = (b2[(/*BODY_POS*/ 2) + 2] * bodyScale) + (jointMax * limitScale);
				if (min > max) {
					var tmp = min;
					min = max;
					max = tmp;
				}

				var minRadius = (debug.constraintSpiralMinRadius * debug.screenToPhysics2D);
				var deltaRadius = (debug.constraintSpiralDeltaRadius * debug.screenToPhysics2D);
				var indicatorSize = (debug.constraintAnchorRadius * debug.screenToPhysics2D);
				var numCoils = debug.constraintSpiralNumCoils;

				var x = b1[(/*BODY_POS*/ 2)];
				var y = b1[(/*BODY_POS*/ 2) + 1];
				var rot = b1[(/*BODY_POS*/ 2) + 2];

				var dr;
				if (rot > min) {
					dr = Math.min(rot, max);
					debug.drawSpiral(x, y, min, dr, minRadius, minRadius + ((dr - min) * deltaRadius), colA);
				} else if (!this._stiff && rot < min) {
					debug.drawSpiralSpring(x, y, rot, min, minRadius + ((rot - min) * deltaRadius), minRadius, numCoils, colA);
				}

				if (rot < max) {
					dr = Math.max(rot, min);
					debug.drawSpiral(x, y, dr, max, minRadius + ((dr - min) * deltaRadius), minRadius + ((max - min) * deltaRadius), colB);
				} else if (!this._stiff && rot > max) {
					debug.drawSpiralSpring(x, y, rot, max, minRadius + ((rot - min) * deltaRadius), minRadius + ((max - min) * deltaRadius), numCoils, colB);
				}

				debug._drawAngleIndicator(x, y, rot, minRadius + ((rot - min) * deltaRadius), indicatorSize, col);
			};

			return Physics2DAngleConstraint;
})
