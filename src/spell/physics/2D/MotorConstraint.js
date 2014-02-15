
// =========================================================================
//
// Motor Constraint
//
// MOTOR DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*MOTOR_RATE*/5   // Motor rate
///*MOTOR_RATIO*/6  // Motor ratio
///*MOTOR_KMASS*/7  // Effective mass (scalar)
///*MOTOR_JACC*/8   // Accumulated impulse (scalar)
///*MOTOR_JMAX*/9   // Maximum impulse (maxForce derived)
//
///*MOTOR_DATA_SIZE*/10
define(
	'spell/physics/2D/MotorConstraint',
	[
		'spell/physics/2D/Constraint',
		'spell/shared/util/platform/Types'
	],
	function(
		Physics2DConstraint,
		Types
	) {
		var __extends = function (d, b) {
			for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
			function __() { this.constructor = d; }
			__.prototype = b.prototype;
			d.prototype = new __();
		};

		var Physics2DMotorConstraint = function() {
			Physics2DConstraint.apply(this, arguments);
				this.type = "MOTOR";
				this.dimension = 1;
				// ==========================================================
				// Inherited
				this._JACC = (/*MOTOR_JACC*/ 8);
			}
			__extends(Physics2DMotorConstraint, Physics2DConstraint);

			// // Inherited
			// wake  = Physics2DConstraint.prototype.wake;
			// sleep = Physics2DConstraint.prototype.sleep;
			// configure  = Physics2DConstraint.prototype.configure;
			// isEnabled  = Physics2DConstraint.prototype.isEnabled;
			// isDisabled = Physics2DConstraint.prototype.isDisabled;
			// enable     = Physics2DConstraint.prototype.enable;
			// disable    = Physics2DConstraint.prototype.disable;
			// addEventListener    = Physics2DConstraint.prototype.addEventListener;
			// removeEventListener = Physics2DConstraint.prototype.removeEventListener;
			// ===============================================
			Physics2DMotorConstraint.prototype.getRate = function () {
				return this._data[(/*MOTOR_RATE*/ 5)];
			};
			Physics2DMotorConstraint.prototype.getRatio = function () {
				return this._data[(/*MOTOR_RATIO*/ 6)];
			};

			Physics2DMotorConstraint.prototype.setRate = function (rate) {
				var data = this._data;
				if (data[(/*MOTOR_RATE*/ 5)] !== rate) {
					data[(/*MOTOR_RATE*/ 5)] = rate;
					this.wake(true);
				}
			};
			Physics2DMotorConstraint.prototype.setRatio = function (ratio) {
				var data = this._data;
				if (data[(/*MOTOR_RATIO*/ 6)] !== ratio) {
					data[(/*MOTOR_RATIO*/ 6)] = ratio;
					this.wake(true);
				}
			};

			Physics2DMotorConstraint.prototype._preStep = function (deltaTime) {
				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;

				// Compute non-inverted effective mass
				var ratio = data[(/*MOTOR_RATIO*/ 6)];
				data[(/*MOTOR_KMASS*/ 7)] = (b1[(/*BODY_IINERTIA*/ 1)] + (ratio * ratio * b2[(/*BODY_IINERTIA*/ 1)]));

				// Invert eff-mass matrix
				Physics2DConstraint.prototype.safe_invert(data, (/*MOTOR_KMASS*/ 7), (/*MOTOR_JACC*/ 8));

				var dtRatio = Physics2DConstraint.prototype.dtRatio(data, deltaTime);
				data[(/*MOTOR_JACC*/ 8)] *= dtRatio;
				data[(/*MOTOR_JMAX*/ 9)] = (data[(/*JOINT_MAX_FORCE*/ 2)] * deltaTime);

				return false;
			};

			Physics2DMotorConstraint.prototype._warmStart = function () {
				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;

				var j = data[(/*MOTOR_JACC*/ 8)];
				b1[(/*BODY_VEL*/ 7) + 2] -= (j * b1[(/*BODY_IINERTIA*/ 1)]);
				b2[(/*BODY_VEL*/ 7) + 2] += (data[(/*MOTOR_RATIO*/ 6)] * j * b2[(/*BODY_IINERTIA*/ 1)]);
			};

			Physics2DMotorConstraint.prototype.getImpulseForBody = function (body, dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(3);
				}

				var data = this._data;

				dst[0] = dst[1] = 0;
				dst[2] = (body === this.bodyA ? -1 : (body === this.bodyB ? data[(/*MOTOR_RATIO*/ 6)] : 0)) * data[(/*MOTOR_JACC*/ 8)];
				return dst;
			};

			Physics2DMotorConstraint.prototype._iterateVel = function () {
				var data = this._data;
				var b1 = this.bodyA._data;
				var b2 = this.bodyB._data;

				var ratio = data[(/*MOTOR_RATIO*/ 6)];
				var j = (data[(/*MOTOR_KMASS*/ 7)] * (data[(/*MOTOR_RATE*/ 5)] + b1[(/*BODY_VEL*/ 7) + 2] - (ratio * b2[(/*BODY_VEL*/ 7) + 2])));
				var jOld = data[(/*MOTOR_JACC*/ 8)];
				var jAcc = (jOld + j);
				var jMax = data[(/*MOTOR_JMAX*/ 9)];
				if (this._breakUnderForce && (jAcc > jMax || jAcc < -jMax)) {
					return true;
				} else {
					if (jAcc > jMax) {
						jAcc = jMax;
					} else if (jAcc < -jMax) {
						jAcc = -jMax;
					}
				}

				j = (jAcc - jOld);
				data[(/*MOTOR_JACC*/ 8)] = jAcc;

				b1[(/*BODY_VEL*/ 7) + 2] -= (j * b1[(/*BODY_IINERTIA*/ 1)]);
				b2[(/*BODY_VEL*/ 7) + 2] += (ratio * j * b2[(/*BODY_IINERTIA*/ 1)]);

				return false;
			};

			// Velocity only constraint.
			Physics2DMotorConstraint.prototype._iteratePos = function () {
				return false;
			};

			Physics2DMotorConstraint.create = function (params) {
				var p = new Physics2DMotorConstraint();
				var data = p._data = Types.createFloatArray((/*MOTOR_DATA_SIZE*/ 10));
				Physics2DConstraint.prototype.init(p, params);

				data[(/*MOTOR_RATE*/ 5)] = (params.rate !== undefined ? params.rate : 0);
				data[(/*MOTOR_RATIO*/ 6)] = (params.ratio !== undefined ? params.ratio : 1);

				p.bodyA = params.bodyA;
				p.bodyB = params.bodyB;

				return p;
			};

			// Point these methods at specific methods on the base class.
			Physics2DMotorConstraint.prototype._inWorld = Physics2DConstraint.prototype.twoBodyInWorld;
			Physics2DMotorConstraint.prototype._outWorld = Physics2DConstraint.prototype.twoBodyOutWorld;
			Physics2DMotorConstraint.prototype._pairExists = Physics2DConstraint.prototype.twoBodyPairExists;
			Physics2DMotorConstraint.prototype._wakeConnected = Physics2DConstraint.prototype.twoBodyWakeConnected;
			Physics2DMotorConstraint.prototype._sleepComputation = Physics2DConstraint.prototype.twoBodySleepComputation;

			return Physics2DMotorConstraint;
})