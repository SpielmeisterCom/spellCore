// =========================================================================
//
// Physics2D Rigid Body
//
// BODY DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*BODY_IMASS*/0           // 1 / mass (possibly 0) for body. Always 0 for non-dynamic
///*BODY_IINERTIA*/1        // 1 / inertia (possibly 0) for body. Always 0 for non-dynamic
///*BODY_POS*/2             // World position and rotation (CW rad) of body (x, y, r)
///*BODY_AXIS*/5            // (cos(rotation), sin(rotation))
///*BODY_VEL*/7             // World velocity and ang.vel of body (vx, vy, w)
///*BODY_FORCE*/10          // World force + torque, persistently applied (fx, fy, t)
///*BODY_SURFACE_VEL*/13    // Surface velocity biasing contact physics (vt, vn)
///*BODY_PRE_POS*/15        // Previous position and rotation (x, y, r)
///*BODY_SWEEP_TIME*/18     // Time alpha for current partial integration of body.
///*BODY_RADIUS*/19         // Approximate radius of body about its origin.
///*BODY_SWEEP_ANGVEL*/20   // Angular velocity % (2 * pi / timeStep) for sweeps.
///*BODY_LIN_DRAG*/21       // Log of (1 - linear drag).
///*BODY_ANG_DRAG*/22       // Log of (1 - angular drag).
///*BODY_MASS*/23           // Untainted by body type mass.
///*BODY_INERTIA*/24        // Untainted by body type inertia.
//
///*BODY_DATA_SIZE*/25
//
// BODY TYPE CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*TYPE_DYNAMIC*/0
///*TYPE_KINEMATIC*/1
///*TYPE_STATIC*/2
define(
	'spell/physics/2D/RigidBody',
	[
		'spell/physics/2D/Config',
		'spell/shared/util/platform/Types'
	],
	function(
		Physics2DConfig,
		Types
		) {
			var Physics2DRigidBody = function() {
			}

			Physics2DRigidBody.prototype.isDynamic = function () {
				return (this._type === (/*TYPE_DYNAMIC*/ 0));
			};

			Physics2DRigidBody.prototype.setAsDynamic = function () {
				if (this.world && this.world._midStep) {
					return;
				}

				this._setTypeValue((/*TYPE_DYNAMIC*/ 0));
				var data = this._data;

				var mass = data[(/*BODY_MASS*/ 23)];
				var inertia = data[(/*BODY_INERTIA*/ 24)];
				data[(/*BODY_IMASS*/ 0)] = (mass === Number.POSITIVE_INFINITY ? 0 : (1 / mass));
				data[(/*BODY_IINERTIA*/ 1)] = (inertia === Number.POSITIVE_INFINITY ? 0 : (1 / inertia));
			};

			Physics2DRigidBody.prototype.isStatic = function () {
				return (this._type === (/*TYPE_STATIC*/ 2));
			};

			Physics2DRigidBody.prototype.setAsStatic = function () {
				if (this.world && this.world._midStep) {
					return;
				}

				this._setTypeValue((/*TYPE_STATIC*/ 2));
				var data = this._data;
				data[(/*BODY_IMASS*/ 0)] = data[(/*BODY_IINERTIA*/ 1)] = 0;

				// Static body cannot have velocity
				data[(/*BODY_VEL*/ 7)] = data[(/*BODY_VEL*/ 7) + 1] = data[(/*BODY_VEL*/ 7) + 2] = 0;
			};

			Physics2DRigidBody.prototype.isKinematic = function () {
				return (this._type === (/*TYPE_KINEMATIC*/ 1));
			};

			Physics2DRigidBody.prototype.setAsKinematic = function () {
				if (this.world && this.world._midStep) {
					return;
				}

				this._setTypeValue((/*TYPE_KINEMATIC*/ 1));
				var data = this._data;
				data[(/*BODY_IMASS*/ 0)] = data[(/*BODY_IINERTIA*/ 1)] = 0;
			};

			Physics2DRigidBody.prototype._setTypeValue = function (newType) {
				if (newType === this._type) {
					return;
				}

				if (!this.world) {
					this._type = newType;
					return;
				}

				this.world._transmitBodyType(this, newType);
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.applyImpulse = function (impulse /*v2*/ , position /*v2*/ ) {
				// Static cannot have velocity
				// Kinematic always has infinite mass/inertia (physics wise) so impulse has no effect.
				if (this._type !== (/*TYPE_DYNAMIC*/ 0)) {
					return;
				}

				var data = this._data;
				var x, y;
				if (position) {
					x = (position[0] - data[(/*BODY_POS*/ 2)]);
					y = (position[1] - data[(/*BODY_POS*/ 2) + 1]);
				} else {
					x = 0;
					y = 0;
				}
				var ix = impulse[0];
				var iy = impulse[1];
				var im = data[(/*BODY_IMASS*/ 0)];
				data[(/*BODY_VEL*/ 7)] += (ix * im);
				data[(/*BODY_VEL*/ 7) + 1] += (iy * im);
				data[(/*BODY_VEL*/ 7) + 2] += (((x * iy) - (y * ix)) * data[(/*BODY_IINERTIA*/ 1)]);
				this.wake(true);
			};

			Physics2DRigidBody.prototype.setVelocityFromPosition = function (newPosition /*v2*/ , newRotation, deltaTime) {
				if (this._type === (/*TYPE_STATIC*/ 2)) {
					return;
				}

				var data = this._data;
				var idt = (1 / deltaTime);
				data[(/*BODY_VEL*/ 7)] = ((newPosition[0] - data[(/*BODY_POS*/ 2)]) * idt);
				data[(/*BODY_VEL*/ 7) + 1] = ((newPosition[1] - data[(/*BODY_POS*/ 2) + 1]) * idt);
				data[(/*BODY_VEL*/ 7) + 2] = ((newRotation - data[(/*BODY_POS*/ 2) + 2]) * idt);
				this.wake(true);
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.transformWorldPointToLocal = function (src /*v2*/ , dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(2);
				}
				var data = this._data;
				var cos = data[(/*BODY_AXIS*/ 5)];
				var sin = data[(/*BODY_AXIS*/ 5) + 1];
				var x = (src[0] - data[(/*BODY_POS*/ 2)]);
				var y = (src[1] - data[(/*BODY_POS*/ 2) + 1]);
				dst[0] = ((cos * x) + (sin * y));
				dst[1] = ((cos * y) - (sin * x));
				return dst;
			};

			Physics2DRigidBody.prototype.transformWorldVectorToLocal = function (src /*v2*/ , dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(2);
				}
				var data = this._data;
				var cos = data[(/*BODY_AXIS*/ 5)];
				var sin = data[(/*BODY_AXIS*/ 5) + 1];
				var x = src[0];
				var y = src[1];
				dst[0] = ((cos * x) + (sin * y));
				dst[1] = ((cos * y) - (sin * x));
				return dst;
			};

			Physics2DRigidBody.prototype.transformLocalPointToWorld = function (src /*v2*/ , dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(2);
				}
				var data = this._data;
				var cos = data[(/*BODY_AXIS*/ 5)];
				var sin = data[(/*BODY_AXIS*/ 5) + 1];
				var x = src[0];
				var y = src[1];
				dst[0] = ((cos * x) - (sin * y) + data[(/*BODY_POS*/ 2)]);
				dst[1] = ((sin * x) + (cos * y) + data[(/*BODY_POS*/ 2) + 1]);
				return dst;
			};

			Physics2DRigidBody.prototype.transformLocalVectorToWorld = function (src /*v2*/ , dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(2);
				}
				var data = this._data;
				var cos = data[(/*BODY_AXIS*/ 5)];
				var sin = data[(/*BODY_AXIS*/ 5) + 1];
				var x = src[0];
				var y = src[1];
				dst[0] = ((cos * x) - (sin * y));
				dst[1] = ((sin * x) + (cos * y));
				return dst;
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.getPosition = function (dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(2);
				}

				var data = this._data;
				dst[0] = data[(/*BODY_POS*/ 2)];
				dst[1] = data[(/*BODY_POS*/ 2) + 1];
				return dst;
			};

			Physics2DRigidBody.prototype.setPosition = function (position /*v2*/ ) {
				if (this.world && (this.world._midStep || this._type === (/*TYPE_STATIC*/ 2))) {
					return;
				}

				var data = this._data;
				var newX = position[0];
				var newY = position[1];
				if ((data[(/*BODY_POS*/ 2)] !== newX) || (data[(/*BODY_POS*/ 2) + 1] !== newY)) {
					data[(/*BODY_POS*/ 2)] = newX;
					data[(/*BODY_POS*/ 2) + 1] = newY;
					this._invalidated = true;
					this.wake(true);
				}
			};

			Physics2DRigidBody.prototype.getRotation = function () {
				return this._data[(/*BODY_POS*/ 2) + 2];
			};

			Physics2DRigidBody.prototype.setRotation = function (rotation) {
				if (this.world && (this.world._midStep || this._type === (/*TYPE_STATIC*/ 2))) {
					return;
				}

				var data = this._data;
				if (data[(/*BODY_POS*/ 2) + 2] !== rotation) {
					this._data[(/*BODY_POS*/ 2) + 2] = rotation;
					this._data[(/*BODY_AXIS*/ 5)] = Math.cos(rotation);
					this._data[(/*BODY_AXIS*/ 5) + 1] = Math.sin(rotation);
					this._invalidated = true;
					this.wake(true);
				}
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.getVelocity = function (dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(2);
				}

				var data = this._data;
				dst[0] = data[(/*BODY_VEL*/ 7)];
				dst[1] = data[(/*BODY_VEL*/ 7) + 1];
				return dst;
			};

			Physics2DRigidBody.prototype.setVelocity = function (velocity /*v2*/ ) {
				// Static body cannot have velocity.
				if (this._type === (/*TYPE_STATIC*/ 2)) {
					return;
				}

				var data = this._data;
				var newX = velocity[0];
				var newY = velocity[1];
				if ((data[(/*BODY_VEL*/ 7)] !== newX) || (data[(/*BODY_VEL*/ 7) + 1] !== newY)) {
					data[(/*BODY_VEL*/ 7)] = newX;
					data[(/*BODY_VEL*/ 7) + 1] = newY;
					this.wake(true);
				}
			};

			Physics2DRigidBody.prototype.getAngularVelocity = function () {
				return this._data[(/*BODY_VEL*/ 7) + 2];
			};

			Physics2DRigidBody.prototype.setAngularVelocity = function (angularVelocity) {
				// Static body cannot have velocity.
				if (this._type === (/*TYPE_STATIC*/ 2)) {
					return;
				}

				var data = this._data;
				if (data[(/*BODY_VEL*/ 7) + 2] !== angularVelocity) {
					data[(/*BODY_VEL*/ 7) + 2] = angularVelocity;
					this.wake(true);
				}
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.getForce = function (dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(2);
				}

				var data = this._data;
				dst[0] = data[(/*BODY_FORCE*/ 10)];
				dst[1] = data[(/*BODY_FORCE*/ 10) + 1];
				return dst;
			};

			Physics2DRigidBody.prototype.setForce = function (force /*v2*/ ) {
				var data = this._data;
				var newX = force[0];
				var newY = force[1];
				if ((data[(/*BODY_FORCE*/ 10)] !== newX) || (data[(/*BODY_FORCE*/ 10) + 1] !== newY)) {
					data[(/*BODY_FORCE*/ 10)] = newX;
					data[(/*BODY_FORCE*/ 10) + 1] = newY;

					// we wake static/kinematic bodies even if force has no effect
					// incase user has some crazy callback that queries force to
					// make a decision
					this.wake(true);
				}
			};

			Physics2DRigidBody.prototype.getTorque = function () {
				return this._data[(/*BODY_FORCE*/ 10) + 2];
			};

			Physics2DRigidBody.prototype.setTorque = function (torque) {
				var data = this._data;
				if (data[(/*BODY_FORCE*/ 10) + 2] !== torque) {
					data[(/*BODY_FORCE*/ 10) + 2] = torque;

					// we wake static/kinematic bodies even if force has no effect
					// incase user has some crazy callback that queries torque to
					// make a decision
					this.wake(true);
				}
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.getSurfaceVelocity = function (dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(2);
				}

				var data = this._data;
				dst[0] = data[(/*BODY_SURFACE_VEL*/ 13)];
				dst[1] = data[(/*BODY_SURFACE_VEL*/ 13) + 1];
				return dst;
			};

			Physics2DRigidBody.prototype.setSurfaceVelocity = function (surfaceVelocity /*v2*/ ) {
				var data = this._data;
				data[(/*BODY_SURFACE_VEL*/ 13)] = surfaceVelocity[0];
				data[(/*BODY_SURFACE_VEL*/ 13) + 1] = surfaceVelocity[1];
				this.wake(true);
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.getMass = function () {
				return this._data[(/*BODY_MASS*/ 23)];
			};

			Physics2DRigidBody.prototype.getInertia = function () {
				return this._data[(/*BODY_INERTIA*/ 24)];
			};

			Physics2DRigidBody.prototype.setMass = function (mass) {
				var data = this._data;
				var oldMass = data[(/*BODY_MASS*/ 23)];
				if (!this._customMass || (oldMass !== mass)) {
					data[(/*BODY_MASS*/ 23)] = mass;
					this._customMass = true;
					this._invalidateMassInertia();
				}
			};

			Physics2DRigidBody.prototype.setMassFromShapes = function () {
				if (this._customMass) {
					this._customMass = false;
					this._data[(/*BODY_MASS*/ 23)] = this.computeMassFromShapes();
					this._invalidateMassInertia();
				}
			};

			Physics2DRigidBody.prototype.setInertia = function (inertia) {
				var data = this._data;
				var oldInertia = data[(/*BODY_INERTIA*/ 24)];
				if (!this._customInertia || (oldInertia !== inertia)) {
					data[(/*BODY_INERTIA*/ 24)] = inertia;
					this._customInertia = true;
					this._invalidateMassInertia();
				}
			};

			Physics2DRigidBody.prototype.setInertiaFromShapes = function () {
				if (this._customInertia) {
					this._customInertia = false;
					this._data[(/*BODY_INERTIA*/ 24)] = this.computeInertiaFromShapes();
					this._invalidateMassInertia();
				}
			};

			Physics2DRigidBody.prototype._invalidateMassInertia = function () {
				var data = this._data;
				var mass = data[(/*BODY_MASS*/ 23)];
				var inertia = data[(/*BODY_INERTIA*/ 24)];

				var staticType = (this._type !== (/*TYPE_DYNAMIC*/ 0));
				var inf = Number.POSITIVE_INFINITY;
				data[(/*BODY_IMASS*/ 0)] = (staticType || mass === inf) ? 0 : (1 / mass);
				data[(/*BODY_IINERTIA*/ 1)] = (staticType || inertia === inf) ? 0 : (1 / inertia);

				// We wake body, even if static/kinematic incase user has some crazy
				// callback which queries mass/inertia to make decision
				this.wake(true);
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.getLinearDrag = function () {
				return (1 - Math.exp(this._data[(/*BODY_LIN_DRAG*/ 21)]));
			};

			Physics2DRigidBody.prototype.setLinearDrag = function (linearDrag) {
				this._data[(/*BODY_LIN_DRAG*/ 21)] = Math.log(1 - linearDrag);

				// We wake body, even if static/kinematic incase user has some crazy
				// callback which queries mass/inertia to make decision
				this.wake(true);
			};

			Physics2DRigidBody.prototype.getAngularDrag = function () {
				return (1 - Math.exp(this._data[(/*BODY_ANG_DRAG*/ 22)]));
			};

			Physics2DRigidBody.prototype.setAngularDrag = function (angularDrag) {
				this._data[(/*BODY_ANG_DRAG*/ 22)] = Math.log(1 - angularDrag);

				// We wake body, even if static/kinematic incase user has some crazy
				// callback which queries mass/inertia to make decision
				this.wake(true);
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.addShape = function (shape) {
				if (this.world && (this.world._midStep || this._type === (/*TYPE_STATIC*/ 2))) {
					return false;
				}

				if (shape.body) {
					return false;
				}

				shape.body = this;
				this.shapes.push(shape);

				if (this.world) {
					this.wake(true);
					this.world._addShape(shape);
				}

				// Recompute body radius
				var rad = shape._data[(/*SHAPE_SWEEP_RADIUS*/ 4)];
				var data = this._data;
				if (rad > data[(/*BODY_RADIUS*/ 19)]) {
					data[(/*BODY_RADIUS*/ 19)] = rad;
				}

				this._invalidate();

				return true;
			};

			Physics2DRigidBody.prototype.removeShape = function (shape) {
				if (this.world && (this.world._midStep || this._type === (/*TYPE_STATIC*/ 2))) {
					return false;
				}

				if (shape.body !== this) {
					return false;
				}

				if (this.world) {
					this.wake(true);
					this.world._removeShape(shape);
				}

				shape.body = null;
				var shapes = this.shapes;
				var limit = (shapes.length - 1);
				var index = shapes.indexOf(shape);
				shapes[index] = shapes[limit];
				shapes.pop();

				// Recompute body radius.
				var i;
				var radius = 0;
				for (i = 0; i < limit; i += 1) {
					shape = shapes[i];
					var rad = shape._data[(/*SHAPE_SWEEP_RADIUS*/ 4)];
					if (rad > radius) {
						radius = rad;
					}
				}
				this._data[(/*BODY_RADIUS*/ 19)] = radius;

				this._invalidate();

				return true;
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.computeMassFromShapes = function () {
				var mass = 0;
				var i;
				var shapes = this.shapes;
				var limit = shapes.length;
				for (i = 0; i < limit; i += 1) {
					var shape = shapes[i];
					mass += shape._material._data[(/*MAT_DENSITY*/ 4)] * shape.computeArea();
				}
				return mass;
			};

			Physics2DRigidBody.prototype.computeInertiaFromShapes = function () {
				var inertia = 0;
				var i;
				var shapes = this.shapes;
				var limit = shapes.length;
				for (i = 0; i < limit; i += 1) {
					var shape = shapes[i];
					inertia += shape._material._data[(/*MAT_DENSITY*/ 4)] * shape.computeMasslessInertia() * shape.computeArea();
				}
				return inertia;
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.wake = function (automated) {
				if (!this.world) {
					this.sleeping = false;
					return;
				}

				this.world._wakeBody(this, !automated);
			};

			Physics2DRigidBody.prototype.sleep = function () {
				if (!this.world) {
					this.sleeping = true;
					return;
				}

				this.world._forceSleepBody(this);
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.computeLocalCenterOfMass = function (dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(2);
				}
				var comX = 0;
				var comY = 0;
				var totalMass = 0;

				var shapes = this.shapes;
				var limit = shapes.length;
				var i;
				for (i = 0; i < limit; i += 1) {
					var shape = shapes[i];
					shape.computeCenterOfMass(dst);
					var mass = shape.computeArea() * shape._material._data[(/*MAT_DENSITY*/ 4)];
					comX += (dst[0] * mass);
					comY += (dst[1] * mass);
					totalMass += mass;
				}

				var imass = (1 / totalMass);
				dst[0] = (comX * imass);
				dst[1] = (comY * imass);
				return dst;
			};

			Physics2DRigidBody.prototype.computeWorldBounds = function (dst /*v2*/ ) {
				if (dst === undefined) {
					dst = Types.createFloatArray(4);
				}
				var inf = Number.POSITIVE_INFINITY;
				var minX = inf;
				var minY = inf;
				var maxX = -inf;
				var maxY = -inf;

				this._update();
				var shapes = this.shapes;
				var limit = shapes.length;
				var i;
				for (i = 0; i < limit; i += 1) {
					var shape = shapes[i]._data;
					var x0 = shape[(/*SHAPE_AABB*/ 0)];
					var y0 = shape[(/*SHAPE_AABB*/ 0) + 1];
					var x1 = shape[(/*SHAPE_AABB*/ 0) + 2];
					var y1 = shape[(/*SHAPE_AABB*/ 0) + 3];
					if (x0 < minX) {
						minX = x0;
					}
					if (x1 > maxX) {
						maxX = x1;
					}
					if (y0 < minY) {
						minY = y0;
					}
					if (y1 > maxY) {
						maxY = y1;
					}
				}

				dst[0] = minX;
				dst[1] = minY;
				dst[2] = maxX;
				dst[3] = maxY;
				return dst;
			};

			// ===============================================================================
			Physics2DRigidBody.prototype.alignWithOrigin = function () {
				if (this.world && (this.world._midStep || this._type === (/*TYPE_STATIC*/ 2))) {
					return;
				}

				var negCOM = this.computeLocalCenterOfMass();
				negCOM[0] *= -1;
				negCOM[1] *= -1;

				var shapes = this.shapes;
				var limit = shapes.length;
				var i;
				for (i = 0; i < limit; i += 1) {
					shapes[i].translate(negCOM, true);
				}
				this._invalidate();
			};

			// ===============================================================================
			Physics2DRigidBody.prototype._invalidate = function () {
				this._invalidated = true;

				var customMass = this._customMass;
				var customInertia = this._customInertia;
				if ((!customMass) || (!customInertia)) {
					if (!customMass) {
						this._data[(/*BODY_MASS*/ 23)] = this.computeMassFromShapes();
					}
					if (!customInertia) {
						this._data[(/*BODY_INERTIA*/ 24)] = this.computeInertiaFromShapes();
					}

					this._invalidateMassInertia();
				}

				this.wake(true);
			};

			Physics2DRigidBody.prototype._update = function () {
				if (this._invalidated) {
					this._invalidated = false;
					var data = this._data;
					var shapes = this.shapes;
					var limit = shapes.length;
					var i;
					for (i = 0; i < limit; i += 1) {
						shapes[i]._update(data[(/*BODY_POS*/ 2)], data[(/*BODY_POS*/ 2) + 1], data[(/*BODY_AXIS*/ 5)], data[(/*BODY_AXIS*/ 5) + 1]);
					}
				}
			};

			// =====================================================================
			Physics2DRigidBody.prototype._atRest = function (deltaTime, timeStamp) {
				if (this._type !== (/*TYPE_DYNAMIC*/ 0)) {
					return this.sleeping;
				} else {
					var data = this._data;
					var canSleep;

					do {
						var x = data[(/*BODY_VEL*/ 7)];
						var y = data[(/*BODY_VEL*/ 7) + 1];
						var conf = Physics2DConfig.SLEEP_LINEAR_SQ;
						if (((x * x) + (y * y)) > conf) {
							canSleep = false;
							break;
						}

						x = (data[(/*BODY_POS*/ 2)] - data[(/*BODY_PRE_POS*/ 15)]);
						y = (data[(/*BODY_POS*/ 2) + 1] - data[(/*BODY_PRE_POS*/ 15) + 1]);
						var threshold = (deltaTime * deltaTime * conf);
						if (((x * x) + (y * y)) > threshold) {
							canSleep = false;
							break;
						}

						y = data[(/*BODY_RADIUS*/ 19)];
						x = data[(/*BODY_VEL*/ 7) + 2] * y;
						conf = Physics2DConfig.SLEEP_ANGULAR_SQ;
						if ((x * x) > conf) {
							canSleep = false;
							break;
						}

						x = (data[(/*BODY_POS*/ 2) + 2] - data[(/*BODY_PRE_POS*/ 15) + 2]) * y;
						threshold = (deltaTime * deltaTime * conf);
						canSleep = (x * x <= threshold);
					} while(false);

					if (!canSleep) {
						this._wakeTime = timeStamp;
						return false;
					} else {
						return ((this._wakeTime + Physics2DConfig.SLEEP_DELAY) < timeStamp);
					}
				}
			};

			// =====================================================================
			Physics2DRigidBody.prototype._deltaRotation = function (delta) {

                if( this.fixedRotation ) return

				var data = this._data;
				var rotation = (data[(/*BODY_POS*/ 2) + 2] += delta);
				if ((delta * delta) > Physics2DConfig.DELTA_ROTATION_EPSILON) {
					data[(/*BODY_AXIS*/ 5)] = Math.cos(rotation);
					data[(/*BODY_AXIS*/ 5) + 1] = Math.sin(rotation);
				} else {
					// approximation of axis rotation
					// p, delta provide small angle approximations
					// whilst m provides an approximation to 1/|axis| after
					// the small angle rotation approximation, so as to
					// approximate the the normalization and hugely reduce
					// errors over many calls
					//
					// in testing even with an epsilon above of 0.01
					// the error in the axis is limited to 0.00002 after 100
					// updates.
					//
					// each update of the world, sin/cos is recomputed fully
					// so the accumulate error here is limited to a single step
					// and is really, very, very small.
					var d2 = (delta * delta);
					var p = (1 - (0.5 * d2));
					var m = (1 - (d2 * d2 * 0.125));

					var cos = data[(/*BODY_AXIS*/ 5)];
					var sin = data[(/*BODY_AXIS*/ 5) + 1];

					var nSin = ((p * sin) + (delta * cos)) * m;
					var nCos = ((p * cos) - (delta * sin)) * m;
					data[(/*BODY_AXIS*/ 5)] = nCos;
					data[(/*BODY_AXIS*/ 5) + 1] = nSin;
				}
				return rotation;
			};

			// Integrate to deltaTime from current sweepTime (back or forth).
			Physics2DRigidBody.prototype._sweepIntegrate = function (deltaTime) {
				var data = this._data;
				var delta = (deltaTime - data[(/*BODY_SWEEP_TIME*/ 18)]);
				if (delta !== 0) {
					data[(/*BODY_SWEEP_TIME*/ 18)] = deltaTime;
					data[(/*BODY_POS*/ 2)] += (data[(/*BODY_VEL*/ 7)] * delta);
					data[(/*BODY_POS*/ 2) + 1] += (data[(/*BODY_VEL*/ 7) + 1] * delta);

					var angVel = data[(/*BODY_SWEEP_ANGVEL*/ 20)];
					if (angVel !== 0) {
						this._deltaRotation(data[(/*BODY_SWEEP_ANGVEL*/ 20)] * delta);
					}
				}
			};

			Physics2DRigidBody.prototype.integrate = function (deltaTime) {
				if (this.world && (this.world._midStep || this._type === (/*TYPE_STATIC*/ 2))) {
					return;
				}

				var data = this._data;
				data[(/*BODY_SWEEP_TIME*/ 18)] = 0;
				data[(/*BODY_SWEEP_ANGVEL*/ 20)] = data[(/*BODY_VEL*/ 7) + 2];
				this._sweepIntegrate(deltaTime);
				data[(/*BODY_SWEEP_TIME*/ 18)] = 0;
				this._invalidated = true;
				this.wake(true);
			};

			// ==========================================================
			Physics2DRigidBody.prototype.addEventListener = function (eventType, callback) {
				var events = (eventType === 'wake' ? this._onWake : eventType === 'sleep' ? this._onSleep : null);

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

			Physics2DRigidBody.prototype.removeEventListener = function (eventType, callback) {
				var events = (eventType === 'wake' ? this._onWake : eventType === 'sleep' ? this._onSleep : null);

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

			// params = {
			//      shapes: [...],
			//      mass: [...] = computed from shapes + type
			//      inertia: [...] = computed from shapes + type
			//      type: 'static', 'kinematic', 'dynamic' = 'kinematic'
			//      sleeping: = false,
			//      force: [, ] = [0,0],
			//      torque: = 0
			//      position: [...] = [0,0],
			//      rotation: = 0
			//      surfaceVelocity = [0,0]
			//      velocity: = [0,0],
			//      angularVelocity: = 0,
			//      bullet = false,
			//      linearDrag = 0.05,
			//      angularDrag = 0.05
			// }
			Physics2DRigidBody.create = function (params) {
				var b = new Physics2DRigidBody();
				var data = b._data = Types.createFloatArray((/*BODY_DATA_SIZE*/ 25));

				var inf = Number.POSITIVE_INFINITY;

				b._type = (params.type === 'dynamic' ? (/*TYPE_DYNAMIC*/ 0) : params.type === 'static' ? (/*TYPE_STATIC*/ 2) : params.type === 'kinematic' ? (/*TYPE_KINEMATIC*/ 1) : (/*TYPE_DYNAMIC*/ 0));

				var shapes = params.shapes;
				b.shapes = [];
				b.constraints = [];
				b.world = null;
                b.fixedRotation = params.fixedRotation

				var radius = 0;
				if (shapes) {
					var limit = shapes.length;
					var i;
					for (i = 0; i < limit; i += 1) {
						var shape = shapes[i];
						if (shape.body === b) {
							continue;
						}

						shape.body = b;
						b.shapes.push(shape);

						var rad = shape._data[(/*SHAPE_SWEEP_RADIUS*/ 4)];
						if (rad > radius) {
							radius = rad;
						}
					}
				}

				data[(/*BODY_RADIUS*/ 19)] = radius;

				b._customMass = (params.mass !== undefined);
				b._customInertia = (params.inertia !== undefined);
				var mass = (b._customMass ? params.mass : b.computeMassFromShapes());
				var inertia = (b._customInertia ? params.inertia : b.computeInertiaFromShapes());

				var isDynamic = (b._type === (/*TYPE_DYNAMIC*/ 0));
				var isStatic = (b._type === (/*TYPE_STATIC*/ 2));

				data[(/*BODY_IMASS*/ 0)] = ((!isDynamic) || mass === inf) ? 0 : (1 / mass);
				data[(/*BODY_IINERTIA*/ 1)] = ((!isDynamic) || inertia === inf) ? 0 : (1 / inertia);
				data[(/*BODY_MASS*/ 23)] = mass;
				data[(/*BODY_INERTIA*/ 24)] = inertia;

				var vec = params.position;
				var x = data[(/*BODY_POS*/ 2)] = (vec ? vec[0] : 0);
				var y = data[(/*BODY_POS*/ 2) + 1] = (vec ? vec[1] : 0);
				var rot = data[(/*BODY_POS*/ 2) + 2] = (params.rotation || 0);

				data[(/*BODY_AXIS*/ 5)] = Math.cos(rot);
				data[(/*BODY_AXIS*/ 5) + 1] = Math.sin(rot);

				data[(/*BODY_PRE_POS*/ 15)] = x;
				data[(/*BODY_PRE_POS*/ 15) + 1] = y;
				data[(/*BODY_PRE_POS*/ 15) + 2] = rot;

				vec = params.velocity;
				data[(/*BODY_VEL*/ 7)] = (((!isStatic) && vec) ? vec[0] : 0);
				data[(/*BODY_VEL*/ 7) + 1] = (((!isStatic) && vec) ? vec[1] : 0);
				data[(/*BODY_VEL*/ 7) + 2] = (((!isStatic) && params.angularVelocity) || 0);

				vec = params.force;
				data[(/*BODY_FORCE*/ 10)] = (vec ? vec[0] : 0);
				data[(/*BODY_FORCE*/ 10) + 1] = (vec ? vec[1] : 0);
				data[(/*BODY_FORCE*/ 10) + 2] = (params.torque || 0);

				vec = params.surfaceVelocity;
				data[(/*BODY_SURFACE_VEL*/ 13)] = (vec ? vec[0] : 0);
				data[(/*BODY_SURFACE_VEL*/ 13) + 1] = (vec ? vec[1] : 0);

				b.sleeping = (params.sleeping || false);
				b.bullet = (params.bullet || false);

				// Static/kinematic always 'frozen'
				b._sweepFrozen = (b._type !== (/*TYPE_DYNAMIC*/ 0));
				b._deferred = false;

				b._island = null;
				b._islandRank = 0;
				b._islandRoot = null;

				b._isBody = true;
				b._wakeTime = 0;
				b._woken = false; // for deferred WAKE callbacks.

				b._invalidated = true;

				data[(/*BODY_LIN_DRAG*/ 21)] = Math.log(1 - (params.linearDrag !== undefined ? params.linearDrag : 0.05));
				data[(/*BODY_ANG_DRAG*/ 22)] = Math.log(1 - (params.angularDrag !== undefined ? params.angularDrag : 0.05));

				b.userData = (params.userData || null);

				b._onWake = [];
				b._onSleep = [];

				return b;
			};
			Physics2DRigidBody.version = 1;
			return Physics2DRigidBody;
})
