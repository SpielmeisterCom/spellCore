
// =========================================================================
//
// Custom Constraint
//
// CUSTOM DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*CUSTOM_JMAX*/5
///*CUSTOM_GAMMA*/6
define(
	'spell/physics/2D/CustomConstraint',
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

		var Physics2DCustomConstraint = function() {
			Physics2DConstraint.apply(this, arguments);
			this.type = "CUSTOM";
		}
		__extends(Physics2DCustomConstraint, Physics2DConstraint);

		// ===============================================
		Physics2DCustomConstraint.prototype._inWorld = function () {
			var bodies = this.bodies;
			var limit = bodies.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				bodies[i].constraints.push(this);
			}
		};

		Physics2DCustomConstraint.prototype._outWorld = function () {
			var bodies = this.bodies;
			var limit = bodies.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var constraints = bodies[i].constraints;
				var index = constraints.indexOf(this);
				constraints[index] = constraints[constraints.length - 1];
				constraints.pop();
			}
		};

		Physics2DCustomConstraint.prototype._pairExists = function (b1, b2) {
			var bodies = this.bodies;
			var limit = bodies.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var bodyA = bodies[i];
				if (bodyA === b1 || bodyA === b2) {
					var j;
					for (j = (i + 1); j < limit; j += 1) {
						var bodyB = bodies[j];
						if ((bodyA === b1 && bodyB === b2) || (bodyA === b2 && bodyB === b1)) {
							return true;
						}
					}
				}
			}

			return false;
		};

		Physics2DCustomConstraint.prototype._wakeConnected = function () {
			var bodies = this.bodies;
			var limit = bodies.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var body = bodies[i];
				if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
					body.wake(true);
				}
			}
		};

		Physics2DCustomConstraint.prototype._sleepComputation = function (union) {
			var bodies = this.bodies;
			var limit = bodies.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var body = bodies[i];
				if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
					union(body, this);
				}
			}
		};

		// =====================================================
		Physics2DCustomConstraint.prototype._clearCache = function () {
			var data = this._data;

			var J_ACC = this._J_ACC;
			var limit = (J_ACC + this.dimension);
			var i;
			for (i = J_ACC; i < limit; i += 1) {
				data[i] = 0;
			}

			data[(/*JOINT_PRE_DT*/ 4)] = -1;
		};

		// Compute cholesky decomposition of A into
		// lower triangular matrix L. A stored
		// as symmetric matrix. and L a full matrix
		// for ease of computation.
		Physics2DCustomConstraint.prototype._cholesky = function () {
			var data = this._data;
			var A = this._K_MASS;
			var L = this._K_CHOLESKY;
			var dim = this.dimension;

			var j;
			for (j = 0; j < dim; j += 1) {
				var sum = 0;
				var k;
				for (k = 0; k <= (j - 1); k += 1) {
					var Lval = data[L + (j * dim) + k];
					sum += (Lval * Lval);
				}

				var rec = data[A] - sum;
				var zeroRank = (rec <= 0);
				if (zeroRank) {
					rec = data[A];
				}
				rec = (rec <= 0 ? 0 : Math.sqrt(rec));
				A += 1;
				data[L + (j * dim) + j] = rec;

				var i;
				if (rec !== 0 && !zeroRank) {
					rec = (1 / rec);
					for (i = (j + 1); i < dim; i += 1) {
						sum = 0;
						for (k = 0; k <= (j - 1); k += 1) {
							sum += (data[L + (i * dim) + k] * data[L + (j * dim) + k]);
						}
						data[L + (i * dim) + j] = rec * (data[A] - sum);
						A += 1;
					}
				}

				if (zeroRank) {
					for (i = (j + 1); i < dim; i += 1) {
						data[L + (i * dim) + j] = 0;
					}
					for (i = 0; i < j; i += 1) {
						data[L + (j * dim) + i] = 0;
					}
					A += (dim - j - 1);
				}
			}
		};

		// Perform multiplication with inverse of eff-mass matrix.
		// X = (LL^T)^-1 * X for L = CHOLESKY
		Physics2DCustomConstraint.prototype._transform = function (X /*floatArray*/ ) {
			var data = this._data;
			var Y = this._VECTOR_TMP;
			var L = this._K_CHOLESKY;
			var dim = this.dimension;

			// Y = (L^-1) * X
			var i, lii, sum, k;
			for (i = 0; i < dim; i += 1) {
				sum = data[X + i];
				lii = data[L + (i * dim) + i];
				if (lii !== 0) {
					for (k = 0; k < i; k += 1) {
						sum -= data[L + (i * dim) + k] * data[Y + k];
					}
					data[Y + i] = (sum / lii);
				} else {
					data[Y + i] = 0;
				}
			}

			// X = (L^T)^-1 * Y
			var ix;
			for (ix = 0; ix < dim; ix += 1) {
				i = (dim - 1 - ix);
				lii = data[L + (i * dim) + i];
				if (lii !== 0) {
					sum = data[Y + i];
					for (k = (i + 1); k < dim; k += 1) {
						sum -= data[L + (k * dim) + i] * data[X + k];
					}
					data[X + i] = (sum / lii);
				} else {
					data[X + i] = 0;
				}
			}
		};

		Physics2DCustomConstraint.prototype._effMass = function () {
			var data = this._data;
			var dimension = this.dimension;
			var bodies = this.bodies;
			var limit = bodies.length;
			var length = (limit * 3);

			// Compute non-inverted effective mass
			var JAC = this._JACOBIAN;
			var KMASS = this._K_MASS;
			var i, j, k;
			for (i = 0; i < dimension; i += 1) {
				var JACI = (JAC + (i * length));
				for (j = i; j < dimension; j += 1) {
					var JACJ = (JAC + (j * length));
					var sum = 0;
					for (k = 0; k < limit; k += 1) {
						var body = bodies[k]._data;
						var k3 = (k * 3);
						sum += (body[(/*BODY_IMASS*/ 0)] * ((data[JACI + k3] * data[JACJ + k3]) + (data[JACI + k3 + 1] * data[JACJ + k3 + 1])));
						sum += (body[(/*BODY_IINERTIA*/ 1)] * (data[JACI + k3 + 2] * data[JACJ + k3 + 2]));
					}
					data[KMASS] = sum;
					KMASS += 1;
				}
			}
		};

		Physics2DCustomConstraint.prototype._preStep = function (deltaTime) {
			var dimension = this.dimension;
			var data = this._data;
			var i, limit;

			if (this._posConsts) {
				this._posConsts.call(this);
			}

			var JAC = this._JACOBIAN;
			var K_CHOLESKY = this._K_CHOLESKY;
			var BIAS = this._BIAS;

			if (!this._stiff && !this._velocityOnly) {
				this._posError.call(this, data, BIAS);

				this._jacobian.call(this, data, JAC);
				this._effMass();
				this._cholesky();

				// Compute |BIAS|^2
				var bsq = 0;
				limit = (BIAS + dimension);
				for (i = BIAS; i < limit; i += 1) {
					var bias = data[i];
					bsq += (bias * bias);
				}

				var maxError = data[(/*JOINT_MAX_ERROR*/ 3)];
				if (this._breakUnderError && (bsq > (maxError * maxError))) {
					return true;
				}

				var omega = (2 * Math.PI * data[(/*JOINT_FREQUENCY*/ 0)]);
				var gamma = (1 / (deltaTime * omega * ((2 * data[(/*JOINT_DAMPING*/ 1)]) + (omega * deltaTime))));
				var iG = (1 / (1 + gamma));
				var biasCoef = -(deltaTime * omega * omega * gamma);

				data[(/*CUSTOM_GAMMA*/ 6)] = (gamma * iG);

				// Multiply K_CHOLESKY with (1 / sqrt(iG)).
				//
				//   (We want to mulitply inverted eff-mass with iG.
				//    Instead of iG * K^1 we have:
				//    (g * L)^T^-1 * (g * L)^-1
				//    so we must have g = 1 / sqrt(iG)
				//    so that after multiplication we get iG * K^-1
				limit = (K_CHOLESKY + (dimension * dimension));
				iG = (1 / Math.sqrt(iG));
				for (i = K_CHOLESKY; i < limit; i += 1) {
					data[i] *= iG;
				}

				// Clamp BIAS magnitude to maxError
				// (implicit via scaling of biasCoef)
				bsq *= (biasCoef * biasCoef);
				if (bsq > (maxError * maxError)) {
					biasCoef *= (maxError / Math.sqrt(bsq));
				}

				// Multiply BIAS with biasCoef
				limit = (BIAS + dimension);
				for (i = BIAS; i < limit; i += 1) {
					data[i] *= biasCoef;
				}
			} else {
				this._jacobian.call(this, data, JAC);
				this._effMass();
				this._cholesky();

				// BIAS = 0
				limit = (BIAS + dimension);
				for (i = BIAS; i < limit; i += 1) {
					data[i] = 0;
				}
				data[(/*CUSTOM_GAMMA*/ 6)] = 0;
			}

			var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);

			// Multiply J_ACC with dtRatio.
			var J_ACC = this._J_ACC;
			limit = (J_ACC + this.dimension);
			for (i = J_ACC; i < limit; i += 1) {
				data[i] *= dtRatio;
			}

			data[(/*CUSTOM_JMAX*/ 5)] = (data[(/*JOINT_MAX_FORCE*/ 2)] * deltaTime);

			return false;
		};

		Physics2DCustomConstraint.prototype._warmStart = function () {
			this._applyImpulse(this._J_ACC);
		};

		Physics2DCustomConstraint.prototype.getImpulseForBody = function (body, dst /*v2*/ ) {
			if (dst === undefined) {
				dst = Types.createFloatArray(3);
			}

			var data = this._data;
			var JAC = this._JACOBIAN;
			var J = this._J_ACC;

			var bodies = this.bodies;
			var limit = bodies.length;
			var length = (limit * 3);
			var dim = this.dimension;

			var i;
			for (i = 0; i < limit; i += 1) {
				var b = bodies[i];
				if (b === body) {
					var sumX = 0;
					var sumY = 0;
					var sumW = 0;
					var j;
					for (j = 0; j < dim; j += 1) {
						sumX += (data[J + j] * data[JAC + (length * j)]);
						sumY += (data[J + j] * data[JAC + (length * j) + 1]);
						sumW += (data[J + j] * data[JAC + (length * j) + 2]);
					}

					dst[0] = sumX;
					dst[1] = sumY;
					dst[2] = sumW;
					return dst;
				}

				JAC += 3;
			}

			dst[0] = dst[1] = dst[2] = 0;
			return dst;
		};

		Physics2DCustomConstraint.prototype._applyImpulse = function (J, position) {
			var data = this._data;
			var JAC = this._JACOBIAN;

			var bodies = this.bodies;
			var limit = bodies.length;
			var length = (limit * 3);
			var dim = this.dimension;

			var i;
			for (i = 0; i < limit; i += 1) {
				var b = bodies[i];
				var body = b._data;

				var sumX = 0;
				var sumY = 0;
				var sumW = 0;
				var j;
				for (j = 0; j < dim; j += 1) {
					sumX += (data[J + j] * data[JAC + (length * j)]);
					sumY += (data[J + j] * data[JAC + (length * j) + 1]);
					sumW += (data[J + j] * data[JAC + (length * j) + 2]);
				}

				var im = body[(/*BODY_IMASS*/ 0)];
				var dr = sumW * body[(/*BODY_IINERTIA*/ 1)];
				if (position) {
					body[(/*BODY_POS*/ 2)] += sumX * im;
					body[(/*BODY_POS*/ 2) + 1] += sumY * im;
					if (dr !== 0) {
						b._deltaRotation(dr);
					}
				} else {
					body[(/*BODY_VEL*/ 7)] += sumX * im;
					body[(/*BODY_VEL*/ 7) + 1] += sumY * im;
					body[(/*BODY_VEL*/ 7) + 2] += dr;
				}

				JAC += 3;
			}
		};

		Physics2DCustomConstraint.prototype._iterateVel = function () {
			var dimension = this.dimension;
			var data = this._data;
			var i, limit;

			var VECTOR = this._VECTOR;
			var BIAS = this._BIAS;

			// VECTOR = BIAS - velocity()
			var j;
			var bodies = this.bodies;
			var limit2 = bodies.length;
			var JAC = this._JACOBIAN;
			for (i = 0; i < dimension; i += 1) {
				var term = data[BIAS + i];
				for (j = 0; j < limit2; j += 1) {
					var body = bodies[j]._data;
					term -= ((body[(/*BODY_VEL*/ 7)] * data[JAC]) + (body[(/*BODY_VEL*/ 7) + 1] * data[JAC + 1]) + (body[(/*BODY_VEL*/ 7) + 2] * data[JAC + 2]));
					JAC += 3;
				}
				data[VECTOR + i] = term;
			}

			// VECTOR = KMASS * VECTOR
			this._transform(VECTOR);

			// JOLD = JACC
			// JACC += (VECTOR - JOLD * gamma)
			var JACC = this._J_ACC;
			var JOLD = this._VECTOR_TMP;
			var jAcc;
			var gamma = data[(/*CUSTOM_GAMMA*/ 6)];
			for (i = 0; i < dimension; i += 1) {
				jAcc = data[JOLD + i] = data[JACC + i];
				data[JACC + i] += (data[VECTOR + i] - (jAcc * gamma));
			}

			if (this._velClamp) {
				this._velClamp.call(this, data, JACC);
			}

			// jlsq = |JACC|^2
			var jlsq = 0;
			limit = (JACC + dimension);
			for (i = JACC; i < limit; i += 1) {
				jAcc = data[i];
				jlsq += (jAcc * jAcc);
			}

			var jMax = data[(/*CUSTOM_JMAX*/ 5)];
			if (this._breakUnderForce && jlsq > (jMax * jMax)) {
				return true;
			} else if (!this._stiff && jlsq > (jMax * jMax)) {
				// clamp(JACC, jMax)
				jlsq = (jMax / Math.sqrt(jlsq));
				for (i = JACC; i < limit; i += 1) {
					data[i] *= jlsq;
				}
			}

			for (i = 0; i < dimension; i += 1) {
				data[VECTOR + i] = (data[JACC + i] - data[JOLD + i]);
			}

			this._applyImpulse(VECTOR);

			return false;
		};

		Physics2DCustomConstraint.prototype._iteratePos = function () {
			if (this._velocityOnly) {
				return false;
			}

			if (this._posConsts) {
				this._posConsts.call(this);
			}

			var dimension = this.dimension;
			var data = this._data;
			var i, limit;

			var BIAS = this._BIAS;
			this._posError.call(this, data, BIAS);

			// elsq = |BIAS|^2
			// BIAS = -BIAS
			limit = (BIAS + dimension);
			var err;
			var elsq = 0;
			for (i = BIAS; i < limit; i += 1) {
				err = data[i];
				elsq += (err * err);
				data[i] = -err;
			}

			var maxError = data[(/*JOINT_MAX_ERROR*/ 3)];
			if (this._breakUnderError && (elsq > (maxError * maxError))) {
				return true;
			}

			var JAC = this._JACOBIAN;

			// Recompute jacobian
			this._jacobian.call(this, data, JAC);

			// Recompute effective mass.
			this._effMass();
			this._cholesky();

			// BIAS = KMASS * BIAS
			this._transform(BIAS);
			if (this._posClamp) {
				this._posClamp.call(this, data, BIAS);
			}

			this._applyImpulse(BIAS, true);

			return false;
		};

		Physics2DCustomConstraint.create = function (params) {
			var p = new Physics2DCustomConstraint();

			var dim = p.dimension = params.dimension;
			p.bodies = params.bodies.concat();

			// K_MASS     = (dim * (dim + 1)) / 2
			// K_CHOLSEKY = (dim * dim)
			// BIAS       = dim
			// J_ACC      = dim
			// VECTOR     = dim
			// JACOBIAN   = (dim * bodies.length * 3)
			// VECTOR_TMP = dim
			var dataSize = 7 + (dim * (4 + dim) + ((dim * (dim + 1)) / 2));
			dataSize += (dim * p.bodies.length * 3);
			p._data = Types.createFloatArray(dataSize);
			Physics2DConstraint.prototype.init(p, params);

			p._K_MASS = 7;
			p._K_CHOLESKY = p._K_MASS + ((dim * (dim + 1)) / 2);
			p._BIAS = p._K_CHOLESKY + (dim * dim);
			p._J_ACC = p._BIAS + dim;
			p._VECTOR = p._J_ACC + dim;
			p._JACOBIAN = p._VECTOR + dim;
			p._VECTOR_TMP = p._JACOBIAN + (dim * p.bodies.length * 3);

			p._draw = params.debugDraw;
			p._posConsts = params.positionConstants;
			p._posError = params.position;
			p._posClamp = params.positionClamp;
			p._velClamp = params.velocityClamp;
			p._jacobian = params.jacobian;

			p._velocityOnly = (p._posError === undefined);

			return p;
		};

		return Physics2DCustomConstraint;
})