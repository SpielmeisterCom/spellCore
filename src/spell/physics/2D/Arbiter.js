
// =====================================================================
//
// Physics2D Arbiter
//
//
// ARBITER DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
// Velocity iterations.
// these values must remain below (31) as used as bit accessors
// on userdef flag.
///*ARB_DYN_FRIC*/0      // Coef. dynamic friction
///*ARB_STATIC_FRIC*/1   // Coef. static friction
///*ARB_ELASTICITY*/2    // Coef. elasticity
///*ARB_ROLLING_FRIC*/3  // Coef. rolling friction
//
///*ARB_NORMAL*/4        // World space normal (velocity iterations) (x, y)
///*ARB_PREDT*/6         // Previous time-step on computation for scaling.
//
// Jacobian (first contact)
///*ARB_RN1A*/7          // (contact1.ra cross normal)
///*ARB_RN1B*/8          // (contact1.rb cross normal)
///*ARB_RT1A*/9          // (contact1.ra dot normal)
///*ARB_RT1B*/10          // (contact1.rb dot normal)
//
// Position iterations.
///*ARB_LNORM*/11         // Local normal of reference edge (x, y)
///*ARB_LPROJ*/13         // Local projection onto reference edge.
///*ARB_RADIUS*/14        // Sum radius of shapes (0 poly, radius circle)
///*ARB_BIAS*/15          // Bias coeffecient
//
// 2-contact arbiter only.
// Jacobian second contact
///*ARB_RN2A*/16          // (contact2.ra cross normal)
///*ARB_RN2B*/17          // (contact2.rb cross normal)
///*ARB_RT2A*/18          // (contact2.ra dot normal)
///*ARB_RT2B*/19          // (contact2.rb dot normal)
////**/
///*ARB_K*/20             // Block solver non-inverted effectivemass [a b; b c] (sym. matrix)
///*ARB_KMASS*/23         // (1 / det) of ARB_K for on the fly inversion.
//
// 1-contact arbiter only. (when one is a circle)
///*ARB_JRACC*/16         // Accumulated rolling friction impulse
///*ARB_RMASS*/17         // Rolling friction effectivemass.
//
//
//
///*ARB_DATA_SIZE*/24
//
//
// Flags for when user has explicitly set values on arbiter.
///*USERDEF_DYN*/1
///*USERDEF_STAT*/2
///*USERDEF_ROLLING*/4
///*USERDEF_ELASTICITY*/8
//
// Face flags
///*FACE_CIRCLE*/0
///*FACE_1*/1
///*FACE_2*/2
//
// Hash flags
///*HASH_CIRCLE*/0
///*HASH_LEFT*/1
///*HASH_RIGHT*/2
//
// State flags
///*STATE_ACCEPT*/1
///*STATE_ALWAYS*/2
define(
	'spell/physics/2D/Arbiter',
	[
		'spell/physics/2D/Config',
		'spell/physics/2D/Contact',
		'spell/shared/util/platform/Types'
	],
	function(
		Physics2DConfig,
		Physics2DContact,
		Types
	) {
		var Physics2DArbiter = function() {
			this.shapeA = null;
			this.shapeB = null;
			this.bodyA = null;
			this.bodyB = null;
			this._next = null;

			this._retired = false; // set to true when arbiter is lazily retired to be removed in step()
			this._lazyRetired = false;
			this._static = false;
			this._state = 0;
			this.sensor = false;

			this._createStamp = 0; // time stamp at which arbiter was created.
			this._updateStamp = 0; // time stamp at which arbiter was updated.
			this._sleepStamp = 0; // time stamp at which arbiter was put to sleep
			this._timeStamp = 0; // time stamp set before collision detection so that

			// injected contacts have correct time set without later
			// iteration.
			this._createContinuous = false; // Marks createStamp as having been set during

			// continuous collisions for callbacks.
			this._endGenerated = 0; // time stamp at which end event was generated.

			// This deals with another corner case where
			// object seperates (end event), then continuously collide
			// needing to generate a begin even for the same pair of
			// objects (same arbiter) in the same step!.
			this._midStep = false; // Set to true before preSolve events are called to avoid waking bodies.

			this.sleeping = false;
			this.active = false;
			this._invalidated = false;

			this._data = Types.createFloatArray((/*ARB_DATA_SIZE*/ 24));
			this.contacts = [];

			this._userdef = 0; // bit-flags for if user has set an elasticity/friction value.
			this._velocity2Contact = false;
			this._position2Contact = false;
			this._contact1 = this._contact2 = null;
			this._faceType = 0; // FACE_CIRCLE/FACE_1/FACE_2
		}
		Physics2DArbiter.prototype.getNormal = function (dst /*v2*/ ) {
			if (dst === undefined) {
				dst = Types.createFloatArray(2);
			}
			if (this.sensor) {
				dst[0] = dst[1] = 0;
			} else {
				var data = this._data;
				dst[0] = data[(/*ARB_NORMAL*/ 4)];
				dst[1] = data[(/*ARB_NORMAL*/ 4) + 1];
			}
			return dst;
		};

		Physics2DArbiter.prototype.getRollingImpulse = function () {
			if (this.sensor || this._velocity2Contact || this._contact1._hash !== (/*HASH_CIRCLE*/ 0)) {
				return 0;
			} else {
				return this._data[(/*ARB_JRACC*/ 16)];
			}
		};

		// =========================================================
		Physics2DArbiter.prototype.getElasticity = function () {
			if (this.sensor) {
				return undefined;
			}

			this._validate();
			return this._data[(/*ARB_ELASTICITY*/ 2)];
		};

		Physics2DArbiter.prototype.getDynamicFriction = function () {
			if (this.sensor) {
				return undefined;
			}

			this._validate();
			return this._data[(/*ARB_DYN_FRIC*/ 0)];
		};

		Physics2DArbiter.prototype.getStaticFriction = function () {
			if (this.sensor) {
				return undefined;
			}

			this._validate();
			return this._data[(/*ARB_STATIC_FRIC*/ 1)];
		};

		Physics2DArbiter.prototype.getRollingFriction = function () {
			if (this.sensor) {
				return undefined;
			}

			this._validate();
			return this._data[(/*ARB_ROLLING_FRIC*/ 3)];
		};

		/*jshint bitwise: false*/
		Physics2DArbiter.prototype.setElasticity = function (elasticity) {
			if (this.sensor) {
				return;
			}

			this._data[(/*ARB_ELASTICITY*/ 2)] = elasticity;
			this._userdef |= (1 << (/*ARB_ELASTICITY*/ 2));
			this._invalidate(true);
		};

		Physics2DArbiter.prototype.setDynamicFriction = function (dynamicFriction) {
			if (this.sensor) {
				return;
			}

			this._data[(/*ARB_DYN_FRIC*/ 0)] = dynamicFriction;
			this._userdef |= (1 << (/*ARB_DYN_FRIC*/ 0));
			this._invalidate(true);
		};

		Physics2DArbiter.prototype.setStaticFriction = function (staticFriction) {
			if (this.sensor) {
				return;
			}

			this._data[(/*ARB_STAT_FRIC*/ 1)] = staticFriction;
			this._userdef |= (1 << (/*ARB_STAT_FRIC*/ 1));
			this._invalidate(true);
		};

		Physics2DArbiter.prototype.setRollingFriction = function (rollingFriction) {
			if (this.sensor) {
				return;
			}

			this._data[(/*ARB_ROLLING_FRIC*/ 3)] = rollingFriction;
			this._userdef |= (1 << (/*ARB_ROLLING_FRIC*/ 3));
			this._invalidate(true);
		};

		Physics2DArbiter.prototype.setElasticityFromShapes = function () {
			if (this.sensor) {
				return;
			}

			this._userdef &= ~(1 << (/*ARB_ELASTICITY*/ 2));
			this._invalidate(true);
		};

		Physics2DArbiter.prototype.setDynamicFrictionFromShapes = function () {
			if (this.sensor) {
				return;
			}

			this._userdef &= ~(1 << (/*ARB_DYN_FRIC*/ 0));
			this._invalidate(true);
		};

		Physics2DArbiter.prototype.setStaticFrictionFromShapes = function () {
			if (this.sensor) {
				return;
			}

			this._userdef &= ~(1 << (/*ARB_STAT_FRIC*/ 1));
			this._invalidate(true);
		};

		Physics2DArbiter.prototype.setRollingFrictionFromShapes = function () {
			if (this.sensor) {
				return;
			}

			this._userdef &= ~(1 << (/*ARB_ROLLING_FRIC*/ 3));
			this._invalidate(true);
		};

		/*jshint bitwise: true*/
		// =========================================================
		/*jshint bitwise: false*/
		Physics2DArbiter.prototype.isStateAccepted = function () {
			if (this.sensor) {
				return false;
			} else {
				return ((this._state & (/*STATE_ACCEPT*/ 1)) !== 0);
			}
		};

		Physics2DArbiter.prototype.isStatePersistent = function () {
			if (this.sensor) {
				return false;
			} else {
				return ((this._state & (/*STATE_ALWAYS*/ 2)) !== 0);
			}
		};

		Physics2DArbiter.prototype.setAcceptedState = function (accepted) {
			if (this.sensor) {
				return;
			}

			if (accepted) {
				this._state |= (/*STATE_ACCEPT*/ 1);
			} else {
				this._state &= ~(/*STATE_ACCEPT*/ 1);
			}
			this._invalidate(true);
		};

		Physics2DArbiter.prototype.setPersistentState = function (persistent) {
			if (this.sensor) {
				return;
			}

			if (persistent) {
				this._state |= (/*STATE_ALWAYS*/ 2);
			} else {
				this._state &= ~(/*STATE_ALWAYS*/ 2);
			}
			this._invalidate(true);
		};

		/*jshint bitwise: true*/
		// =========================================================
		// Called when arbiter is destroyed by removal of a shape
		// Or change in body type signialling end of an interaction.
		// In either case, arbiter was woken and sleeping is false.
		//
		// Effect is that in following step, arbiter is permitted
		// to persist one additional frame (for any end events)
		// and then in the next step retired fully and reused.
		Physics2DArbiter.prototype._lazyRetire = function (ignoreShape) {
			this._lazyRetired = true;
			this._retired = true;
			this.active = false;

			var arbiters;
			var index;
			if (this.shapeA !== ignoreShape) {
				arbiters = this.shapeA.arbiters;
				index = arbiters.indexOf(this);
				arbiters[index] = arbiters[arbiters.length - 1];
				arbiters.pop();
			}
			if (this.shapeB !== ignoreShape) {
				arbiters = this.shapeB.arbiters;
				index = arbiters.indexOf(this);
				arbiters[index] = arbiters[arbiters.length - 1];
				arbiters.pop();
			}
		};

		Physics2DArbiter.prototype._assign = function (s1, s2) {
			this.bodyA = s1.body;
			this.bodyB = s2.body;
			this.shapeA = s1;
			this.shapeB = s2;

			s1.arbiters.push(this);
			s2.arbiters.push(this);

			this._retired = false;
			this.sleeping = false;

			this._invalidate();
		};

		Physics2DArbiter.prototype._retire = function () {
			this.shapeA = this.shapeB = null;
			this.bodyA = this.bodyB = null;
			this._retired = true;
			this._lazyRetired = false;
			this.active = false;
			this._data[(/*ARB_PREDT*/ 6)] = 0;

			var contacts = this.contacts;
			while (contacts.length > 0) {
				var contact = contacts.pop();
				Physics2DContact.deallocate(contact);
			}
			this._contact1 = this._contact2 = null;
		};

		// =====================================================================
		Physics2DArbiter.prototype._invalidate = function (dontSkip) {
			this._invalidated = true;
			if (dontSkip && !this._midStep) {
				this.shapeA.body.wake();
				this.shapeB.body.wake();
			}
		};

		Physics2DArbiter.prototype._validate = function () {
			this._invalidated = false;

			var data = this._data;
			var mA = this.shapeA._material._data;
			var mB = this.shapeB._material._data;
			var userdef = this._userdef;

			/*jshint bitwise: false*/
			if ((userdef & (1 << (/*ARB_ELASTICITY*/ 2))) === 0) {
				var elasticity;
				var elasticA = mA[(/*MAT_ELASTICITY*/ 0)];
				var elasticB = mB[(/*MAT_ELASTICITY*/ 0)];
				if (elasticA <= Number.NEGATIVE_INFINITY || elasticB <= Number.NEGATIVE_INFINITY) {
					elasticity = 0;
				} else if (elasticA >= Number.POSITIVE_INFINITY || elasticB >= Number.POSITIVE_INFINITY) {
					elasticity = 1;
				} else {
					elasticity = (elasticA + elasticB) * 0.5;
					if (elasticity < 0) {
						elasticity = 0;
					} else if (elasticity > 1) {
						elasticity = 1;
					}
				}
				data[(/*ARB_ELASTICITY*/ 2)] = elasticity;
			}

			var sqrt = Math.sqrt;
			if ((userdef & (1 << (/*ARB_DYN_FRIC*/ 0))) === 0) {
				data[(/*ARB_DYN_FRIC*/ 0)] = sqrt(mA[(/*MAT_DYNAMIC*/ 2)] * mB[(/*MAT_DYNAMIC*/ 2)]);
			}
			if ((userdef & (1 << (/*ARB_STATIC_FRIC*/ 1))) === 0) {
				data[(/*ARB_STATIC_FRIC*/ 1)] = sqrt(mA[(/*MAT_STATIC*/ 1)] * mB[(/*MAT_STATIC*/ 1)]);
			}
			if ((userdef & (1 << (/*ARB_ROLLING_FRIC*/ 3))) === 0) {
				data[(/*ARB_ROLLING_FRIC*/ 3)] = sqrt(mA[(/*MAT_ROLLING*/ 3)] * mB[(/*MAT_ROLLING*/ 3)]);
			}
			/*jshint bitwise: true*/
		};

		// =====================================================================
		Physics2DArbiter.prototype._injectContact = function (px, py, nx, ny, dist, hash, virtual) {
			var contact;
			var contacts = this.contacts;
			var limit = contacts.length;
			if (limit !== 0) {
				contact = contacts[0];
				if (contact._hash !== hash) {
					if (limit !== 1) {
						contact = contacts[1];
						if (contact._hash !== hash) {
							contact = null;
						}
					} else {
						contact = null;
					}
				}
			}

			if (virtual === undefined) {
				virtual = false;
			}

			var data;
			if (!contact) {
				contact = Physics2DContact.allocate();
				data = contact._data;
				data[(/*CON_JNACC*/ 11)] = data[(/*CON_JTACC*/ 12)] = 0;
				contact._hash = hash;
				contact.fresh = (!virtual);
				contacts.push(contact);

				if (hash === (/*HASH_CIRCLE*/ 0)) {
					this._data[(/*ARB_JRACC*/ 16)] = 0;
				}
			} else {
				contact.fresh = (!virtual && contact.virtual);
				data = contact._data;
			}

			data[(/*CON_POS*/ 0)] = px;
			data[(/*CON_POS*/ 0) + 1] = py;
			data[(/*CON_DIST*/ 2)] = dist;
			contact._timeStamp = this._timeStamp;
			contact.virtual = virtual;

			data = this._data;
			data[(/*ARB_NORMAL*/ 4)] = nx;
			data[(/*ARB_NORMAL*/ 4) + 1] = ny;

			return contact;
		};

		Physics2DArbiter.prototype._cleanContacts = function (timeStamp) {
			var fst = true;
			this._position2Contact = false;
			this._contact2 = null;
			var contacts = this.contacts;
			var limit = contacts.length;
			var i;
			for (i = 0; i < limit;) {
				var c = contacts[i];
				if (c._timeStamp + Physics2DConfig.DELAYED_DEATH < timeStamp) {
					limit -= 1;
					contacts[i] = contacts[limit];
					contacts.pop();
					Physics2DContact.deallocate(c);
					continue;
				}

				c.active = (c._timeStamp === timeStamp);
				if (c.active) {
					if (fst) {
						this._contact1 = c;
						fst = false;
					} else {
						this._contact2 = c;
						this._position2Contact = true;
					}
				}

				i += 1;
			}

			if (this._position2Contact) {
				if (this._contact1.virtual) {
					var tmp = this._contact1;
					this._contact1 = this._contact2;
					this._contact2 = tmp;
				}
				this._velocity2Contact = !(this._contact2.virtual);
			} else {
				this._velocity2Contact = false;
			}

			return !fst;
		};

		// =====================================================================
		Physics2DArbiter.prototype._preStep = function (deltaTime, timeStamp, continuous) {
			if (!this._cleanContacts(timeStamp)) {
				return false;
			}

			if (this._invalidated) {
				this._validate();
			}

			var adata = this._data;
			var predt = adata[(/*ARB_PREDT*/ 6)];
			var dtRatio = (predt === 0) ? 1 : (deltaTime / predt);
			adata[(/*ARB_PREDT*/ 6)] = deltaTime;

			var data1 = this.bodyA._data;
			var data2 = this.bodyB._data;

			var px1 = data1[(/*BODY_POS*/ 2)];
			var py1 = data1[(/*BODY_POS*/ 2) + 1];
			var px2 = data2[(/*BODY_POS*/ 2)];
			var py2 = data2[(/*BODY_POS*/ 2) + 1];

			var vx1 = data1[(/*BODY_VEL*/ 7)];
			var vy1 = data1[(/*BODY_VEL*/ 7) + 1];
			var vw1 = data1[(/*BODY_VEL*/ 7) + 2];
			var vx2 = data2[(/*BODY_VEL*/ 7)];
			var vy2 = data2[(/*BODY_VEL*/ 7) + 1];
			var vw2 = data2[(/*BODY_VEL*/ 7) + 2];

			var nx = adata[(/*ARB_NORMAL*/ 4)];
			var ny = adata[(/*ARB_NORMAL*/ 4) + 1];

			var massSum = data1[(/*BODY_IMASS*/ 0)] + data2[(/*BODY_IMASS*/ 0)];

			var ii1 = data1[(/*BODY_IINERTIA*/ 1)];
			var ii2 = data2[(/*BODY_IINERTIA*/ 1)];

			var EPS = Physics2DConfig.EFF_MASS_EPSILON;
			var BIAS = (continuous ? (this._static ? Physics2DConfig.CONT_STATIC_BIAS_COEF : Physics2DConfig.CONT_BIAS_COEF) : this._static ? Physics2DConfig.STATIC_BIAS_COEF : Physics2DConfig.BIAS_COEF);
			adata[(/*ARB_BIAS*/ 15)] = BIAS;

			var c = this._contact1;
			var data;
			var rx1, ry1, rx2, ry2;
			while (true) {
				data = c._data;

				var px = data[(/*CON_POS*/ 0)];
				var py = data[(/*CON_POS*/ 0) + 1];

				// Contact point relative vectors.
				rx1 = data[(/*CON_REL1*/ 7)] = (px - px1);
				ry1 = data[(/*CON_REL1*/ 7) + 1] = (py - py1);
				rx2 = data[(/*CON_REL2*/ 9)] = (px - px2);
				ry2 = data[(/*CON_REL2*/ 9) + 1] = (py - py2);

				// Tangent effective mass.
				var v1 = (rx1 * nx) + (ry1 * ny);
				var v2 = (rx2 * nx) + (ry2 * ny);
				var kt = massSum + (ii2 * v2 * v2) + (ii1 * v1 * v1);
				data[(/*CON_TMASS*/ 6)] = (kt < EPS) ? 0 : (1 / kt);

				// Normal effective mass.
				v1 = (rx1 * ny) - (ry1 * nx);
				v2 = (rx2 * ny) - (ry2 * nx);
				var kn = massSum + (ii2 * v2 * v2) + (ii1 * v1 * v1);
				data[(/*CON_NMASS*/ 5)] = (kn < EPS) ? 0 : (1 / kn);

				// Relative velocity at contact point.
				var vrx = (vx2 - (ry2 * vw2)) - (vx1 - (ry1 * vw1));
				var vry = (vy2 + (rx2 * vw2)) - (vy1 + (rx1 * vw1));

				// Compute bounce error
				var vdot = (nx * vrx) + (ny * vry);
				var bounce = (vdot * adata[(/*ARB_ELASTICITY*/ 2)]);
				if (bounce > -Physics2DConfig.BOUNCE_VELOCITY_THRESHOLD) {
					bounce = 0;
				}
				data[(/*CON_BOUNCE*/ 3)] = bounce;

				// Compute friction coef.
				vdot = (nx * vry) - (ny * vrx);
				if ((vdot * vdot) > Physics2DConfig.STATIC_FRIC_SQ_EPSILON) {
					data[(/*CON_FRICTION*/ 4)] = adata[(/*ARB_DYN_FRIC*/ 0)];
				} else {
					data[(/*CON_FRICTION*/ 4)] = adata[(/*ARB_STATIC_FRIC*/ 1)];
				}

				// Scale impulses from change in time step
				data[(/*CON_JNACC*/ 11)] *= dtRatio;
				data[(/*CON_JTACC*/ 12)] *= dtRatio;

				// Advance to next contact.
				if (this._velocity2Contact) {
					if (c === this._contact2) {
						break;
					}
					c = this._contact2;
				} else {
					break;
				}
			}

			data = this._contact1._data;
			rx1 = data[(/*CON_REL1*/ 7)];
			ry1 = data[(/*CON_REL1*/ 7) + 1];
			rx2 = data[(/*CON_REL2*/ 9)];
			ry2 = data[(/*CON_REL2*/ 9) + 1];
			var rn1a = adata[(/*ARB_RN1A*/ 7)] = (rx1 * ny) - (ry1 * nx);
			var rn1b = adata[(/*ARB_RN1B*/ 8)] = (rx2 * ny) - (ry2 * nx);
			adata[(/*ARB_RT1A*/ 9)] = (rx1 * nx) + (ry1 * ny);
			adata[(/*ARB_RT1B*/ 10)] = (rx2 * nx) + (ry2 * ny);

			if (!this._velocity2Contact && this._contact1._hash === (/*HASH_CIRCLE*/ 0)) {
				adata[(/*ARB_JRACC*/ 16)] *= dtRatio;
				var sum = ii1 + ii2;
				adata[(/*ARB_RMASS*/ 17)] = (sum < EPS) ? 0 : (1 / sum);
			} else if (this._velocity2Contact) {
				data = this._contact2._data;
				var r2x1 = data[(/*CON_REL1*/ 7)];
				var r2y1 = data[(/*CON_REL1*/ 7) + 1];
				var r2x2 = data[(/*CON_REL2*/ 9)];
				var r2y2 = data[(/*CON_REL2*/ 9) + 1];
				var rn2a = adata[(/*ARB_RN2A*/ 16)] = (r2x1 * ny) - (r2y1 * nx);
				var rn2b = adata[(/*ARB_RN2B*/ 17)] = (r2x2 * ny) - (r2y2 * nx);
				adata[(/*ARB_RT2A*/ 18)] = (r2x1 * nx) + (r2y1 * ny);
				adata[(/*ARB_RT2B*/ 19)] = (r2x2 * nx) + (r2y2 * ny);

				var Ka = adata[(/*ARB_K*/ 20)] = massSum + (ii1 * rn1a * rn1a) + (ii2 * rn1b * rn1b);
				var Kb = adata[(/*ARB_K*/ 20) + 1] = massSum + (ii1 * rn1a * rn2a) + (ii2 * rn1b * rn2b);
				var Kc = adata[(/*ARB_K*/ 20) + 2] = massSum + (ii1 * rn2a * rn2a) + (ii2 * rn2b * rn2b);

				// Degenerate case! eek.
				var det = ((Ka * Kc) - (Kb * Kb));
				if ((Ka * Ka) > (Physics2DConfig.ILL_THRESHOLD * det)) {
					if (this._contact2._data[(/*CON_DIST*/ 2)] < this._contact1._data[(/*CON_DIST*/ 2)]) {
						this._contact1 = this._contact2;
						adata[(/*ARB_RN1A*/ 7)] = rn2a;
						adata[(/*ARB_RN1B*/ 8)] = rn2b;
						adata[(/*ARB_RT1A*/ 9)] = adata[(/*ARB_RT2A*/ 18)];
						adata[(/*ARB_RT1B*/ 10)] = adata[(/*ARB_RT2B*/ 19)];
					}
					this._velocity2Contact = false;
					this._position2Contact = false;
					this._contact2 = null;
				} else {
					adata[(/*ARB_KMASS*/ 23)] = (1 / det);
				}
			}

			return true;
		};

		// =====================================================================
		Physics2DArbiter.prototype._iterateVelocity = function () {
			var data1 = this.bodyA._data;
			var data2 = this.bodyB._data;
			var im1 = data1[(/*BODY_IMASS*/ 0)];
			var ii1 = data1[(/*BODY_IINERTIA*/ 1)];
			var im2 = data2[(/*BODY_IMASS*/ 0)];
			var ii2 = data2[(/*BODY_IINERTIA*/ 1)];
			var vx1 = data1[(/*BODY_VEL*/ 7)];
			var vy1 = data1[(/*BODY_VEL*/ 7) + 1];
			var vw1 = data1[(/*BODY_VEL*/ 7) + 2];
			var vx2 = data2[(/*BODY_VEL*/ 7)];
			var vy2 = data2[(/*BODY_VEL*/ 7) + 1];
			var vw2 = data2[(/*BODY_VEL*/ 7) + 2];

			var adata = this._data;
			var nx = adata[(/*ARB_NORMAL*/ 4)];
			var ny = adata[(/*ARB_NORMAL*/ 4) + 1];
			var rn1a = adata[(/*ARB_RN1A*/ 7)];
			var rn1b = adata[(/*ARB_RN1B*/ 8)];
			var rt1a = adata[(/*ARB_RT1A*/ 9)];
			var rt1b = adata[(/*ARB_RT1B*/ 10)];

			var cdata1 = this._contact1._data;
			var rx1 = cdata1[(/*CON_REL1*/ 7)];
			var ry1 = cdata1[(/*CON_REL1*/ 7) + 1];
			var rx2 = cdata1[(/*CON_REL2*/ 9)];
			var ry2 = cdata1[(/*CON_REL2*/ 9) + 1];

			var surfaceX = (data2[(/*BODY_SURFACE_VEL*/ 13)] - data1[(/*BODY_SURFACE_VEL*/ 13)]);
			var surfaceY = (data2[(/*BODY_SURFACE_VEL*/ 13) + 1] - data1[(/*BODY_SURFACE_VEL*/ 13) + 1]);

			// Relative velocity first contact
			var vrx1 = (vx2 - (ry2 * vw2)) - (vx1 - (ry1 * vw1));
			var vry1 = (vy2 + (rx2 * vw2)) - (vy1 + (rx1 * vw1));

			var j, jOld, cjAcc, jx, jy, jMax;

			// First contact friction
			j = (((nx * vry1) - (ny * vrx1)) + surfaceX) * cdata1[(/*CON_TMASS*/ 6)];
			jMax = (cdata1[(/*CON_FRICTION*/ 4)] * cdata1[(/*CON_JNACC*/ 11)]);
			jOld = cdata1[(/*CON_JTACC*/ 12)];
			cjAcc = (jOld - j);
			if (cjAcc > jMax) {
				cjAcc = jMax;
			} else if (cjAcc < -jMax) {
				cjAcc = -jMax;
			}
			j = (cjAcc - jOld);
			cdata1[(/*CON_JTACC*/ 12)] = cjAcc;

			jx = (-ny * j);
			jy = (nx * j);
			vx1 -= (jx * im1);
			vy1 -= (jy * im1);
			vw1 -= (rt1a * j * ii1);
			vx2 += (jx * im2);
			vy2 += (jy * im2);
			vw2 += (rt1b * j * ii2);

			if (this._velocity2Contact) {
				var cdata2 = this._contact2._data;
				var r2x1 = cdata2[(/*CON_REL1*/ 7)];
				var r2y1 = cdata2[(/*CON_REL1*/ 7) + 1];
				var r2x2 = cdata2[(/*CON_REL2*/ 9)];
				var r2y2 = cdata2[(/*CON_REL2*/ 9) + 1];

				var Ka = adata[(/*ARB_K*/ 20)];
				var Kb = adata[(/*ARB_K*/ 20) + 1];
				var Kc = adata[(/*ARB_K*/ 20) + 2];
				var idet = adata[(/*ARB_KMASS*/ 23)];

				var rn2a = adata[(/*ARB_RN2A*/ 16)];
				var rn2b = adata[(/*ARB_RN2B*/ 17)];
				var rt2a = adata[(/*ARB_RT2A*/ 18)];
				var rt2b = adata[(/*ARB_RT2B*/ 19)];

				// Second contact friction
				var vrx2 = (vx2 - (r2y2 * vw2)) - (vx1 - (r2y1 * vw1));
				var vry2 = (vy2 + (r2x2 * vw2)) - (vy1 + (r2x1 * vw1));

				j = (((nx * vry2) - (ny * vrx2)) + surfaceX) * cdata2[(/*CON_TMASS*/ 6)];
				jMax = (cdata2[(/*CON_FRICTION*/ 4)] * cdata2[(/*CON_JNACC*/ 11)]);
				jOld = cdata2[(/*CON_JTACC*/ 12)];
				cjAcc = (jOld - j);
				if (cjAcc > jMax) {
					cjAcc = jMax;
				} else if (cjAcc < -jMax) {
					cjAcc = -jMax;
				}
				j = (cjAcc - jOld);
				cdata2[(/*CON_JTACC*/ 12)] = cjAcc;

				jx = (-ny * j);
				jy = (nx * j);
				vx1 -= (jx * im1);
				vy1 -= (jy * im1);
				vw1 -= (rt2a * j * ii1);
				vx2 += (jx * im2);
				vy2 += (jy * im2);
				vw2 += (rt2b * j * ii2);

				// Normal impulses.
				vrx1 = (vx2 - (ry2 * vw2)) - (vx1 - (ry1 * vw1));
				vry1 = (vy2 + (rx2 * vw2)) - (vy1 + (rx1 * vw1));
				vrx2 = (vx2 - (r2y2 * vw2)) - (vx1 - (r2y1 * vw1));
				vry2 = (vy2 + (r2x2 * vw2)) - (vy1 + (r2x1 * vw1));

				var ax = cdata1[(/*CON_JNACC*/ 11)];
				var ay = cdata2[(/*CON_JNACC*/ 11)];

				// Block solver for both normal impulses together.
				var jnx = ((vrx1 * nx) + (vry1 * ny)) + surfaceY + cdata1[(/*CON_BOUNCE*/ 3)] - ((Ka * ax) + (Kb * ay));
				var jny = ((vrx2 * nx) + (vry2 * ny)) + surfaceY + cdata2[(/*CON_BOUNCE*/ 3)] - ((Kb * ax) + (Kc * ay));

				var xx = idet * ((Kb * jny) - (Kc * jnx));
				var xy = idet * ((Kb * jnx) - (Ka * jny));

				if (xx >= 0 && xy >= 0) {
					jnx = (xx - ax);
					jny = (xy - ay);
					cdata1[(/*CON_JNACC*/ 11)] = xx;
					cdata2[(/*CON_JNACC*/ 11)] = xy;
				} else {
					xx = -(cdata1[(/*CON_NMASS*/ 5)] * jnx);
					if (xx >= 0 && ((Kb * xx) + jny) >= 0) {
						jnx = (xx - ax);
						jny = -ay;
						cdata1[(/*CON_JNACC*/ 11)] = xx;
						cdata2[(/*CON_JNACC*/ 11)] = 0;
					} else {
						xy = -(cdata2[(/*CON_NMASS*/ 5)] * jny);
						if (xy >= 0 && ((Kb * xy) + jnx) >= 0) {
							jnx = -ax;
							jny = (xy - ay);
							cdata1[(/*CON_JNACC*/ 11)] = 0;
							cdata2[(/*CON_JNACC*/ 11)] = xy;
						} else if (jnx >= 0 && jny >= 0) {
							jnx = -ax;
							jny = -ay;
							cdata1[(/*CON_JNACC*/ 11)] = cdata2[(/*CON_JNACC*/ 11)] = 0;
						} else {
							jnx = 0;
							jny = 0;
						}
					}
				}

				// Apply impulses
				j = (jnx + jny);
				jx = (nx * j);
				jy = (ny * j);

				vx1 -= (jx * im1);
				vy1 -= (jy * im1);
				vw1 -= ((rn1a * jnx) + (rn2a * jny)) * ii1;
				vx2 += (jx * im2);
				vy2 += (jy * im2);
				vw2 += ((rn1b * jnx) + (rn2b * jny)) * ii2;
			} else {
				if (this._contact1._hash === (/*HASH_CIRCLE*/ 0)) {
					// rolling impulse.
					var dw = (vw2 - vw1);
					j = (dw * adata[(/*ARB_RMASS*/ 17)]);
					jMax = (adata[(/*ARB_ROLLING_FRIC*/ 3)] * cdata1[(/*CON_JNACC*/ 11)]);
					jOld = adata[(/*ARB_JRACC*/ 16)];
					cjAcc = (jOld - j);
					if (cjAcc > jMax) {
						cjAcc = jMax;
					} else if (cjAcc < -jMax) {
						cjAcc = -jMax;
					}
					j = (cjAcc - jOld);
					adata[(/*ARB_JRACC*/ 16)] = cjAcc;

					vw1 -= (j * ii1);
					vw2 += (j * ii2);
				}

				// normal impulse.
				vrx1 = (vx2 - (ry2 * vw2)) - (vx1 - (ry1 * vw1));
				vry1 = (vy2 + (rx2 * vw2)) - (vy1 + (rx1 * vw1));

				j = (cdata1[(/*CON_BOUNCE*/ 3)] + surfaceY + ((nx * vrx1) + (ny * vry1))) * cdata1[(/*CON_NMASS*/ 5)];
				jOld = cdata1[(/*CON_JNACC*/ 11)];
				cjAcc = (jOld - j);
				if (cjAcc < 0) {
					cjAcc = 0;
				}
				j = (cjAcc - jOld);
				cdata1[(/*CON_JNACC*/ 11)] = cjAcc;

				jx = (nx * j);
				jy = (ny * j);
				vx1 -= (jx * im1);
				vy1 -= (jy * im1);
				vw1 -= (rn1a * j * ii1);
				vx2 += (jx * im2);
				vy2 += (jy * im2);
				vw2 += (rn1b * j * ii2);
			}

			data1[(/*BODY_VEL*/ 7)] = vx1;
			data1[(/*BODY_VEL*/ 7) + 1] = vy1;
			data1[(/*BODY_VEL*/ 7) + 2] = vw1;
			data2[(/*BODY_VEL*/ 7)] = vx2;
			data2[(/*BODY_VEL*/ 7) + 1] = vy2;
			data2[(/*BODY_VEL*/ 7) + 2] = vw2;
		};

		// =====================================================================
		Physics2DArbiter.prototype._refreshContactData = function () {
			var data1 = this.bodyA._data;
			var data2 = this.bodyB._data;
			var cos1 = data1[(/*BODY_AXIS*/ 5)];
			var sin1 = data1[(/*BODY_AXIS*/ 5) + 1];
			var cos2 = data2[(/*BODY_AXIS*/ 5)];
			var sin2 = data2[(/*BODY_AXIS*/ 5) + 1];
			var px1 = data1[(/*BODY_POS*/ 2)];
			var py1 = data1[(/*BODY_POS*/ 2) + 1];
			var px2 = data2[(/*BODY_POS*/ 2)];
			var py2 = data2[(/*BODY_POS*/ 2) + 1];

			var err, nx, ny;
			var adata = this._data;
			var rad = adata[(/*ARB_RADIUS*/ 14)];
			var cdata1 = this._contact1._data;
			if (this._faceType === (/*FACE_CIRCLE*/ 0)) {
				var x = cdata1[(/*CON_LREL1*/ 13)];
				var y = cdata1[(/*CON_LREL1*/ 13) + 1];
				var rx1 = ((cos1 * x) - (sin1 * y) + px1);
				var ry1 = ((sin1 * x) + (cos1 * y) + py1);

				x = cdata1[(/*CON_LREL2*/ 15)];
				y = cdata1[(/*CON_LREL2*/ 15) + 1];
				var rx2 = ((cos2 * x) - (sin2 * y) + px2);
				var ry2 = ((sin2 * x) + (cos2 * y) + py2);

				var dx = (rx2 - rx1);
				var dy = (ry2 - ry1);
				var dl = Math.sqrt((dx * dx) + (dy * dy));

				nx = adata[(/*ARB_NORMAL*/ 4)];
				ny = adata[(/*ARB_NORMAL*/ 4) + 1];
				if (dl < Physics2DConfig.NORMALIZE_EPSILON) {
					dx = nx;
					dy = ny;
				} else {
					var rec = (1 / dl);
					dx *= rec;
					dy *= rec;
				}

				err = (dl - rad);
				if (((dx * nx) + (dy * ny)) < 0) {
					err -= rad;
					dx = -dx;
					dy = -dy;
				}

				adata[(/*ARB_NORMAL*/ 4)] = dx;
				adata[(/*ARB_NORMAL*/ 4) + 1] = dy;
				var px, py, r1;
				if (this.shapeA._type === (/*TYPE_CIRCLE*/ 0)) {
					r1 = this.shapeA._data[(/*CIRCLE_RADIUS*/ 6)] + (err * 0.5);
					px = cdata1[(/*CON_POS*/ 0)] = (rx1 + (dx * r1));
					py = cdata1[(/*CON_POS*/ 0) + 1] = (ry1 + (dy * r1));
				} else {
					r1 = this.shapeB._data[(/*CIRCLE_RADIUS*/ 6)] + (err * 0.5);
					px = cdata1[(/*CON_POS*/ 0)] = (rx2 - (dx * r1));
					py = cdata1[(/*CON_POS*/ 0) + 1] = (ry2 - (dy * r1));
				}
				cdata1[(/*CON_DIST*/ 2)] = err;
			} else {
				var cdata2 = (this._position2Contact ? this._contact2._data : null);
				var proj;
				var cx1, cx2, cy1, cy2;

				var lx = adata[(/*ARB_LNORM*/ 11)];
				var ly = adata[(/*ARB_LNORM*/ 11) + 1];
				var rx = cdata1[(/*CON_LREL1*/ 13)];
				var ry = cdata1[(/*CON_LREL1*/ 13) + 1];
				if (this._faceType === (/*FACE_1*/ 1)) {
					nx = (lx * cos1) - (ly * sin1);
					ny = (lx * sin1) + (ly * cos1);
					proj = adata[(/*ARB_LPROJ*/ 13)] + ((nx * px1) + (ny * py1));
					cx1 = (px2 + (rx * cos2) - (ry * sin2));
					cy1 = (py2 + (rx * sin2) + (ry * cos2));
					if (cdata2) {
						rx = cdata2[(/*CON_LREL1*/ 13)];
						ry = cdata2[(/*CON_LREL1*/ 13) + 1];
						cx2 = (px2 + (rx * cos2) - (ry * sin2));
						cy2 = (py2 + (rx * sin2) + (ry * cos2));
					}
				} else {
					nx = (lx * cos2) - (ly * sin2);
					ny = (lx * sin2) + (ly * cos2);
					proj = adata[(/*ARB_LPROJ*/ 13)] + ((nx * px2) + (ny * py2));
					cx1 = (px1 + (rx * cos1) - (ry * sin1));
					cy1 = (py1 + (rx * sin1) + (ry * cos1));
					if (cdata2) {
						rx = cdata2[(/*CON_LREL1*/ 13)];
						ry = cdata2[(/*CON_LREL1*/ 13) + 1];
						cx2 = (px1 + (rx * cos1) - (ry * sin1));
						cy2 = (py1 + (rx * sin1) + (ry * cos1));
					}
				}

				var flip = (this._reverse ? -1 : 1);
				adata[(/*ARB_NORMAL*/ 4)] = (flip * nx);
				adata[(/*ARB_NORMAL*/ 4) + 1] = (flip * ny);

				var bias = -proj - rad;

				err = ((cx1 * nx) + (cy1 * ny)) + bias;
				var df = ((err * 0.5) + rad);
				cdata1[(/*CON_POS*/ 0)] = (cx1 - (nx * df));
				cdata1[(/*CON_POS*/ 0) + 1] = (cy1 - (ny * df));
				cdata1[(/*CON_DIST*/ 2)] = err;

				if (cdata2) {
					err = ((cx2 * nx) + (cy2 * ny)) + bias;
					df = ((err * 0.5) + rad);
					cdata2[(/*CON_POS*/ 0)] = (cx2 - (nx * df));
					cdata2[(/*CON_POS*/ 0) + 1] = (cy2 - (ny * df));
					cdata2[(/*CON_DIST*/ 2)] = err;
				}
			}
		};

		Physics2DArbiter.prototype._iteratePosition = function () {
			this._refreshContactData();

			var b1 = this.bodyA;
			var b2 = this.bodyB;
			var data1 = b1._data;
			var data2 = b2._data;
			var im1 = data1[(/*BODY_IMASS*/ 0)];
			var ii1 = data1[(/*BODY_IINERTIA*/ 1)];
			var im2 = data2[(/*BODY_IMASS*/ 0)];
			var ii2 = data2[(/*BODY_IINERTIA*/ 1)];
			var px1 = data1[(/*BODY_POS*/ 2)];
			var py1 = data1[(/*BODY_POS*/ 2) + 1];
			var px2 = data2[(/*BODY_POS*/ 2)];
			var py2 = data2[(/*BODY_POS*/ 2) + 1];

			var px, py, nx, ny, Jx, Jy, jn, dr, Ka, bc;
			var c1r1x, c1r1y, c1r2x, c1r2y, rn1a, rn1b;

			var adata = this._data;
			var cdata1 = this._contact1._data;
			var err1 = cdata1[(/*CON_DIST*/ 2)] + Physics2DConfig.CONTACT_SLOP;
			if (this._position2Contact) {
				var cdata2 = this._contact2._data;
				var err2 = cdata2[(/*CON_DIST*/ 2)] + Physics2DConfig.CONTACT_SLOP;
				if (err1 < 0 || err2 < 0) {
					px = cdata1[(/*CON_POS*/ 0)];
					py = cdata1[(/*CON_POS*/ 0) + 1];
					c1r1x = (px - px1);
					c1r1y = (py - py1);
					c1r2x = (px - px2);
					c1r2y = (py - py2);

					px = cdata2[(/*CON_POS*/ 0)];
					py = cdata2[(/*CON_POS*/ 0) + 1];
					var c2r1x = (px - px1);
					var c2r1y = (py - py1);
					var c2r2x = (px - px2);
					var c2r2y = (py - py2);

					nx = adata[(/*ARB_NORMAL*/ 4)];
					ny = adata[(/*ARB_NORMAL*/ 4) + 1];

					rn1a = (c1r1x * ny) - (c1r1y * nx);
					rn1b = (c1r2x * ny) - (c1r2y * nx);
					var rn2a = (c2r1x * ny) - (c2r1y * nx);
					var rn2b = (c2r2x * ny) - (c2r2y * nx);

					// Non-inverted block effective-mass.
					var massSum = (im1 + im2);
					Ka = massSum + (ii1 * rn1a * rn1a) + (ii2 * rn1b * rn1b);
					var Kb = massSum + (ii1 * rn1a * rn2a) + (ii2 * rn1b * rn2b);
					var Kc = massSum + (ii1 * rn2a * rn2a) + (ii2 * rn2b * rn2b);

					bc = adata[(/*ARB_BIAS*/ 15)];
					var bx = (err1 * bc);
					var by = (err2 * bc);

					// Block solver.
					var det = ((Ka * Kc) - (Kb * Kb));
					var xx, xy;
					if (det === 0) {
						xx = (Ka === 0) ? 0 : (-bx / Ka);
						xy = (Kc === 0) ? 0 : (-by / Kc);
					} else {
						det = (1 / det);
						xx = (det * (Kb * by - Kc * bx));
						xy = (det * (Kb * bx - Ka * by));
					}

					if (xx < 0 || xy < 0) {
						xx = (-bx / Ka);
						xy = 0;
						if (xx < 0 || ((Kb * xx) + by) < 0) {
							xx = 0;
							xy = (-by / Kc);
							if (xy < 0 || ((Kb * xy) + bx) < 0) {
								xx = xy = 0;
							}
						}
					}

					// Apply impulses.
					jn = xx + xy;
					Jx = (nx * jn);
					Jy = (ny * jn);

					px1 -= (Jx * im1);
					py1 -= (Jy * im1);
					dr = -((rn1a * xx) + (rn2a * xy)) * ii1;
					if (dr !== 0) {
						b1._deltaRotation(dr);
					}
					px2 += (Jx * im2);
					py2 += (Jy * im2);
					dr = ((rn1b * xx) + (rn2b * xy)) * ii2;
					if (dr !== 0) {
						b2._deltaRotation(dr);
					}
				}
			} else {
				if (err1 < 0) {
					px = cdata1[(/*CON_POS*/ 0)];
					py = cdata1[(/*CON_POS*/ 0) + 1];

					c1r1x = (px - px1);
					c1r1y = (py - py1);
					c1r2x = (px - px2);
					c1r2y = (py - py2);

					nx = adata[(/*ARB_NORMAL*/ 4)];
					ny = adata[(/*ARB_NORMAL*/ 4) + 1];

					// jac
					rn1a = (c1r1x * ny) - (c1r1y * nx);
					rn1b = (c1r2x * ny) - (c1r2y * nx);

					// eff-mass
					Ka = im2 + (rn1b * rn1b * ii2) + im1 + (rn1a * rn1a * ii1);
					if (Ka !== 0) {
						bc = adata[(/*ARB_BIAS*/ 15)];
						jn = -(bc * err1 / Ka);
						Jx = (nx * jn);
						Jy = (ny * jn);

						px1 -= (Jx * im1);
						py1 -= (Jy * im1);
						dr = -(rn1a * ii1 * jn);
						if (dr !== 0) {
							b1._deltaRotation(dr);
						}
						px2 += (Jx * im2);
						py2 += (Jy * im2);
						dr = (rn1b * ii2 * jn);
						if (dr !== 0) {
							b2._deltaRotation(dr);
						}
					}
				}
			}

			data1[(/*BODY_POS*/ 2)] = px1;
			data1[(/*BODY_POS*/ 2) + 1] = py1;
			data2[(/*BODY_POS*/ 2)] = px2;
			data2[(/*BODY_POS*/ 2) + 1] = py2;
		};

		// =====================================================================
		Physics2DArbiter.prototype._warmStart = function () {
			var data1 = this.bodyA._data;
			var data2 = this.bodyB._data;
			var im1 = data1[(/*BODY_IMASS*/ 0)];
			var ii1 = data1[(/*BODY_IINERTIA*/ 1)];
			var im2 = data2[(/*BODY_IMASS*/ 0)];
			var ii2 = data2[(/*BODY_IINERTIA*/ 1)];

			var adata = this._data;
			var nx = adata[(/*ARB_NORMAL*/ 4)];
			var ny = adata[(/*ARB_NORMAL*/ 4) + 1];

			var cdata = this._contact1._data;
			var jn = cdata[(/*CON_JNACC*/ 11)];
			var jt = cdata[(/*CON_JTACC*/ 12)];

			var jx = (nx * jn) - (ny * jt);
			var jy = (ny * jn) + (nx * jt);
			data1[(/*BODY_VEL*/ 7)] -= (jx * im1);
			data1[(/*BODY_VEL*/ 7) + 1] -= (jy * im1);
			data1[(/*BODY_VEL*/ 7) + 2] -= ((cdata[(/*CON_REL1*/ 7)] * jy) - (cdata[(/*CON_REL1*/ 7) + 1] * jx)) * ii1;
			data2[(/*BODY_VEL*/ 7)] += (jx * im2);
			data2[(/*BODY_VEL*/ 7) + 1] += (jy * im2);
			data2[(/*BODY_VEL*/ 7) + 2] += ((cdata[(/*CON_REL2*/ 9)] * jy) - (cdata[(/*CON_REL2*/ 9) + 1] * jx)) * ii2;

			if (this._velocity2Contact) {
				cdata = this._contact2._data;
				jn = cdata[(/*CON_JNACC*/ 11)];
				jt = cdata[(/*CON_JTACC*/ 12)];

				jx = (nx * jn) - (ny * jt);
				jy = (ny * jn) + (nx * jt);
				data1[(/*BODY_VEL*/ 7)] -= (jx * im1);
				data1[(/*BODY_VEL*/ 7) + 1] -= (jy * im1);
				data1[(/*BODY_VEL*/ 7) + 2] -= ((cdata[(/*CON_REL1*/ 7)] * jy) - (cdata[(/*CON_REL1*/ 7) + 1] * jx)) * ii1;
				data2[(/*BODY_VEL*/ 7)] += (jx * im2);
				data2[(/*BODY_VEL*/ 7) + 1] += (jy * im2);
				data2[(/*BODY_VEL*/ 7) + 2] += ((cdata[(/*CON_REL2*/ 9)] * jy) - (cdata[(/*CON_REL2*/ 9) + 1] * jx)) * ii2;
			} else if (this._contact1._hash === (/*HASH_CIRCLE*/ 0)) {
				jn = adata[(/*ARB_JRACC*/ 16)];

				data1[(/*BODY_VEL*/ 7) + 2] -= (jn * ii1);
				data2[(/*BODY_VEL*/ 7) + 2] += (jn * ii2);
			}
		};

		Physics2DArbiter.prototype.getImpulseForBody = function (body, dst /*v3*/ ) {
			if (dst === undefined) {
				dst = Types.createFloatArray(3);
			}

			var adata = this._data;
			var nx = adata[(/*ARB_NORMAL*/ 4)];
			var ny = adata[(/*ARB_NORMAL*/ 4) + 1];

			var cdata = this._contact1._data;
			var jn = cdata[(/*CON_JNACC*/ 11)];
			var jt = cdata[(/*CON_JTACC*/ 12)];

			var jx = (nx * jn) - (ny * jt);
			var jy = (ny * jn) + (nx * jt);

			var sumX = 0;
			var sumY = 0;
			var sumW = 0;
			if (body === this.bodyA) {
				sumX -= jx;
				sumY -= jy;
				sumW -= ((cdata[(/*CON_REL1*/ 7)] * jy) - (cdata[(/*CON_REL1*/ 7) + 1] * jx));
			} else if (body === this.bodyB) {
				sumX += jx;
				sumY += jy;
				sumW += ((cdata[(/*CON_REL2*/ 9)] * jy) - (cdata[(/*CON_REL2*/ 9) + 1] * jx));
			}

			if (this._velocity2Contact) {
				cdata = this._contact2._data;
				jn = cdata[(/*CON_JNACC*/ 11)];
				jt = cdata[(/*CON_JTACC*/ 12)];

				jx = (nx * jn) - (ny * jt);
				jy = (ny * jn) + (nx * jt);
				if (body === this.bodyA) {
					sumX -= jx;
					sumY -= jy;
					sumW -= ((cdata[(/*CON_REL1*/ 7)] * jy) - (cdata[(/*CON_REL1*/ 7) + 1] * jx));
				} else if (body === this.bodyB) {
					sumX += jx;
					sumY += jy;
					sumW += ((cdata[(/*CON_REL2*/ 9)] * jy) - (cdata[(/*CON_REL2*/ 9) + 1] * jx));
				}
			} else if (this._contact1._hash === (/*HASH_CIRCLE*/ 0)) {
				jn = adata[(/*ARB_JRACC*/ 16)];
				sumW += (body === this.bodyA ? -1 : (body === this.bodyB ? 1 : 0)) * jn;
			}

			dst[0] = sumX;
			dst[1] = sumY;
			dst[2] = sumW;
			return dst;
		};

		Physics2DArbiter.allocate = function () {
			if (!this.pool) {
				return new Physics2DArbiter();
			} else {
				var arb = this.pool;
				this.pool = arb._next;
				arb._next = null;
				return arb;
			}
		};
		Physics2DArbiter.deallocate = function (arb) {
			arb._next = this.pool;
			this.pool = arb;

			arb._userdef = 0;
		};
		Physics2DArbiter.version = 1;

		Physics2DArbiter.pool = null;
		return Physics2DArbiter;
})