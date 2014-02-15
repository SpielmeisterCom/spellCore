// =========================================================================
//
//
// Pulley Constraint
//
// PULLEY DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*PULLEY_JOINTMIN*/5   // Joint limits
///*PULLEY_JOINTMAX*/6   //
///*PULLEY_RATIO*/7      // Pulley ratio
///*PULLEY_KMASS*/8      // Effective-mass (scalar)
///*PULLEY_JACC*/9       // Accumulated impulse (scalar)
///*PULLEY_JMAX*/10      // Maximum impulse (maxForce derived)
///*PULLEY_LANCHOR1*/11  // Local anchor position on bodyA (x, y)
///*PULLEY_LANCHOR2*/13  // Local anchor position on bodyB (x, y)
///*PULLEY_LANCHOR3*/15  // Local anchor position on bodyC (x, y)
///*PULLEY_LANCHOR4*/17  // Local anchor position on bodyD (x, y)
///*PULLEY_RANCHOR1*/19  // Relative anchor position on bodyA (x, y)
///*PULLEY_RANCHOR2*/21  // Relative anchor position on bodyB (x, y)
///*PULLEY_RANCHOR3*/23  // Relative anchor position on bodyC (x, y)
///*PULLEY_RANCHOR4*/25  // Relative anchor position on bodyD (x, y)
///*PULLEY_GAMMA*/27     // Soft constraint gamma
///*PULLEY_BIAS*/28      // Soft constraint bias (scalar)
///*PULLEY_N12*/29       // Direction of constraint (r1 -> r2) (x, y)
///*PULLEY_N34*/31       // Direction of constraint (r3 -> r4) (x, y)
///*PULLEY_CX1*/33       // (RANCHOR1 cross N12)
///*PULLEY_CX2*/34       // (RANCHOR2 cross N12)
///*PULLEY_CX3*/35       // (RANCHOR3 cross N34)
///*PULLEY_CX4*/36       // (RANCHOR4 cross N34)
//
///*PULLEY_DATA_SIZE*/37

