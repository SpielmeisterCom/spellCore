define(
	'spell/physics/2D/Constraint',
	[
		'spell/shared/util/platform/Types'
	],
	function(Types) {
		var Physics2DConstraint = function() {
		}
		// Abstract methods to be overridden by subclasses
		Physics2DConstraint.prototype._inWorld = function () {
			//debug.abort("abstract method");
		};
		Physics2DConstraint.prototype._outWorld = function () {
			//debug.abort("abstract method");
		};
		Physics2DConstraint.prototype._pairExists = function (b1, b2) {
			//debug.abort("abstract method");
			return false;
		};
		Physics2DConstraint.prototype._wakeConnected = function () {
			//debug.abort("abstract method");
		};
		Physics2DConstraint.prototype._sleepComputation = function (union) {
			//debug.abort("abstract method");
		};
		Physics2DConstraint.prototype._preStep = function (deltaTime) {
			//debug.abort("abstract method");
			return false;
		};
		Physics2DConstraint.prototype._warmStart = function () {
			//debug.abort("abstract method");
		};
		Physics2DConstraint.prototype._iterateVel = function () {
			//debug.abort("abstract method");
			return false;
		};
		Physics2DConstraint.prototype._iteratePos = function () {
			//debug.abort("abstract method");
			return false;
		};

		Physics2DConstraint.prototype.init = function (con, params) {
			var data = con._data;
			data[(/*JOINT_FREQUENCY*/ 0)] = (params.frequency !== undefined ? params.frequency : 10.0);
			data[(/*JOINT_DAMPING*/ 1)] = (params.damping !== undefined ? params.damping : 1.0);
			data[(/*JOINT_MAX_FORCE*/ 2)] = (params.maxForce !== undefined ? params.maxForce : Number.POSITIVE_INFINITY);
			data[(/*JOINT_MAX_ERROR*/ 3)] = (params.maxError !== undefined ? params.maxError : Number.POSITIVE_INFINITY);
			data[(/*JOINT_PRE_DT*/ 4)] = -1;

			con._removeOnBreak = (params.removeOnBreak !== undefined ? params.removeOnBreak : true);
			con._breakUnderError = (params.breakUnderError !== undefined ? params.breakUnderError : false);
			con._breakUnderForce = (params.breakUnderForce !== undefined ? params.breakUnderForce : false);
			con._stiff = (params.stiff !== undefined ? params.stiff : true);
			con._ignoreInteractions = (params.ignoreInteractions !== undefined ? params.ignoreInteractions : false);
			con.sleeping = (params.sleeping !== undefined ? params.sleeping : false);
			con._active = (params.disabled !== undefined ? (!params.disabled) : true);

			con.world = null;
			con._islandRoot = null;
			con._islandRank = 0;
			con._island = null;
			con._isBody = false;

			con._wakeTime = 0;

			con._onBreak = [];
			con._onWake = [];
			con._onSleep = [];

			con.userData = (params.userData || null);
		};

		Physics2DConstraint.prototype.configure = function (params) {
			var data = this._data;
			if (params.frequency !== undefined) {
				data[(/*JOINT_FREQUENCY*/ 0)] = params.frequency;
			}
			if (params.damping !== undefined) {
				data[(/*JOINT_DAMPING*/ 1)] = params.damping;
			}
			if (params.maxForce !== undefined) {
				data[(/*JOINT_MAX_FORCE*/ 2)] = params.maxForce;
			}
			if (params.maxError !== undefined) {
				data[(/*JOINT_MAX_ERROR*/ 3)] = params.maxError;
			}
			if (params.removeOnBreak !== undefined) {
				this._removeOnBreak = params.removeOnBreak;
			}
			if (params.breakUnderError !== undefined) {
				this._breakUnderError = params.breakUnderError;
			}
			if (params.breakUnderForce !== undefined) {
				this._breakUnderForce = params.breakUnderForce;
			}
			if (params.ignoreInteractions !== undefined) {
				this._ignoreInteractions = params.ignoreInteractions;
			}
			if (params.stiff !== undefined) {
				this._stiff = params.stiff;
			}
			this.wake(true);
		};

		// ===============================================
		Physics2DConstraint.prototype.addEventListener = function (eventType, callback) {
			var events = (eventType === 'wake' ? this._onWake : eventType === 'sleep' ? this._onSleep : eventType === 'break' ? this._onBreak : null);

			if (events === null) {
				return false;
			}

			var index = events.indexOf(callback);
			if (index !== -1) {
				return false;
			}

			events.push(callback);

			this.wake();

			return true;
		};

		Physics2DConstraint.prototype.removeEventListener = function (eventType, callback) {
			var events = (eventType === 'wake' ? this._onWake : eventType === 'sleep' ? this._onSleep : eventType === 'break' ? this._onBreak : null);

			if (events === null) {
				return false;
			}

			var index = events.indexOf(callback);
			if (index === -1) {
				return false;
			}

			// Need to keep order, cannot use swap-pop
			events.splice(index, 1);

			this.wake();

			return true;
		};

		// ===============================================
		Physics2DConstraint.prototype.wake = function (automated) {
			if (!this.world) {
				this.sleeping = false;
				return;
			}

			this.world._wakeConstraint(this, !automated);
		};
		Physics2DConstraint.prototype.sleep = function () {
			if (!this.world) {
				this.sleeping = true;
				return;
			}

			this.world._forceSleepConstraint(this);
		};

		// ================================================
		Physics2DConstraint.prototype.isEnabled = function () {
			return this._active;
		};

		Physics2DConstraint.prototype.isDisabled = function () {
			return (!this._active);
		};

		Physics2DConstraint.prototype.enable = function () {
			if (!this._active) {
				this._active = true;
				if (this.world) {
					this.world._enabledConstraint(this);
					this.wake(true);
				}
			}
		};

		Physics2DConstraint.prototype.disable = function () {
			if (this._active) {
				if (this.world) {
					// Emulate a non-automated wake
					// to prevent wake callback.
					this.wake(false);
					this.world._disabledConstraint(this);
				}
				this._active = false;
			}
		};

		// ================================================
		Physics2DConstraint.prototype.getAnchorA = function (dst) {
			if (dst === undefined) {
				dst = Types.createFloatArray(2);
			}
			var data = this._data;
			var INDEX = this._ANCHOR_A;
			dst[0] = data[INDEX];
			dst[1] = data[INDEX + 1];
			return dst;
		};
		Physics2DConstraint.prototype.getAnchorB = function (dst) {
			if (dst === undefined) {
				dst = Types.createFloatArray(2);
			}
			var data = this._data;
			var INDEX = this._ANCHOR_B;
			dst[0] = data[INDEX];
			dst[1] = data[INDEX + 1];
			return dst;
		};

		Physics2DConstraint.prototype.setAnchorA = function (anchor) {
			var data = this._data;
			var INDEX = this._ANCHOR_A;
			var newX = anchor[0];
			var newY = anchor[1];
			if (newX !== data[INDEX] || newY !== data[INDEX + 1]) {
				data[INDEX] = newX;
				data[INDEX + 1] = newY;
				this.wake(true);
			}
		};
		Physics2DConstraint.prototype.setAnchorB = function (anchor) {
			var data = this._data;
			var INDEX = this._ANCHOR_B;
			var newX = anchor[0];
			var newY = anchor[1];
			if (newX !== data[INDEX] || newY !== data[INDEX + 1]) {
				data[INDEX] = newX;
				data[INDEX + 1] = newY;
				this.wake(true);
			}
		};

		Physics2DConstraint.prototype.rotateAnchor = function (data /*floatArray*/ , body, LOCAL, RELATIVE) {
			var x = data[LOCAL];
			var y = data[LOCAL + 1];
			var cos = body[(/*BODY_AXIS*/ 5)];
			var sin = body[(/*BODY_AXIS*/ 5) + 1];

			data[RELATIVE] = ((cos * x) - (sin * y));
			data[RELATIVE + 1] = ((sin * x) + (cos * y));
		};

		// ================================================
		Physics2DConstraint.prototype.dtRatio = function (data /*floatArray*/ , deltaTime) {
			var preDt = data[(/*JOINT_PRE_DT*/ 4)];
			var dtRatio = (preDt === -1 ? 1.0 : (deltaTime / preDt));
			data[(/*JOINT_PRE_DT*/ 4)] = deltaTime;
			return dtRatio;
		};

		// ================================================
		Physics2DConstraint.prototype.twoBodyInWorld = function () {
			this.bodyA.constraints.push(this);
			this.bodyB.constraints.push(this);
		};

		Physics2DConstraint.prototype.twoBodyOutWorld = function () {
			var constraints = this.bodyA.constraints;
			var index = constraints.indexOf(this);
			constraints[index] = constraints[constraints.length - 1];
			constraints.pop();

			constraints = this.bodyB.constraints;
			index = constraints.indexOf(this);
			constraints[index] = constraints[constraints.length - 1];
			constraints.pop();
		};

		Physics2DConstraint.prototype.twoBodyPairExists = function (b1, b2) {
			return ((b1 === this.bodyA && b2 === this.bodyB) || (b2 === this.bodyA && b1 === this.bodyB));
		};

		Physics2DConstraint.prototype.twoBodyWakeConnected = function () {
			var body = this.bodyA;
			if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
				body.wake(true);
			}

			body = this.bodyB;
			if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
				body.wake(true);
			}
		};

		Physics2DConstraint.prototype.twoBodySleepComputation = function (union) {
			var body = this.bodyA;
			if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
				union(body, this);
			}

			body = this.bodyB;
			if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
				union(body, this);
			}
		};

		// ================================================
		Physics2DConstraint.prototype._clearCache = function () {
			//debug.abort("abstract method");
		};

		Physics2DConstraint.prototype.clearCache = function () {
			var data = this._data;
			data[this._JACC] = 0;
			data[(/*JOINT_PRE_DT*/ 4)] = -1;
		};
		Physics2DConstraint.prototype.clearCache2 = function () {
			var data = this._data;
			var INDEX = this._JACC;
			data[INDEX] = data[INDEX + 1] = 0;
			data[(/*JOINT_PRE_DT*/ 4)] = -1;
		};
		Physics2DConstraint.prototype.clearCache3 = function () {
			var data = this._data;
			var INDEX = this._JACC;
			data[INDEX] = data[INDEX + 1] = data[INDEX + 2] = 0;
			data[(/*JOINT_PRE_DT*/ 4)] = -1;
		};

		// ================================================
		// Soft constraint parameter logic.
		// storing gamma at index GAMMA
		// scaling effective mass at KMASS
		// scaling bias at BIAS
		// and returning true if constraint was broken.
		Physics2DConstraint.prototype.soft_params = function (data /*floatArray*/ , KMASS, GAMMA, BIAS, deltaTime, breakUnderError) {
			var bias = data[BIAS];
			var bsq = (bias * bias);
			var maxError = data[(/*JOINT_MAX_ERROR*/ 3)];
			if (breakUnderError && (bsq > (maxError * maxError))) {
				return true;
			}

			var omega = (2 * Math.PI * data[(/*JOINT_FREQUENCY*/ 0)]);
			var gamma = (1 / (deltaTime * omega * ((2 * data[(/*JOINT_DAMPING*/ 1)]) + (omega * deltaTime))));
			var iG = (1 / (1 + gamma));
			var biasCoef = (deltaTime * omega * omega * gamma);

			data[GAMMA] = (gamma * iG);
			data[KMASS] *= iG;

			bias *= biasCoef;
			bsq *= (biasCoef * biasCoef);
			if (bsq > (maxError * maxError)) {
				bsq = (maxError / Math.sqrt(bsq));
				bias *= bsq;
			}
			data[BIAS] = bias;
			return false;
		};
		Physics2DConstraint.prototype.soft_params2 = function (data /*floatArray*/ , KMASS, GAMMA, BIAS, deltaTime, breakUnderError) {
			var biasX = data[BIAS];
			var biasY = data[BIAS + 1];
			var bsq = ((biasX * biasX) + (biasY * biasY));
			var maxError = data[(/*JOINT_MAX_ERROR*/ 3)];
			if (breakUnderError && (bsq > (maxError * maxError))) {
				return true;
			}

			var omega = (2 * Math.PI * data[(/*JOINT_FREQUENCY*/ 0)]);
			var gamma = (1 / (deltaTime * omega * ((2 * data[(/*JOINT_DAMPING*/ 1)]) + (omega * deltaTime))));
			var iG = (1 / (1 + gamma));
			var biasCoef = (deltaTime * omega * omega * gamma);

			data[GAMMA] = (gamma * iG);
			data[KMASS] *= iG;
			data[KMASS + 1] *= iG;
			data[KMASS + 2] *= iG;

			biasX *= biasCoef;
			biasY *= biasCoef;
			bsq *= (biasCoef * biasCoef);
			if (bsq > (maxError * maxError)) {
				bsq = (maxError / Math.sqrt(bsq));
				biasX *= bsq;
				biasY *= bsq;
			}
			data[BIAS] = biasX;
			data[BIAS + 1] = biasY;
			return false;
		};
		Physics2DConstraint.prototype.soft_params3 = function (data /*floatArray*/ , KMASS, GAMMA, BIAS, deltaTime, breakUnderError) {
			var biasX = data[BIAS];
			var biasY = data[BIAS + 1];
			var biasZ = data[BIAS + 2];
			var bsq = ((biasX * biasX) + (biasY * biasY) + (biasZ * biasZ));
			var maxError = data[(/*JOINT_MAX_ERROR*/ 3)];
			if (breakUnderError && (bsq > (maxError * maxError))) {
				return true;
			}

			var omega = (2 * Math.PI * data[(/*JOINT_FREQUENCY*/ 0)]);
			var gamma = (1 / (deltaTime * omega * ((2 * data[(/*JOINT_DAMPING*/ 1)]) + (omega * deltaTime))));
			var iG = (1 / (1 + gamma));
			var biasCoef = (deltaTime * omega * omega * gamma);

			data[GAMMA] = (gamma * iG);
			data[KMASS] *= iG;
			data[KMASS + 1] *= iG;
			data[KMASS + 2] *= iG;
			data[KMASS + 3] *= iG;
			data[KMASS + 4] *= iG;
			data[KMASS + 5] *= iG;

			biasX *= biasCoef;
			biasY *= biasCoef;
			biasZ *= biasCoef;
			bsq *= (biasCoef * biasCoef);
			if (bsq > (maxError * maxError)) {
				bsq = (maxError / Math.sqrt(bsq));
				biasX *= bsq;
				biasY *= bsq;
				biasZ *= bsq;
			}
			data[BIAS] = biasX;
			data[BIAS + 1] = biasY;
			data[BIAS + 2] = biasZ;
			return false;
		};

		// Solve K * j = err, permitting degeneracies in K
		// indices JMASS, ERR, IMP
		// ERR may be equal to IMP.
		Physics2DConstraint.prototype.safe_solve = function (data /*floatArray*/ , KMASS, ERR, IMP) {
			var err = data[ERR];
			var K = data[KMASS];
			data[IMP] = (K !== 0 ? (err / K) : 0);
		};
		Physics2DConstraint.prototype.safe_solve2 = function (data /*floatArray*/ , KMASS, ERR, IMP) {
			var errX = data[ERR];
			var errY = data[ERR + 1];

			var Ka = data[KMASS];
			var Kb = data[KMASS + 1];
			var Kc = data[KMASS + 2];
			var det = ((Ka * Kc) - (Kb * Kb));
			if (det === 0) {
				// Consider ranks seperately.
				data[IMP] = (Ka !== 0 ? (errX / Ka) : 0);
				data[IMP + 1] = (Kc !== 0 ? (errY / Kc) : 0);
			} else {
				// Full matrix inversion.
				det = (1 / det);
				data[IMP] = (det * ((Kc * errX) - (Kb * errY)));
				data[IMP + 1] = (det * ((Ka * errY) - (Kb * errX)));
			}
		};
		Physics2DConstraint.prototype.safe_solve3 = function (data /*floatArray*/ , KMASS, ERR, IMP) {
			var errX = data[ERR];
			var errY = data[ERR + 1];
			var errZ = data[ERR + 2];

			var Ka = data[KMASS];
			var Kb = data[KMASS + 1];
			var Kc = data[KMASS + 2];
			var Kd = data[KMASS + 3];
			var Ke = data[KMASS + 4];
			var Kf = data[KMASS + 5];

			var A = ((Kd * Kf) - (Ke * Ke));
			var B = ((Kc * Ke) - (Kb * Kf));
			var C = ((Kb * Ke) - (Kc * Kd));
			var det = ((Ka * A) + (Kb * B) + (Kc * C));
			if (det === 0) {
				det = ((Ka * Kd) - (Kb * Kb));
				if (det !== 0) {
					// Invert matrix ignoring bottom rank.
					// [Ka Kb #]
					// [Kb Kd #]
					// [#  #  #]
					det = (1 / det);
					data[IMP] = (det * ((Kd * errX) - (Kb * errY)));
					data[IMP + 1] = (det * ((Ka * errY) - (Kb * errX)));
					data[IMP + 2] = (Kf !== 0 ? (errZ / Kf) : 0);
					return;
				}

				det = ((Ka * Kf) - (Kc * Kc));
				if (det !== 0) {
					// Invert matrix ignoring bottom rank.
					// [Ka # Kc]
					// [#  #  #]
					// [Kc # Kf]
					det = (1 / det);
					data[IMP] = (det * ((Kf * errX) - (Kc * errZ)));
					data[IMP + 1] = (Kd !== 0 ? (errY / Kd) : 0);
					data[IMP + 2] = (det * ((Ka * errZ) - (Kc * errX)));
					return;
				}

				det = ((Kd * Kf) - (Ke * Ke));
				if (det !== 0) {
					// Invert matrix ignoring top rank
					// [#  #  #]
					// [# Kd Ke]
					// [# Ke Kf]
					det = (1 / det);
					data[IMP] = (Ka !== 0 ? (errX / Ka) : 0);
					data[IMP + 1] = (det * ((Kf * errY) - (Ke * errZ)));
					data[IMP + 2] = (det * ((Kd * errZ) - (Ke * errY)));
					return;
				}

				// Consider all ranks seperately.
				data[IMP] = (Ka !== 0 ? (errX / Ka) : 0);
				data[IMP + 1] = (Kd !== 0 ? (errY / Kd) : 0);
				data[IMP + 2] = (Kf !== 0 ? (errZ / Kf) : 0);
			} else {
				// Full matrix inversion.
				det = (1 / det);
				var D = ((Ka * Kf) - (Kc * Kc));
				var E = ((Kb * Kc) - (Ka * Ke));
				var F = ((Ka * Kd) - (Kb * Kb));
				data[IMP] = (det * ((A * errX) + (B * errY) + (C * errZ)));
				data[IMP + 1] = (det * ((B * errX) + (D * errY) + (E * errZ)));
				data[IMP + 2] = (det * ((C * errX) + (E * errY) + (F * errZ)));
			}
		};

		// Invert matrix stored symmetrically in data at
		// indices KMASS
		// with accumulated impulse at indices JACC
		Physics2DConstraint.prototype.safe_invert = function (data /*floatArray*/ , KMASS, JACC) {
			// Invert [K != 0] into [1 / K]
			// And otherwise into [0] with zero-ed JACC
			var K = data[KMASS];
			if (K === 0) {
				data[JACC] = 0;
			} else {
				data[KMASS] = (1 / K);
			}
		};
		Physics2DConstraint.prototype.safe_invert2 = function (data /*floatArray*/ , KMASS, JACC) {
			var Ka = data[KMASS];
			var Kb = data[KMASS + 1];
			var Kc = data[KMASS + 2];

			var det = ((Ka * Kc) - (Kb * Kb));
			if (det === 0) {
				// Consider both ranks seperately.
				if (Ka !== 0) {
					data[KMASS] = (1 / Ka);
				} else {
					data[JACC] = 0.0;
				}

				if (Kc !== 0) {
					data[KMASS + 2] = (1 / Kc);
				} else {
					data[JACC + 1] = 0.0;
				}

				data[KMASS + 1] = 0.0;
			} else {
				// Full matrix inversion.
				det = (1 / det);
				data[KMASS] = (det * Kc);
				data[KMASS + 1] = (det * -Kb);
				data[KMASS + 2] = (det * Ka);
			}
		};
		Physics2DConstraint.prototype.safe_invert3 = function (data /*floatArray*/ , KMASS, JACC) {
			var Ka = data[KMASS];
			var Kb = data[KMASS + 1];
			var Kc = data[KMASS + 2];
			var Kd = data[KMASS + 3];
			var Ke = data[KMASS + 4];
			var Kf = data[KMASS + 5];

			var A = ((Kd * Kf) - (Ke * Ke));
			var B = ((Kc * Ke) - (Kb * Kf));
			var C = ((Kb * Ke) - (Kc * Kd));
			var det = ((Ka * A) + (Kb * B) + (Kc * C));
			if (det === 0) {
				det = ((Ka * Kd) - (Kb * Kb));
				if (det !== 0) {
					// Invert matrix ignoring bottom rank
					// [Ka Kb #]
					// [Kb Kd #]
					// [#  #  #]
					det = (1 / det);
					data[KMASS] = (det * Kd);
					data[KMASS + 1] = (det * -Kb);
					data[KMASS + 3] = (det * Ka);

					// Consider bottom rank seperately.
					if (Kf !== 0) {
						data[KMASS + 5] = (1 / Kf);
					} else {
						data[JACC + 2] = 0;
					}

					data[KMASS + 2] = data[KMASS + 4] = 0;
					return;
				}

				det = ((Ka * Kf) - (Kc * Kc));
				if (det !== 0) {
					// Invert matrix ignoring middle rank
					// [Ka # Kc]
					// [#  #  #]
					// [Kc # Kf]
					det = (1 / det);
					data[KMASS] = (det * Kf);
					data[KMASS + 2] = (det * -Kc);
					data[KMASS + 5] = (det * Ka);

					// Consider middle rank seperately.
					if (Kd !== 0) {
						data[KMASS + 3] = (1 / Kd);
					} else {
						data[JACC + 1] = 0;
					}

					data[KMASS + 1] = data[KMASS + 4] = 0;
					return;
				}

				det = ((Kd * Kf) - (Ke * Ke));
				if (det !== 0) {
					// Invert matrix ignoring top rank
					// [#  #  #]
					// [# Kd Ke]
					// [# Ke Kf]
					det = (1 / det);
					data[KMASS + 3] = (det * Kf);
					data[KMASS + 4] = (det * -Ke);
					data[KMASS + 5] = (det * Kd);

					// Consider top rank seperately.
					if (Ka !== 0) {
						data[KMASS] = (1 / Ka);
					} else {
						data[JACC] = 0;
					}

					data[KMASS + 1] = data[KMASS + 2] = 0;
					return;
				}

				// Consider all ranks seperately
				if (Ka !== 0) {
					data[KMASS] = (1 / Ka);
				} else {
					data[JACC] = 0;
				}

				if (Kd !== 0) {
					data[KMASS + 3] = (1 / Kd);
				} else {
					data[JACC + 1] = 0;
				}

				if (Kf !== 0) {
					data[KMASS + 5] = (1 / Kf);
				} else {
					data[JACC + 2] = 0;
				}

				data[KMASS + 1] = data[KMASS + 2] = data[KMASS + 4] = 0;
			} else {
				// Full matrix inversion.
				det = (1 / det);
				data[KMASS] = (det * A);
				data[KMASS + 1] = (det * B);
				data[KMASS + 2] = (det * C);
				data[KMASS + 3] = (det * ((Ka * Kf) - (Kc * Kc)));
				data[KMASS + 4] = (det * ((Kb * Kc) - (Ka * Ke)));
				data[KMASS + 5] = (det * ((Ka * Kd) - (Kb * Kb)));
			}
		};
		return Physics2DConstraint;
})