define(
	'spell/physics/2D/PulleyConstraint',
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

		var Physics2DPulleyConstraint = function() {
				Physics2DConstraint.apply(this, arguments);
				this.type = "PULLEY";
				this.dimension = 1;
				// Inherited
				this._ANCHOR_A = (/*PULLEY_LANCHOR1*/ 11);
				this._ANCHOR_B = (/*PULLEY_LANCHOR2*/ 13);
				this._ANCHOR_C = (/*PULLEY_LANCHOR3*/ 15);
				this._ANCHOR_D = (/*PULLEY_LANCHOR4*/ 17);
				// =====================================================
				// Inherited
				this._JACC = (/*PULLEY_JACC*/ 9);
			}
			__extends(Physics2DPulleyConstraint, Physics2DConstraint);


			// ===============================================
			Physics2DPulleyConstraint.prototype.getRatio = function () {
				return this._data[(/*PULLEY_RATIO*/ 7)];
			};
			Physics2DPulleyConstraint.prototype.setRatio = function (ratio) {
				var data = this._data;
				if (data[(/*PULLEY_RATIO*/ 7)] !== ratio) {
					data[(/*PULLEY_RATIO*/ 7)] = ratio;
					this.wake(true);
				}
			};

			Physics2DPulleyConstraint.prototype.getLowerBound = function () {
				return this._data[(/*PULLEY_JOINTMIN*/ 5)];
			};
			Physics2DPulleyConstraint.prototype.getUpperBound = function () {
				return this._data[(/*PULLEY_JOINTMAX*/ 6)];
			};

			Physics2DPulleyConstraint.prototype.setLowerBound = function (lowerBound) {
				var data = this._data;
				if (data[(/*PULLEY_JOINTMIN*/ 5)] !== lowerBound) {
					data[(/*PULLEY_JOINTMIN*/ 5)] = lowerBound;
					this._equal = (lowerBound === data[(/*PULLEY_JOINTMAX*/ 6)]);
					this.wake(true);
				}
			};
			Physics2DPulleyConstraint.prototype.setUpperBound = function (upperBound) {
				var data = this._data;
				if (data[(/*PULLEY_JOINTMAX*/ 6)] !== upperBound) {
					data[(/*PULLEY_JOINTMAX*/ 6)] = upperBound;
					this._equal = (upperBound === data[(/*PULLEY_JOINTMIN*/ 5)]);
					this.wake(true);
				}
			};

			Physics2DPulleyConstraint.prototype.getAnchorC = function (dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(2);
				}
				var data = this._data;
				var INDEX = this._ANCHOR_C;
				dst[0] = data[INDEX];
				dst[1] = data[INDEX + 1];
				return dst;
			};
			Physics2DPulleyConstraint.prototype.setAnchorC = function (anchor /*v2*/ ) {
				var data = this._data;
				var INDEX = this._ANCHOR_C;
				var newX = anchor[0];
				var newY = anchor[1];
				if (newX !== data[INDEX] || newY !== data[INDEX + 1]) {
					data[INDEX] = newX;
					data[INDEX + 1] = newY;
					this.wake(true);
				}
			};

			Physics2DPulleyConstraint.prototype.getAnchorD = function (dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(2);
				}
				var data = this._data;
				var INDEX = this._ANCHOR_D;
				dst[0] = data[INDEX];
				dst[1] = data[INDEX + 1];
				return dst;
			};
			Physics2DPulleyConstraint.prototype.setAnchorD = function (anchor /*v2*/ ) {
				var data = this._data;
				var INDEX = this._ANCHOR_D;
				var newX = anchor[0];
				var newY = anchor[1];
				if (newX !== data[INDEX] || newY !== data[INDEX + 1]) {
					data[INDEX] = newX;
					data[INDEX + 1] = newY;
					this.wake(true);
				}
			};

			// =========================================================
			Physics2DPulleyConstraint.prototype._inWorld = function () {
				this.bodyA.constraints.push(this);
				this.bodyB.constraints.push(this);
				if (this.bodyB !== this.bodyC) {
					this.bodyC.constraints.push(this);
				}
				this.bodyD.constraints.push(this);
			};

			Physics2DPulleyConstraint.prototype._outWorld = function () {
				var constraints = this.bodyA.constraints;
				var index = constraints.indexOf(this);
				constraints[index] = constraints[constraints.length - 1];
				constraints.pop();

				constraints = this.bodyB.constraints;
				index = constraints.indexOf(this);
				constraints[index] = constraints[constraints.length - 1];
				constraints.pop();

				if (this.bodyB !== this.bodyC) {
					constraints = this.bodyB.constraints;
					index = constraints.indexOf(this);
					constraints[index] = constraints[constraints.length - 1];
					constraints.pop();
				}

				constraints = this.bodyD.constraints;
				index = constraints.indexOf(this);
				constraints[index] = constraints[constraints.length - 1];
				constraints.pop();
			};

			Physics2DPulleyConstraint.prototype._pairExists = function (b1, b2) {
				var bodyA = this.bodyA;
				var bodyB = this.bodyB;
				var bodyC = this.bodyC;
				var bodyD = this.bodyD;

				return ((b1 === bodyA && (b2 === bodyB || b2 === bodyC || b2 === bodyD)) || (b1 === bodyB && (b2 === bodyA || b2 === bodyC || b2 === bodyD)) || (b1 === bodyC && (b2 === bodyA || b2 === bodyB || b2 === bodyD)) || (b1 === bodyD && (b2 === bodyA || b2 === bodyB || b2 === bodyC)));
			};

			Physics2DPulleyConstraint.prototype._wakeConnected = function () {
				var body = this.bodyA;
				if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
					body.wake(true);
				}

				body = this.bodyB;
				if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
					body.wake(true);
				}

				body = this.bodyC;
				if (body !== this.bodyB && body._type === (/*TYPE_DYNAMIC*/ 0)) {
					body.wake(true);
				}

				body = this.bodyD;
				if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
					body.wake(true);
				}
			};

			Physics2DPulleyConstraint.prototype._sleepComputation = function (union) {
				var body = this.bodyA;
				if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
					union(body, this);
				}

				body = this.bodyB;
				if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
					union(body, this);
				}

				body = this.bodyC;
				if (body !== this.bodyB && body._type === (/*TYPE_DYNAMIC*/ 0)) {
					union(body, this);
				}

				body = this.bodyD;
				if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
					union(body, this);
				}
			};

			Physics2DPulleyConstraint.prototype._posError = function () {
				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;
				var b3 = this.bodyC._data;
				var b4 = this.bodyD._data;

				Physics2DConstraint.prototype.rotateAnchor(data, b1, (/*PULLEY_LANCHOR1*/ 11), (/*PULLEY_RANCHOR1*/ 19));
				Physics2DConstraint.prototype.rotateAnchor(data, b2, (/*PULLEY_LANCHOR2*/ 13), (/*PULLEY_RANCHOR2*/ 21));
				Physics2DConstraint.prototype.rotateAnchor(data, b3, (/*PULLEY_LANCHOR3*/ 15), (/*PULLEY_RANCHOR3*/ 23));
				Physics2DConstraint.prototype.rotateAnchor(data, b4, (/*PULLEY_LANCHOR4*/ 17), (/*PULLEY_RANCHOR4*/ 25));

				var jointMin = data[(/*PULLEY_JOINTMIN*/ 5)];
				var jointMax = data[(/*PULLEY_JOINTMAX*/ 6)];

				var n12x = ((b2[(/*BODY_POS*/ 2)] + data[(/*PULLEY_RANCHOR2*/ 21)]) - (b1[(/*BODY_POS*/ 2)] + data[(/*PULLEY_RANCHOR1*/ 19)]));
				var n12y = ((b2[(/*BODY_POS*/ 2) + 1] + data[(/*PULLEY_RANCHOR2*/ 21) + 1]) - (b1[(/*BODY_POS*/ 2) + 1] + data[(/*PULLEY_RANCHOR1*/ 19) + 1]));
				var n34x = ((b4[(/*BODY_POS*/ 2)] + data[(/*PULLEY_RANCHOR4*/ 25)]) - (b3[(/*BODY_POS*/ 2)] + data[(/*PULLEY_RANCHOR3*/ 23)]));
				var n34y = ((b4[(/*BODY_POS*/ 2) + 1] + data[(/*PULLEY_RANCHOR4*/ 25) + 1]) - (b3[(/*BODY_POS*/ 2) + 1] + data[(/*PULLEY_RANCHOR3*/ 23) + 1]));

				var err12 = ((n12x * n12x) + (n12y * n12y));
				var err34 = ((n34x * n34x) + (n34y * n34y));
				var rec;
				if (err12 < Physics2DConfig.NORMALIZE_SQ_EPSILON) {
					err12 = 0;
					n12x = data[(/*PULLEY_N12*/ 29)];
					n12y = data[(/*PULLEY_N12*/ 29) + 1];
				} else {
					err12 = Math.sqrt(err12);
					rec = (1 / err12);
					n12x *= rec;
					n12y *= rec;
				}

				var ratio = data[(/*PULLEY_RATIO*/ 7)];
				if (err34 < Physics2DConfig.NORMALIZE_SQ_EPSILON) {
					err34 = 0;
					n34x = data[(/*PULLEY_N34*/ 31)];
					n34y = data[(/*PULLEY_N34*/ 31) + 1];
				} else {
					err34 = Math.sqrt(err34);
					rec = (ratio / err34);
					n34x *= rec;
					n34y *= rec;
				}

				var err = (err12 + (err34 * ratio));
				if (this._equal) {
					err -= jointMin;
					this._slack = false;
				} else if (err < jointMin) {
					err = (jointMin - err);
					n12x = -n12x;
					n12y = -n12y;
					n34x = -n34x;
					n34y = -n34y;
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
					n12x = -n12x;
					n12y = -n12y;
					n34x = -n34x;
					n34y = -n34y;

					err = 0;
					this._slack = true;
				}

				data[(/*PULLEY_N12*/ 29)] = n12x;
				data[(/*PULLEY_N12*/ 29) + 1] = n12y;
				data[(/*PULLEY_N34*/ 31)] = n34x;
				data[(/*PULLEY_N34*/ 31) + 1] = n34y;
				data[(/*PULLEY_BIAS*/ 28)] = (-err);
			};

			Physics2DPulleyConstraint.prototype._preStep = function (deltaTime) {
				this._posError();
				if (this._slack) {
					return false;
				}

				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;
				var b3 = this.bodyC._data;
				var b4 = this.bodyD._data;

				// Compute non-inverted effective mass.
				var ratioSq = data[(/*PULLEY_RATIO*/ 7)];
				ratioSq *= ratioSq;
				var n12x = data[(/*PULLEY_N12*/ 29)];
				var n12y = data[(/*PULLEY_N12*/ 29) + 1];
				var n34x = data[(/*PULLEY_N34*/ 31)];
				var n34y = data[(/*PULLEY_N34*/ 31) + 1];
				var cx1 = data[(/*PULLEY_CX1*/ 33)] = ((data[(/*PULLEY_RANCHOR1*/ 19)] * n12y) - (data[(/*PULLEY_RANCHOR1*/ 19) + 1] * n12x));
				var cx2 = data[(/*PULLEY_CX2*/ 34)] = ((data[(/*PULLEY_RANCHOR2*/ 21)] * n12y) - (data[(/*PULLEY_RANCHOR2*/ 21) + 1] * n12x));
				var cx3 = data[(/*PULLEY_CX3*/ 35)] = ((data[(/*PULLEY_RANCHOR3*/ 23)] * n34y) - (data[(/*PULLEY_RANCHOR3*/ 23) + 1] * n34x));
				var cx4 = data[(/*PULLEY_CX4*/ 36)] = ((data[(/*PULLEY_RANCHOR4*/ 25)] * n34y) - (data[(/*PULLEY_RANCHOR4*/ 25) + 1] * n34x));
				var im3 = b3[(/*BODY_IMASS*/ 0)];
				var ii3 = b3[(/*BODY_IINERTIA*/ 1)];
				var K = (b1[(/*BODY_IMASS*/ 0)] + b2[(/*BODY_IMASS*/ 0)] + (ratioSq * (im3 + b4[(/*BODY_IMASS*/ 0)])) + (cx1 * b1[(/*BODY_IINERTIA*/ 1)] * cx1) + (cx2 * b2[(/*BODY_IINERTIA*/ 1)] * cx2) + (cx3 * ii3 * cx3) + (cx4 * b4[(/*BODY_IINERTIA*/ 1)] * cx4));
				if (b2 === b3) {
					K -= 2 * ((((n12x * n34x) + (n12y * n34y)) * im3) + (cx2 * cx3 * ii3));
				}
				data[(/*PULLEY_KMASS*/ 8)] = K;

				// Invert effective mass
				Physics2DConstraint.prototype.safe_invert(data, (/*PULLEY_KMASS*/ 8), (/*PULLEY_JACC*/ 9));

				if (!this._stiff) {
					if (Physics2DConstraint.prototype.soft_params(data, (/*PULLEY_KMASS*/ 8), (/*PULLEY_GAMMA*/ 27), (/*PULLEY_BIAS*/ 28), deltaTime, this._breakUnderError)) {
						return true;
					}
				} else {
					data[(/*PULLEY_GAMMA*/ 27)] = 0;
					data[(/*PULLEY_BIAS*/ 28)] = 0;
				}

				var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
				data[(/*PULLEY_JACC*/ 9)] *= dtRatio;
				data[(/*PULLEY_JMAX*/ 10)] = (data[(/*JOINT_MAX_FORCE*/ 2)] * deltaTime);

				return false;
			};

			Physics2DPulleyConstraint.prototype._warmStart = function () {
				if (this._slack) {
					return false;
				}

				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;
				var b3 = this.bodyC._data;
				var b4 = this.bodyD._data;

				var jAcc = data[(/*PULLEY_JACC*/ 9)];
				var jx = (data[(/*PULLEY_N12*/ 29)] * jAcc);
				var jy = (data[(/*PULLEY_N12*/ 29) + 1] * jAcc);

				var im = b1[(/*BODY_IMASS*/ 0)];
				b1[(/*BODY_VEL*/ 7)] -= (jx * im);
				b1[(/*BODY_VEL*/ 7) + 1] -= (jy * im);
				b1[(/*BODY_VEL*/ 7) + 2] -= (data[(/*PULLEY_CX1*/ 33)] * jAcc * b1[(/*BODY_IINERTIA*/ 1)]);

				im = b2[(/*BODY_IMASS*/ 0)];
				b2[(/*BODY_VEL*/ 7)] += (jx * im);
				b2[(/*BODY_VEL*/ 7) + 1] += (jy * im);
				b2[(/*BODY_VEL*/ 7) + 2] += (data[(/*PULLEY_CX2*/ 34)] * jAcc * b2[(/*BODY_IINERTIA*/ 1)]);

				jx = (data[(/*PULLEY_N34*/ 31)] * jAcc);
				jy = (data[(/*PULLEY_N34*/ 31) + 1] * jAcc);

				im = b3[(/*BODY_IMASS*/ 0)];
				b3[(/*BODY_VEL*/ 7)] -= (jx * im);
				b3[(/*BODY_VEL*/ 7) + 1] -= (jy * im);
				b3[(/*BODY_VEL*/ 7) + 2] -= (data[(/*PULLEY_CX3*/ 35)] * jAcc * b3[(/*BODY_IINERTIA*/ 1)]);

				im = b4[(/*BODY_IMASS*/ 0)];
				b4[(/*BODY_VEL*/ 7)] += (jx * im);
				b4[(/*BODY_VEL*/ 7) + 1] += (jy * im);
				b4[(/*BODY_VEL*/ 7) + 2] += (data[(/*PULLEY_CX4*/ 36)] * jAcc * b4[(/*BODY_IINERTIA*/ 1)]);
			};

			Physics2DPulleyConstraint.prototype.getImpulseForBody = function (body, dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(3);
				}

				var jAcc = data[(/*PULLEY_JACC*/ 9)];

				var data = this._data;
				if (body === this.bodyA) {
					dst[0] = -(data[(/*PULLEY_N12*/ 29)] * jAcc);
					dst[1] = -(data[(/*PULLEY_N12*/ 29) + 1] * jAcc);
					dst[2] = -data[(/*PULLEY_CX1*/ 33)] * jAcc;
				} else if (body === this.bodyD) {
					dst[0] = (data[(/*PULLEY_N34*/ 31)] * jAcc);
					dst[1] = (data[(/*PULLEY_N34*/ 31) + 1] * jAcc);
					dst[2] = data[(/*PULLEY_CX4*/ 36)] * jAcc;
				} else {
					var sumX = 0;
					var sumY = 0;
					var sumW = 0;
					if (body === this.bodyB) {
						sumX += (data[(/*PULLEY_N12*/ 29)] * jAcc);
						sumY += (data[(/*PULLEY_N12*/ 29) + 1] * jAcc);
						sumW += data[(/*PULLEY_CX2*/ 34)] * jAcc;
					}
					if (body === this.bodyC) {
						sumX -= (data[(/*PULLEY_N34*/ 31)] * jAcc);
						sumY -= (data[(/*PULLEY_N34*/ 31) + 1] * jAcc);
						sumW -= data[(/*PULLEY_CX3*/ 35)] * jAcc;
					}
					dst[0] = sumX;
					dst[1] = sumY;
					dst[2] = sumW;
				}

				return dst;
			};

			Physics2DPulleyConstraint.prototype._iterateVel = function () {
				if (this._slack) {
					return false;
				}

				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;
				var b3 = this.bodyC._data;
				var b4 = this.bodyD._data;

				// x = Bias - VelocityError
				var n12x = data[(/*PULLEY_N12*/ 29)];
				var n12y = data[(/*PULLEY_N12*/ 29) + 1];
				var n34x = data[(/*PULLEY_N34*/ 31)];
				var n34y = data[(/*PULLEY_N34*/ 31) + 1];
				var cx1 = data[(/*PULLEY_CX1*/ 33)];
				var cx2 = data[(/*PULLEY_CX2*/ 34)];
				var cx3 = data[(/*PULLEY_CX3*/ 35)];
				var cx4 = data[(/*PULLEY_CX4*/ 36)];
				var x = (data[(/*PULLEY_BIAS*/ 28)] - ((n12x * (b2[(/*BODY_VEL*/ 7)] - b1[(/*BODY_VEL*/ 7)])) + (n12y * (b2[(/*BODY_VEL*/ 7) + 1] - b1[(/*BODY_VEL*/ 7) + 1])) + (n34x * (b4[(/*BODY_VEL*/ 7)] - b3[(/*BODY_VEL*/ 7)])) + (n34y * (b4[(/*BODY_VEL*/ 7) + 1] - b3[(/*BODY_VEL*/ 7) + 1])) + (cx2 * b2[(/*BODY_VEL*/ 7) + 2]) - (cx1 * b1[(/*BODY_VEL*/ 7) + 2]) + (cx4 * b4[(/*BODY_VEL*/ 7) + 2]) - (cx3 * b3[(/*BODY_VEL*/ 7) + 2])));

				var jOld = data[(/*PULLEY_JACC*/ 9)];

				// Impulse.
				// j = K * x - jAcc * gamma
				var j = ((data[(/*PULLEY_KMASS*/ 8)] * x) - (jOld * data[(/*PULLEY_GAMMA*/ 27)]));

				// Accumulate and clamp.
				var jAcc = (jOld + j);
				var jMax = data[(/*PULLEY_JMAX*/ 10)];
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
				data[(/*PULLEY_JACC*/ 9)] = jAcc;

				// Apply impulse.
				var jx = (data[(/*PULLEY_N12*/ 29)] * j);
				var jy = (data[(/*PULLEY_N12*/ 29) + 1] * j);

				var im = b1[(/*BODY_IMASS*/ 0)];
				b1[(/*BODY_VEL*/ 7)] -= (jx * im);
				b1[(/*BODY_VEL*/ 7) + 1] -= (jy * im);
				b1[(/*BODY_VEL*/ 7) + 2] -= (cx1 * j * b1[(/*BODY_IINERTIA*/ 1)]);

				im = b2[(/*BODY_IMASS*/ 0)];
				b2[(/*BODY_VEL*/ 7)] += (jx * im);
				b2[(/*BODY_VEL*/ 7) + 1] += (jy * im);
				b2[(/*BODY_VEL*/ 7) + 2] += (cx2 * j * b2[(/*BODY_IINERTIA*/ 1)]);

				jx = (data[(/*PULLEY_N34*/ 31)] * j);
				jy = (data[(/*PULLEY_N34*/ 31) + 1] * j);

				im = b3[(/*BODY_IMASS*/ 0)];
				b3[(/*BODY_VEL*/ 7)] -= (jx * im);
				b3[(/*BODY_VEL*/ 7) + 1] -= (jy * im);
				b3[(/*BODY_VEL*/ 7) + 2] -= (cx3 * j * b3[(/*BODY_IINERTIA*/ 1)]);

				im = b4[(/*BODY_IMASS*/ 0)];
				b4[(/*BODY_VEL*/ 7)] += (jx * im);
				b4[(/*BODY_VEL*/ 7) + 1] += (jy * im);
				b4[(/*BODY_VEL*/ 7) + 2] += (cx4 * j * b4[(/*BODY_IINERTIA*/ 1)]);

				return false;
			};

			Physics2DPulleyConstraint.prototype._iteratePos = function () {
				this._posError();
				if (this._slack) {
					return false;
				}

				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;
				var b3 = this.bodyC._data;
				var b4 = this.bodyD._data;

				var im1 = b1[(/*BODY_IMASS*/ 0)];
				var im2 = b2[(/*BODY_IMASS*/ 0)];
				var im3 = b3[(/*BODY_IMASS*/ 0)];
				var im4 = b4[(/*BODY_IMASS*/ 0)];
				var ii1 = b1[(/*BODY_IINERTIA*/ 1)];
				var ii2 = b2[(/*BODY_IINERTIA*/ 1)];
				var ii3 = b3[(/*BODY_IINERTIA*/ 1)];
				var ii4 = b4[(/*BODY_IINERTIA*/ 1)];

				var err = data[(/*PULLEY_BIAS*/ 28)];
				var maxError = data[(/*JOINT_MAX_ERROR*/ 3)];

				if (this._breakUnderError && (err > maxError || err < -maxError)) {
					return true;
				}

				var slop = Physics2DConfig.PULLEY_SLOP_SQ;
				if ((err * err) < slop) {
					return false;
				}

				err *= Physics2DConfig.PULLEY_BIAS_COEF;

				var ratioSq = data[(/*PULLEY_RATIO*/ 7)];
				ratioSq *= ratioSq;

				var K = (im1 + im2 + (ratioSq * (im3 + im4)));
				var n12x = data[(/*PULLEY_N12*/ 29)];
				var n12y = data[(/*PULLEY_N12*/ 29) + 1];
				var n34x = data[(/*PULLEY_N34*/ 31)];
				var n34y = data[(/*PULLEY_N34*/ 31) + 1];
				if (b2 === b3) {
					K -= 2 * ((n12x * n34x) + (n12y * n34y)) * im2;
				}

				var j, jx, jy;

				// Handle large error seperately.
				if ((err * err) > Physics2DConfig.PULLEY_LARGE_ERROR_SQ) {
					if (K > Physics2DConfig.EFF_MASS_EPSILON) {
						j = (err * Physics2DConfig.PULLEY_LARGE_ERROR_BIAS / K);
						if (this._equal || j < 0) {
							jx = (n12x * j);
							jy = (n12y * j);
							b1[(/*BODY_POS*/ 2)] -= (jx * im1);
							b1[(/*BODY_POS*/ 2) + 1] -= (jy * im1);
							b2[(/*BODY_POS*/ 2)] += (jx * im2);
							b2[(/*BODY_POS*/ 2) + 1] += (jy * im2);

							jx = (n34x * j);
							jy = (n34y * j);
							b3[(/*BODY_POS*/ 2)] -= (jx * im3);
							b3[(/*BODY_POS*/ 2) + 1] -= (jy * im3);
							b4[(/*BODY_POS*/ 2)] += (jx * im4);
							b4[(/*BODY_POS*/ 2) + 1] += (jy * im4);

							// Recalculate error.
							this._posError();
							n12x = data[(/*PULLEY_N12*/ 29)];
							n12y = data[(/*PULLEY_N12*/ 29) + 1];
							n34x = data[(/*PULLEY_N34*/ 31)];
							n34y = data[(/*PULLEY_N34*/ 31) + 1];
							err = data[(/*PULLEY_BIAS*/ 28)] * Physics2DConfig.PULLEY_BIAS_COEF;
						}
					}
				}

				var cx1 = ((data[(/*PULLEY_RANCHOR1*/ 19)] * n12y) - (data[(/*PULLEY_RANCHOR1*/ 19) + 1] * n12x));
				var cx2 = ((data[(/*PULLEY_RANCHOR2*/ 21)] * n12y) - (data[(/*PULLEY_RANCHOR2*/ 21) + 1] * n12x));
				var cx3 = ((data[(/*PULLEY_RANCHOR3*/ 23)] * n34y) - (data[(/*PULLEY_RANCHOR3*/ 23) + 1] * n34x));
				var cx4 = ((data[(/*PULLEY_RANCHOR4*/ 25)] * n34y) - (data[(/*PULLEY_RANCHOR4*/ 25) + 1] * n34x));
				K += ((cx1 * ii1 * cx1) + (cx2 * ii2 * cx2) + (cx3 * ii3 * cx3) + (cx4 * ii4 * cx4));
				if (b2 === b2) {
					K -= (2 * cx2 * ii2 * cx3);
				}

				data[(/*PULLEY_KMASS*/ 8)] = K;
				data[(/*PULLEY_BIAS*/ 28)] = err;
				Physics2DConstraint.prototype.safe_solve(data, (/*PULLEY_KMASS*/ 8), (/*PULLEY_BIAS*/ 28), (/*PULLEY_BIAS*/ 28));
				j = data[(/*PULLEY_BIAS*/ 28)];

				if (this._equal || j < 0) {
					var dr;
					jx = (n12x * j);
					jy = (n12y * j);
					b1[(/*BODY_POS*/ 2)] -= (jx * im1);
					b1[(/*BODY_POS*/ 2) + 1] -= (jy * im1);
					dr = (-cx1 * j * ii1);
					if (dr !== 0) {
						this.bodyA._deltaRotation(dr);
					}

					b2[(/*BODY_POS*/ 2)] += (jx * im2);
					b2[(/*BODY_POS*/ 2) + 1] += (jy * im2);
					dr = (cx2 * j * ii2);
					if (dr !== 0) {
						this.bodyB._deltaRotation(dr);
					}

					jx = (n34x * j);
					jy = (n34y * j);
					b3[(/*BODY_POS*/ 2)] -= (jx * im3);
					b3[(/*BODY_POS*/ 2) + 1] -= (jy * im3);
					dr = (-cx3 * j * ii3);
					if (dr !== 0) {
						this.bodyC._deltaRotation(dr);
					}

					b4[(/*BODY_POS*/ 2)] += (jx * im4);
					b4[(/*BODY_POS*/ 2) + 1] += (jy * im4);
					dr = (cx4 * j * ii4);
					if (dr !== 0) {
						this.bodyD._deltaRotation(dr);
					}
				}

				return false;
			};

			// params = {
			//   bodyA, bodyB, bodyC, bodyD // bodyB permitted equal to bodyC
			//   anchorA, anchorB, anchorC, anchorD
			//   lowerBound, upperBound, ratio
			//   .. common constraint params
			// }
			Physics2DPulleyConstraint.create = function (params) {
				var p = new Physics2DPulleyConstraint();
				var data = p._data = Types.createFloatArray((/*PULLEY_DATA_SIZE*/ 37));
				Physics2DConstraint.prototype.init(p, params);

				var anchor = params.anchorA;
				data[(/*PULLEY_LANCHOR1*/ 11)] = (anchor ? anchor[0] : 0);
				data[(/*PULLEY_LANCHOR1*/ 11) + 1] = (anchor ? anchor[1] : 0);

				anchor = params.anchorB;
				data[(/*PULLEY_LANCHOR2*/ 13)] = (anchor ? anchor[0] : 0);
				data[(/*PULLEY_LANCHOR2*/ 13) + 1] = (anchor ? anchor[1] : 0);

				anchor = params.anchorC;
				data[(/*PULLEY_LANCHOR3*/ 15)] = (anchor ? anchor[0] : 0);
				data[(/*PULLEY_LANCHOR3*/ 15) + 1] = (anchor ? anchor[1] : 0);

				anchor = params.anchorD;
				data[(/*PULLEY_LANCHOR4*/ 17)] = (anchor ? anchor[0] : 0);
				data[(/*PULLEY_LANCHOR4*/ 17) + 1] = (anchor ? anchor[1] : 0);

				var min = data[(/*PULLEY_JOINTMIN*/ 5)] = (params.lowerBound !== undefined ? params.lowerBound : 0);
				var max = data[(/*PULLEY_JOINTMAX*/ 6)] = (params.upperBound !== undefined ? params.upperBound : 0);
				p._equal = (min === max);

				data[(/*PULLEY_RATIO*/ 7)] = (params.ratio !== undefined ? params.ratio : 1);

				p._slack = false;

				p.bodyA = params.bodyA;
				p.bodyB = params.bodyB;
				p.bodyC = params.bodyC;
				p.bodyD = params.bodyD;

				// Seed normal incase initial anchors are degenerate.
				data[(/*PULLEY_N12*/ 29)] = 1;
				data[(/*PULLEY_N12*/ 29) + 1] = 0;
				data[(/*PULLEY_N34*/ 31)] = 1;
				data[(/*PULLEY_N34*/ 31) + 1] = 0;

				return p;
			};

			Physics2DPulleyConstraint.prototype._draw = function _pulleyDrawFn(debug) {
				var colA = (this.sleeping ? debug.constraintSleepingColorA : debug.constraintColorA);
				var colB = (this.sleeping ? debug.constraintSleepingColorB : debug.constraintColorB);
				var colC = (this.sleeping ? debug.constraintSleepingColorC : debug.constraintColorC);
				var colD = (this.sleeping ? debug.constraintSleepingColorD : debug.constraintColorD);
				var colSA = (this.sleeping ? debug.constraintErrorSleepingColorA : debug.constraintErrorColorA);
				var colSB = (this.sleeping ? debug.constraintErrorSleepingColorB : debug.constraintErrorColorB);
				var colSC = (this.sleeping ? debug.constraintErrorSleepingColorC : debug.constraintErrorColorC);
				var colSD = (this.sleeping ? debug.constraintErrorSleepingColorD : debug.constraintErrorColorD);

				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;
				var b3 = this.bodyC._data;
				var b4 = this.bodyD._data;

				var x1 = (b1[(/*BODY_POS*/ 2)] + data[(/*PULLEY_RANCHOR1*/ 19)]);
				var y1 = (b1[(/*BODY_POS*/ 2) + 1] + data[(/*PULLEY_RANCHOR1*/ 19) + 1]);
				var x2 = (b2[(/*BODY_POS*/ 2)] + data[(/*PULLEY_RANCHOR2*/ 21)]);
				var y2 = (b2[(/*BODY_POS*/ 2) + 1] + data[(/*PULLEY_RANCHOR2*/ 21) + 1]);
				var x3 = (b3[(/*BODY_POS*/ 2)] + data[(/*PULLEY_RANCHOR3*/ 23)]);
				var y3 = (b3[(/*BODY_POS*/ 2) + 1] + data[(/*PULLEY_RANCHOR3*/ 23) + 1]);
				var x4 = (b4[(/*BODY_POS*/ 2)] + data[(/*PULLEY_RANCHOR4*/ 25)]);
				var y4 = (b4[(/*BODY_POS*/ 2) + 1] + data[(/*PULLEY_RANCHOR4*/ 25) + 1]);

				var n12x = (x2 - x1);
				var n12y = (y2 - y1);
				var n34x = (x4 - x3);
				var n34y = (y4 - y3);
				var nL12 = Math.sqrt((n12x * n12x) + (n12y * n12y));
				var nL34 = Math.sqrt((n34x * n34x) + (n34y * n34y));
				var ratio = data[(/*PULLEY_RATIO*/ 7)];
				this._drawLink(debug, x1, y1, x2, y2, n12x, n12y, nL12, (nL34 * ratio), 1.0, colSA, colSB);
				this._drawLink(debug, x3, y3, x4, y4, n34x, n34y, nL34, nL12, (1 / ratio), colSC, colSD);

				var rad = (debug.constraintAnchorRadius * debug.screenToPhysics2D);
				debug._drawAnchor(x1, y1, rad, colA);
				debug._drawAnchor(x2, y2, rad, colB);
				debug._drawAnchor(x3, y3, rad, colC);
				debug._drawAnchor(x4, y4, rad, colD);
			};

			Physics2DPulleyConstraint.prototype._drawLink = function _drawLinkFn(debug, x1, y1, x2, y2, nx, ny, nl, bias, scale, colSA, colSB) {
				if (nl > Physics2DConfig.NORMALIZE_EPSILON) {
					var rec = (1 / nl);
					nx *= rec;
					ny *= rec;

					var midX = (0.5 * (x1 + x2));
					var midY = (0.5 * (y1 + y2));

					var data = this._data;
					var jointMin = (data[(/*PULLEY_JOINTMIN*/ 5)] - bias) * scale;
					if (jointMin < 0) {
						jointMin = 0;
					}
					var jointMax = (data[(/*PULLEY_JOINTMAX*/ 6)] - bias) * scale;
					if (jointMax < 0) {
						jointMax = 0;
					}

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
			};

		return Physics2DPulleyConstraint;
})




