define(
	'spell/physics/2D/World',
	[
		'spell/physics/2D/Config',
		'spell/physics/2D/Arbiter',
		'spell/physics/2D/BoxTreeBroadphase',
		'spell/physics/2D/CollisionUtils',
		'spell/physics/2D/Polygon',
		'spell/physics/2D/Circle',
		'spell/physics/2D/Island',
		'spell/physics/2D/Callback',
		'spell/physics/2D/TOIEvent',
		'spell/shared/util/platform/Types'
	],
	function(
		Physics2DConfig,
		Physics2DArbiter,
		Physics2DBoxTreeBroadphase,
		Physics2DCollisionUtils,
		Physics2DPolygon,
		Physics2DCircle,
		Physics2DIsland,
		Physics2DCallback,
		Physics2DTOIEvent,
		Types
		) {
		var Physics2DWorld = function() {
		}

		Physics2DWorld.prototype.getGravity = function (dst /*v2*/ ) {
			if (dst === undefined) {
				dst = Types.createFloatArray(2);
			}

			dst[0] = this._gravityX;
			dst[1] = this._gravityY;
			return dst;
		};

		Physics2DWorld.prototype.setGravity = function (gravity /*v2*/ ) {
			var newX = gravity[0];
			var newY = gravity[1];
			if (newX !== this._gravityX || newY !== this._gravityY) {
				this._gravityX = newX;
				this._gravityY = newY;

				var bodies = this.rigidBodies;
				var limit = bodies.length;
				var i;
				for (i = 0; i < limit; i += 1) {
					this._wakeBody(bodies[i]);
				}
			}
		};

		// =====================================================================
		Physics2DWorld.prototype._addShape = function (shape) {
			var body = shape.body;
			body._update();

			var isStaticHandle = ((body._type === (/*TYPE_STATIC*/ 2)) || body.sleeping);
			shape._bphaseHandle = this.broadphase.insert(shape, shape._data, isStaticHandle);
		};

		// precon: body was woken before calling this method.
		//         therefore all arbiters are in the world as
		//         non-sleeping.
		Physics2DWorld.prototype._removeShape = function (shape, noCallbacks) {
			var body = shape.body;
			this.broadphase.remove(shape._bphaseHandle);
			shape._bphaseHandle = null;

			var arbiters = shape.arbiters;
			while (arbiters.length !== 0) {
				var arb = arbiters.pop();
				if (arb._retired) {
					continue;
				}

				if (arb.bodyA !== body && arb.bodyA._type === (/*TYPE_DYNAMIC*/ 0)) {
					this._wakeBody(arb.bodyA);
				}
				if (arb.bodyB !== body && arb.bodyB._type === (/*TYPE_DYNAMIC*/ 0)) {
					this._wakeBody(arb.bodyB);
				}

				arb._lazyRetire(shape);
				if (!noCallbacks) {
					this._pushInteractionEvents((/*EVENT_END*/ 3), arb);
				}
			}
		};

		// Call on constraint when:
		//  A)  active (outside world), and then added to world
		//  B)  in world (inactive), and then enabled
		Physics2DWorld.prototype._enabledConstraint = function (constraint) {
			// prepare constraint for disjoint set forest.
			constraint._islandRoot = constraint;
			constraint._islandRank = 0;

			if (!constraint.sleeping) {
				constraint.sleeping = true; // force wake.
				this._wakeConstraint(constraint, true);
			}
		};

		// Call on constraint when:
		//  A)  active (in world), and then removed from world
		//  B)  in world (active), and then disabled.
		Physics2DWorld.prototype._disabledConstraint = function (constraint) {
			this._wakeConstraint(constraint);

			var constraints = this.liveConstraints;
			var index = constraints.indexOf(constraint);
			constraints[index] = constraints[constraints.length - 1];
			constraints.pop();
		};

		Physics2DWorld.prototype.addConstraint = function (constraint) {
			if (constraint.world) {
				return false;
			}

			constraint.world = this;
			this.constraints.push(constraint);

			constraint._inWorld();

			if (constraint._active) {
				this._enabledConstraint(constraint);
			}

			return true;
		};

		Physics2DWorld.prototype.removeConstraint = function (constraint) {
			if (constraint.world !== this) {
				return false;
			}

			var constraints = this.constraints;
			var index = constraints.indexOf(constraint);
			constraints[index] = constraints[constraints.length - 1];
			constraints.pop();

			if (constraint._active) {
				this._disabledConstraint(constraint);
			}

			constraint.world = null;
			constraint._outWorld();

			return true;
		};

		Physics2DWorld.prototype.addRigidBody = function (body) {
			if (body.world) {
				return false;
			}

			body.world = this;
			this.rigidBodies.push(body);

			body._update();

			var i;
			var shapes = body.shapes;
			var limit = shapes.length;
			for (i = 0; i < limit; i += 1) {
				this._addShape(shapes[i]);
			}

			if (body._type === (/*TYPE_STATIC*/ 2)) {
				body.sleeping = true;
				return true;
			}

			// prepare body for disjoint set forest.
			body._islandRoot = body;
			body._islandRank = 0;

			if (!body.sleeping) {
				body.sleeping = true; //force wake.
				this._wakeBody(body, true);
			}

			return true;
		};

		Physics2DWorld.prototype.removeRigidBody = function (body, noCallbacks) {
			if (body.world !== this) {
				return false;
			}

			this._wakeBody(body);

			body.world = null;
			var rigidBodies = this.rigidBodies;
			var index = rigidBodies.indexOf(body);
			rigidBodies[index] = rigidBodies[rigidBodies.length - 1];
			rigidBodies.pop();

			if (!body.sleeping && (body._type !== (/*TYPE_STATIC*/ 2))) {
				if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
					rigidBodies = this.liveDynamics;
				} else {
					rigidBodies = this.liveKinematics;
				}

				index = rigidBodies.indexOf(body);
				rigidBodies[index] = rigidBodies[rigidBodies.length - 1];
				rigidBodies.pop();
			}

			var i;
			var shapes = body.shapes;
			var limit = shapes.length;
			for (i = 0; i < limit; i += 1) {
				this._removeShape(shapes[i], noCallbacks);
			}

			// Remove constraints!
			var constraints = body.constraints;
			while (constraints.length > 0) {
				this.removeConstraint(constraints[0]);
			}

			return true;
		};

		// =====================================================================
		Physics2DWorld.prototype.clear = function () {
			// Clean up rigidBodies, liveDynamics, liveKinematics
			var bodies = this.rigidBodies;
			var limit = bodies.length;
			while (limit > 0) {
				limit -= 1;
				this.removeRigidBody(bodies[limit], true);
			}

			// Clean up constraints, liveConstraints
			var constraints = this.constraints;
			limit = constraints.length;
			while (limit > 0) {
				limit -= 1;
				this.removeConstraint(constraints[limit]);
			}

			// Clean up dynamicArbiters, staticArbiters
			this._clearArbiters(this.staticArbiters);
			this._clearArbiters(this.dynamicArbiters);

			// Clean up any deferred callbacks generated
			// outside of world::step()
			// (Waking a constraint/body indirectly)
			// (Removing a shape)
			var callbacks = this._callbacks;
			limit = callbacks.length;
			while (limit > 0) {
				limit -= 1;
				Physics2DCallback.deallocate(callbacks.pop());
			}
			// _island, _toiEvents already empty
			// broadphase already clear by removal of shapes.
		};

		Physics2DWorld.prototype._clearArbiters = function (arbiters) {
			var limit = arbiters.length;
			while (limit > 0) {
				var arb = arbiters.pop();
				limit -= 1;

				arb._retire();
				Physics2DArbiter.deallocate(arb);
			}
		};

		// =====================================================================
		Physics2DWorld.prototype.shapePointQuery = function (point /*v2*/ , store) {
			return this._pointQuery(this._shapePointCallback, point, store);
		};

		Physics2DWorld.prototype.bodyPointQuery = function (point /*v2*/ , store) {
			return this._pointQuery(this._bodyPointCallback, point, store);
		};

		Physics2DWorld.prototype._pointQuery = function (callback, point, store) {
			var rect = this._sampleRectangle;
			rect[0] = rect[2] = point[0];
			rect[1] = rect[3] = point[1];

			callback.store = store;
			callback.count = 0;
			this.broadphase.sample(rect, callback.sample, callback);
			return callback.count;
		};

		// -------------------------------------
		Physics2DWorld.prototype.shapeCircleQuery = function (center /*v2*/ , radius, store) {
			return this._circleQuery(this._shapeCircleCallback, center, radius, store);
		};

		Physics2DWorld.prototype.bodyCircleQuery = function (center /*v2*/ , radius, store) {
			return this._circleQuery(this._bodyCircleCallback, center, radius, store);
		};

		Physics2DWorld.prototype._circleQuery = function (callback, center, radius, store) {
			var circle = this._circleQueryShape;
			circle.setRadius(radius);

			var posX = center[0];
			var posY = center[1];
			circle._update(posX, posY, 1, 0);

			var rect = this._sampleRectangle;
			rect[0] = (posX - radius);
			rect[1] = (posY - radius);
			rect[2] = (posX + radius);
			rect[3] = (posY + radius);

			callback.store = store;
			callback.count = 0;
			this.broadphase.sample(rect, callback.sample, callback);
			return callback.count;
		};

		// -------------------------------------
		Physics2DWorld.prototype.shapeRectangleQuery = function (aabb /*v4*/ , store) {
			return this._rectangleQuery(this._shapeRectangleCallback, aabb, store);
		};

		Physics2DWorld.prototype.bodyRectangleQuery = function (aabb /*v4*/ , store) {
			return this._rectangleQuery(this._bodyRectangleCallback, aabb, store);
		};

		Physics2DWorld.prototype._rectangleQuery = function (callback, aabb, store) {
			var vertices = this._rectangleQueryVertices;

			var x1 = aabb[0];
			var y1 = aabb[1];
			var x2 = aabb[2];
			var y2 = aabb[3];
			vertices[0][0] = vertices[3][0] = (x1 < x2 ? x1 : x2);
			vertices[0][1] = vertices[1][1] = (y1 < y2 ? y1 : y2);
			vertices[1][0] = vertices[2][0] = (x1 < x2 ? x2 : x1);
			vertices[2][1] = vertices[3][1] = (y1 < y2 ? y2 : y1);

			var poly = this._rectangleQueryShape;
			poly.setVertices(vertices);
			poly._update(0, 0, 1, 0);

			callback.store = store;
			callback.count = 0;
			this.broadphase.sample(aabb, callback.sample, callback);
			return callback.count;
		};

		// =====================================================================
		Physics2DWorld.prototype.rayCast = function (ray, noInnerSurfaces, customCallback, thisObject) {
			var origin = ray.origin;
			var direction = ray.direction;
			var maxFactor = ray.maxFactor;
			var x1 = origin[0];
			var y1 = origin[1];
			var x2 = x1 + (direction[0] * maxFactor);
			var y2 = y1 + (direction[1] * maxFactor);

			var rect = this._sampleRectangle;
			rect[0] = (x1 < x2 ? x1 : x2);
			rect[1] = (y1 < y2 ? y1 : y2);
			rect[2] = (x1 < x2 ? x2 : x1);
			rect[3] = (y1 < y2 ? y2 : y1);

			var callback = this._rayCast;
			callback.ray = ray;
			callback.noInner = (noInnerSurfaces || false);
			callback.minFactor = ray.maxFactor;
			callback.userCallback = customCallback;
			callback.userThis = thisObject;
			callback.minShape = null;
			this.broadphase.sample(rect, callback.sample, callback);

			if (callback.minShape) {
				var data = callback.minNormal;
				var hitNormal = Types.createFloatArray(2);
				var hitPoint = Types.createFloatArray(2);
				hitNormal[0] = data[0];
				hitNormal[1] = data[1];
				hitPoint[0] = (x1 + (direction[0] * callback.minFactor));
				hitPoint[1] = (y1 + (direction[1] * callback.minFactor));
				return {
					shape: callback.minShape,
					hitNormal: hitNormal,
					hitPoint: hitPoint,
					factor: callback.minFactor
				};
			} else {
				return null;
			}
		};

		Physics2DWorld.prototype.convexCast = function (shape, deltaTime, customCallback, thisObject) {
			var body = shape.body;
			var bdata = body._data;
			var preX = bdata[(/*BODY_POS*/ 2)];
			var preY = bdata[(/*BODY_POS*/ 2) + 1];
			body._sweepIntegrate(deltaTime);
			var curX = bdata[(/*BODY_POS*/ 2)];
			var curY = bdata[(/*BODY_POS*/ 2) + 1];

			var rect = this._sampleRectangle;
			var radius = shape._data[(/*SHAPE_SWEEP_RADIUS*/ 4)];
			rect[0] = ((preX < curX ? preX : curX) - radius);
			rect[1] = ((preY < curY ? preY : curY) - radius);
			rect[2] = ((preX < curX ? curX : preX) + radius);
			rect[3] = ((preY < curY ? curY : preY) + radius);

			body[(/*BODY_SWEEP_ANGVEL*/ 20)] = body[(/*BODY_VEL*/ 7) + 2];

			var callback = this._convexCast;
			callback.deltaTime = deltaTime;
			callback.minTOIAlpha = 1;
			callback.minShape = null;
			callback.toi.shapeA = shape;
			callback.userCallback = customCallback;
			callback.userThis = thisObject;
			this.broadphase.sample(rect, callback.sample, callback);

			// reset sweep body and shape.
			body._sweepIntegrate(0);
			shape._update(preX, preY, bdata[(/*BODY_AXIS*/ 5)], bdata[(/*BODY_AXIS*/ 5) + 1], true);

			if (callback.minShape) {
				var data = callback.minData;
				var hitNormal = Types.createFloatArray(2);
				var hitPoint = Types.createFloatArray(2);
				hitNormal[0] = -data[0];
				hitNormal[1] = -data[1];
				hitPoint[0] = data[2];
				hitPoint[1] = data[3];
				return {
					shape: callback.minShape,
					hitNormal: hitNormal,
					hitPoint: hitPoint,
					factor: (callback.minTOIAlpha * deltaTime)
				};
			} else {
				return null;
			}
		};

		// =====================================================================
		Physics2DWorld.prototype.step = function (deltaTime) {
			this._midStep = true;
			this._eventTime = (/*EVENT_TIME_STANDARD*/ 0);
			this.timeStamp += 1;
			this._deltaTime = deltaTime;
			this.simulatedTime += deltaTime;

			// Update objects for current position/rotation
			// As well as preparing delayed WAKE callbacks.
			this._validate();

			// Perform discrete collision detection
			this._discreteCollisions();

			// Perform sleeping
			this._sleepComputations(deltaTime);

			// Pre-step arbiters
			this._preStep(deltaTime);

			// Sort arbiters
			this._sortArbiters();

			// Integrate velocities
			this._integrateVelocity(deltaTime);

			// Warm start arbiters
			this._warmStart();

			// Velocity iterators.
			this._iterateVelocity(this.velocityIterations);

			// Integrate positions and prepare for continuous collision detection.
			this._integratePosition(deltaTime);

			// Perform continous collision detection
			this._eventTime = (/*EVENT_TIME_CONTINUOUS*/ 1);
			this._continuousCollisions(deltaTime);

			// Sort arbiters (continuous may have inserted more).
			this._sortArbiters();

			// Positional iterationrs
			this._iteratePosition(this.positionIterations);

			// Finalize bodies, invalidating if necessary
			// Put kinematics that have not moved to sleep
			// Finalize contact positions, generate interaction callbacks.
			this._finalize();

			// Issue callbacks
			this._midStep = false;
			this._eventTime = (/*EVENT_TIME_PRE*/ -1);
			this._doCallbacks();
		};

		// =========================================================================
		// =========================================================================
		Physics2DWorld.prototype._discreteCollisions = function () {
			this.broadphase.perform(this._discreteNarrowPhase, this);
			this._doDeferredWake(false);
		};

		Physics2DWorld.prototype._doDeferredWake = function (continuous) {
			// Waking of bodies by collision must be deferred,
			// Broadphase must not be modified during 'perform' call.
			var wakes = this._deferredWake;
			var limit = wakes.length;
			while (limit > 0) {
				var body = wakes.pop();
				body._deferred = false;

				// In the case of waking bodies after continuous collisions.
				// We must prestep the arbiters both for correct physics
				// and for callbacks to be properly generated (progress on sleeping arbiters).
				//
				// This is given by the continuous argument.
				this._wakeBody(body, false, continuous);
				limit -= 1;
			}
		};

		Physics2DWorld.prototype._collisionType = function (s1, s2, b1, b2) {
			if (b1 === b2) {
				return undefined;
			}

			var constraints = ((b1.constraints.length < b2.constraints.length) ? b1.constraints : b2.constraints);
			var limit = constraints.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var con = constraints[i];
				if (con._active && con._ignoreInteractions && con._pairExists(b1, b2)) {
					return undefined;
				}
			}

			/*jshint bitwise: false*/
			if ((s1._group & s2._mask) === 0 || (s2._group & s1._mask) === 0) {
				return undefined;
			}

			var collisionType = !(s1.sensor || s2.sensor);

			// Interaction between two static/kinematics cannot be
			// a collision type.
			if (b1._type !== (/*TYPE_DYNAMIC*/ 0) && b2._type !== (/*TYPE_DYNAMIC*/ 0) && collisionType) {
				return undefined;
			}

			return collisionType;
		};

		Physics2DWorld.prototype._discreteNarrowPhase = function (handleA, handleB, continuous) {
			var s1 = handleA.data;
			var s2 = handleB.data;

			var b1 = s1.body;
			var b2 = s2.body;

			var ctype = this._collisionType(s1, s2, b1, b2);
			if (ctype === undefined) {
				// No interaction wanted.
				return null;
			}

			var staticType = (b1._type !== (/*TYPE_DYNAMIC*/ 0) || b2._type !== (/*TYPE_DYNAMIC*/ 0));

			// Order shapes by id for consistent Arbiter lookup without two-way check.
			var sa, sb;
			if (s1.id < s2.id) {
				sa = s1;
				sb = s2;
			} else {
				sa = s2;
				sb = s1;
			}

			// Search for existing Arbiter using smallest of shapes' arbiters lists.
			var arbiters = (sa.arbiters.length < sb.arbiters.length ? sa : sb).arbiters;
			var limit = arbiters.length;
			var i;
			var arb;
			for (i = 0; i < limit; i += 1) {
				var sarb = arbiters[i];
				if (sarb.shapeA === sa && sarb.shapeB === sb) {
					arb = sarb;
					break;
				}
			}

			var first = (!arb);
			if (first) {
				arb = Physics2DArbiter.allocate();
			}

			// Ensure we do not check collisions again in the same time step
			// Unless we are performing continuous collisions.
			if (first || arb._timeStamp !== this.timeStamp || continuous) {
				arb._timeStamp = this.timeStamp;
				if ((ctype && this._collisions._collide(sa, sb, arb)) || (!ctype && this._collisions._test(sa, sb))) {
					if (first) {
						arb.sensor = (!ctype);
						arb._assign(sa, sb);
						arb._static = staticType;
						if (staticType) {
							this.staticArbiters.push(arb);
						} else {
							this.dynamicArbiters.push(arb);
						}
					}

					// Expressions check the two cases where an arbiter is re-used
					// without a retirement inbetween, and which correspond to a
					// 'fresh' collision.
					if (first || (arb._endGenerated === this.timeStamp && continuous) || (arb._updateStamp < (this.timeStamp - 1))) {
						arb._createContinuous = continuous;
						arb._createStamp = this.timeStamp;

						// Sensor type interaction takes no presolve events.
						// so we immediately set state to ACCEPT|ALWAYS
						/*jshint bitwise: false*/
						arb._state = (ctype ? 0 : ((/*STATE_ACCEPT*/ 1) | (/*STATE_ALWAYS*/ 2)));
						/*jshint bitwise: true*/
					}

					arb._updateStamp = this.timeStamp;

					var anyIndeterminate = false;

					// Check pre solve events in collision interactino type case.
					/*jshint bitwise: false*/
					if (ctype && (arb._state & (/*STATE_ALWAYS*/ 2)) === 0) {
						// Reset to default of ACCEPT, but not ALWAYS
						// so that if no events are yet added, and one is then added
						// it will be called.
						arb._state = (/*STATE_ACCEPT*/ 1);
						arb._midStep = true;

						var events = sa._onPreSolve;
						limit = events.length;
						var eventObject;
						for (i = 0; i < limit; i += 1) {
							eventObject = events[i];
							eventObject.callback.call(eventObject.thisObject, arb, sb);
							if (!eventObject.deterministic) {
								anyIndeterminate = true;
							}
						}

						events = sb._onPreSolve;
						limit = events.length;
						for (i = 0; i < limit; i += 1) {
							eventObject = events[i];
							eventObject.callback.call(eventObject.thisObject, arb, sa);
							if (!eventObject.deterministic) {
								anyIndeterminate = true;
							}
						}

						arb._midStep = false;
						arb._indeterminate = anyIndeterminate;

						// Imdeterministic, arbiter state must prevent objects
						// from being put to sleep!
						/*jshint bitwise: false*/
						if (anyIndeterminate && (arb._state & (/*STATE_ALWAYS*/ 2)) === 0) {
							// we do not check they are sleeping before waking
							// so that they may never sleep (wake time will be updated).
							// Otherwise they could sleep if both were to be put to sleep at same
							// time, or if it is a dynamic-static pair etc.
							if (b1._type === (/*TYPE_DYNAMIC*/ 0) && !b1._deferred) {
								b1._deferred = true;
								this._deferredWake.push(b1);
							}
							if (b2._type === (/*TYPE_DYNAMIC*/ 0) && !b1._deferred) {
								b2._deferred = true;
								this._deferredWake.push(b2);
							}
						}
					}

					/*jshint bitwise: false*/
					if (ctype && ((arb._state & (/*STATE_ACCEPT*/ 1)) !== 0)) {
						if (b1._type === (/*TYPE_DYNAMIC*/ 0) && b1.sleeping && !b1._deferred) {
							b1._deferred = true;
							this._deferredWake.push(b1);
						}
						if (b2._type === (/*TYPE_DYNAMIC*/ 0) && b2.sleeping && !b2._deferred) {
							b2._deferred = true;
							this._deferredWake.push(b2);
						}
					}

					if (arb.sleeping) {
						this._wakeArbiter(arb);
					}
				} else if (first) {
					Physics2DArbiter.deallocate(arb);
					arb = null;
				}
			}

			return arb;
		};

		// =====================================================================
		Physics2DWorld.prototype._continuousCollisions = function (deltaTime) {
			this.broadphase.perform(this._continuousNarrowPhase, this);

			var curTimeAlpha = 0.0;
			var toiEvents = this._toiEvents;
			var limit = toiEvents.length;
			var toi, i;
			while (curTimeAlpha < 1.0 && limit !== 0) {
				var minTOIAlpha = Number.POSITIVE_INFINITY;
				var minKinematic = false;
				var min = -1;

				var b1, b2;
				for (i = 0; i < limit;) {
					toi = toiEvents[i];
					b1 = toi.shapeA.body;
					b2 = toi.shapeB.body;

					// TOI invalid.
					if (b1._sweepFrozen && b2._sweepFrozen) {
						limit -= 1;
						toiEvents[i] = toiEvents[limit];
						toiEvents.pop();
						Physics2DTOIEvent.deallocate(toi);
						continue;
					}

					// TOI invalidated.
					if (toi.frozenA !== b1._sweepFrozen || toi.frozenB !== b2._sweepFrozen) {
						// Recompute TOI
						toi.frozenA = b1._sweepFrozen;
						toi.frozenB = b2._sweepFrozen;

						// Check if order of objects in event need swapped
						// (_staticSweep restrictions on order)
						if (toi.frozenA) {
							var tmp = toi.shapeA;
							toi.shapeA = toi.shapeB;
							toi.shapeB = tmp;
							toi.frozenA = false;
							toi.frozenB = true;
						}

						this._collisions._staticSweep(toi, deltaTime, Physics2DConfig.SWEEP_SLOP);
						if (toi._data[(/*TOI_TOI_ALPHA*/ 6)] < 0) {
							limit -= 1;
							toiEvents[i] = toiEvents[limit];
							toiEvents.pop();
							Physics2DTOIEvent.deallocate(toi);
							continue;
						}
					}

					var curTOIAlpha = toi._data[(/*TOI_TOI_ALPHA*/ 6)];
					if (curTOIAlpha >= 0 && (curTOIAlpha < minTOIAlpha || (!minKinematic && toi.kinematic))) {
						minTOIAlpha = curTOIAlpha;
						minKinematic = toi.kinematic;
						min = i;
					}

					i += 1;
				}

				if (min === -1) {
					break;
				}

				// Remove TOI event from list
				toi = toiEvents[min];
				limit -= 1;
				toiEvents[min] = toiEvents[limit];
				toiEvents.pop();

				// Advance time alpha
				curTimeAlpha = minTOIAlpha;

				var s1 = toi.shapeA;
				var s2 = toi.shapeB;
				b1 = s1.body;
				b2 = s2.body;
				var data1 = b1._data;
				var data2 = b2._data;

				// Update body (and collided shapes) to TOI.
				if (!b1._sweepFrozen || toi.kinematic) {
					b1._sweepIntegrate(curTimeAlpha * deltaTime);
					s1._update(data1[(/*BODY_POS*/ 2)], data1[(/*BODY_POS*/ 2) + 1], data1[(/*BODY_AXIS*/ 5)], data1[(/*BODY_AXIS*/ 5) + 1], true);
				}
				if (!b2._sweepFrozen || toi.kinematic) {
					b2._sweepIntegrate(curTimeAlpha * deltaTime);
					s2._update(data2[(/*BODY_POS*/ 2)], data2[(/*BODY_POS*/ 2) + 1], data2[(/*BODY_AXIS*/ 5)], data2[(/*BODY_AXIS*/ 5) + 1], true);
				}

				var arb = this._discreteNarrowPhase(s1._bphaseHandle, s2._bphaseHandle, true);
				if (arb) {
					// Discrete collision detected, pre-step for position iterations
					// (For sensors, issue begin callbacks if appropriate)
					this._continuousArbiterPrepare(arb, deltaTime);
				}

				/*jshint bitwise: false*/
				if (arb && !arb.sensor && (arb._state & (/*STATE_ACCEPT*/ 1)) !== 0) {
					// Freeze objects
					if (!b1._sweepFrozen && b1._type === (/*TYPE_DYNAMIC*/ 0)) {
						b1._sweepFrozen = true;
						if (toi.failed) {
							data1[(/*BODY_SWEEP_ANGVEL*/ 20)] = 0;
						} else if (toi.slipped) {
							data1[(/*BODY_SWEEP_ANGVEL*/ 20)] *= Physics2DConfig.TOI_SLIP_SCALE;
						}
						data1[(/*BODY_VEL*/ 7) + 2] = data1[(/*BODY_SWEEP_ANGVEL*/ 20)];
					}
					if (!b2._sweepFrozen && b2._type === (/*TYPE_DYNAMIC*/ 0)) {
						b2._sweepFrozen = true;
						if (toi.failed) {
							data2[(/*BODY_SWEEP_ANGVEL*/ 20)] = 0;
						} else if (toi.slipped) {
							data2[(/*BODY_SWEEP_ANGVEL*/ 20)] *= Physics2DConfig.TOI_SLIP_SCALE;
						}
						data2[(/*BODY_VEL*/ 7) + 2] = data2[(/*BODY_SWEEP_ANGVEL*/ 20)];
					}
				}

				Physics2DTOIEvent.deallocate(toi);
			}

			while (limit > 0) {
				toi = toiEvents.pop();
				Physics2DTOIEvent.deallocate(toi);
				limit -= 1;
			}

			// Advance remaining, unfrozen objects to end of time step.
			var bodies = this.liveDynamics;
			limit = bodies.length;
			for (i = 0; i < limit; i += 1) {
				var body = bodies[i];
				if (!body._sweepFrozen) {
					body._sweepIntegrate(deltaTime);
				}
			}

			// Advance all kinematics to end of time step.
			bodies = this.liveKinematics;
			limit = bodies.length;
			for (i = 0; i < limit; i += 1) {
				bodies[i]._sweepIntegrate(deltaTime);
			}

			// We do not need to do any more work with sleeping arbiters
			// here like pre-stepping before position iterations
			//
			// Arbiters were sleeping -> objects were sleeping -> data
			// is the same.
			this._doDeferredWake(true);
		};

		Physics2DWorld.prototype._continuousNarrowPhase = function (handleA, handleB) {
			var s1 = handleA.data;
			var s2 = handleB.data;
			var b1 = s1.body;
			var b2 = s2.body;
			if (b1._sweepFrozen && b2._sweepFrozen) {
				return;
			}

			var staticType = (b1._type !== (/*TYPE_DYNAMIC*/ 0) || b2._type !== (/*TYPE_DYNAMIC*/ 0));
			if (staticType || (b1._bullet || b2._bullet)) {
				var toi = Physics2DTOIEvent.allocate();
				var kin = (b1._type === (/*TYPE_KINEMATIC*/ 1) || b2._type === (/*TYPE_KINEMATIC*/ 1));
				if (staticType && !kin) {
					if (b1._type !== (/*TYPE_DYNAMIC*/ 0)) {
						toi.shapeB = s1;
						toi.shapeA = s2;
					} else {
						toi.shapeA = s1;
						toi.shapeB = s2;
					}
					this._collisions._staticSweep(toi, this._deltaTime, Physics2DConfig.SWEEP_SLOP);
				} else {
					if (s1.body._sweepFrozen) {
						toi.shapeB = s1;
						toi.shapeA = s2;
						this._collisions._staticSweep(toi, this._deltaTime, Physics2DConfig.SWEEP_SLOP);
					} else if (s2.body._sweepFrozen) {
						toi.shapeA = s1;
						toi.shapeB = s2;
						this._collisions._staticSweep(toi, this._deltaTime, Physics2DConfig.SWEEP_SLOP);
					} else {
						toi.shapeA = s1;
						toi.shapeB = s2;
						this._collisions._dynamicSweep(toi, this._deltaTime, Physics2DConfig.SWEEP_SLOP);
					}
				}

				// Permit dynamic-dynamic events that represent missed collisions
				// to persist as freezing of one of the two objects may cause
				// event to change and we miss too many dynamic-dynamic collisions
				// by not allowing the event to persist.
				if ((staticType && toi._data[(/*TOI_TOI_ALPHA*/ 6)] < 0) || toi.failed) {
					Physics2DTOIEvent.deallocate(toi);
				} else {
					this._toiEvents.push(toi);
					toi.frozenA = toi.shapeA.body._sweepFrozen;
					toi.frozenB = toi.shapeB.body._sweepFrozen;
					toi.staticType = staticType;
					toi.kinematic = kin;
				}
			}
		};

		// =====================================================================
		Physics2DWorld.prototype.__union = function (x, y) {
			var stack, next;

			while (x !== x._islandRoot) {
				next = x._islandRoot;
				x._islandRoot = stack;
				stack = x;
				x = next;
			}
			while (stack) {
				next = stack._islandRoot;
				stack._islandRoot = x;
				stack = next;
			}

			while (y !== y._islandRoot) {
				next = y._islandRoot;
				y._islandRoot = stack;
				stack = y;
				y = next;
			}
			while (stack) {
				next = stack._islandRoot;
				stack._islandRoot = y;
				stack = next;
			}

			if (x !== y) {
				if (x._islandRank < y._islandRank) {
					x._islandRoot = y;
				} else if (y._islandRank < x._islandRank) {
					y._islandRoot = x;
				} else {
					y._islandRoot = x;
					x._islandRank += 1;
				}
			}
		};

		Physics2DWorld.prototype.__find = function (x) {
			if (x === x._islandRoot) {
				return x;
			}

			var stack = null;
			var next;
			while (x !== x._islandRoot) {
				next = x._islandRoot;
				x._islandRoot = stack;
				stack = x;
				x = next;
			}
			while (stack) {
				next = stack._islandRoot;
				stack._islandRoot = x;
				stack = next;
			}
			return x;
		};

		// =====================================================================
		Physics2DWorld.prototype._sleepComputations = function (deltaTime) {
			// Build disjoint set forest.
			//
			// arb.active not yet computed, so base it on currently available info.
			var arbiters = this.dynamicArbiters;
			var arb;
			var limit = arbiters.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				arb = arbiters[i];

				/*jshint bitwise: false*/
				if (!arb.sensor && !arb._retired && arb._updateStamp === this.timeStamp && (arb._state & (/*STATE_ACCEPT*/ 1)) !== 0) {
					/*jshint bitwise: true*/
					var b1 = arb.bodyA;
					var b2 = arb.bodyB;
					if (b1._type === (/*TYPE_DYNAMIC*/ 0) && b2._type === (/*TYPE_DYNAMIC*/ 0)) {
						this.__union(b1, b2);
					}
				}
			}

			var constraints = this.liveConstraints;
			limit = constraints.length;
			for (i = 0; i < limit; i += 1) {
				constraints[i]._sleepComputation(this.__union);
			}

			// Build islands.
			var islands = this._islands;
			var island, root;
			var bodies = this.liveDynamics;
			limit = bodies.length;
			while (limit > 0) {
				limit -= 1;
				var body = bodies.pop();

				root = this.__find(body);
				island = root._island;
				if (island === null) {
					root._island = island = Physics2DIsland.allocate();
					islands.push(island);
					island.sleeping = true;
					island.wakeTime = 0;
				}
				body._island = island;
				island.components.push(body);

				var atRest = body._atRest(deltaTime, this.timeStamp);
				island.sleeping = (island.sleeping && atRest);
				if (body._wakeTime > island.wakeTime) {
					island.wakeTime = body._wakeTime;
				}
			}

			limit = constraints.length;
			while (limit > 0) {
				limit -= 1;
				var con = constraints.pop();

				root = this.__find(con);
				island = root._island;
				if (island === null) {
					root._island = island = Physics2DIsland.allocate();
					islands.push(island);
					island.sleeping = true;
					island.wakeTime = 0;
				}

				con._island = island;
				island.components.push(con);
				if (con._wakeTime > island.wakeTime) {
					island.wakeTime = con._wakeTime;
				}
			}

			// Build new live lists of bodies and constraints.
			// live lists of arbiters is deferred to preStep.
			// And destroy waking islands.
			limit = islands.length;
			var limit2;
			var bphase = this.broadphase;
			while (limit > 0) {
				limit -= 1;
				island = islands[limit];
				islands.pop();

				var comp, comps;
				if (island.sleeping) {
					comps = island.components;
					limit2 = comps.length;
					var j;
					for (j = 0; j < limit2; j += 1) {
						comp = comps[j];
						comp.sleeping = true;

						if (comp._isBody) {
							var shapes = comp.shapes;
							var limit3 = shapes.length;
							var k;
							for (k = 0; k < limit3; k += 1) {
								var shape = shapes[k];
								bphase.update(shape._bphaseHandle, shape._data, true);
							}
							var data = comp._data;
							data[(/*BODY_VEL*/ 7)] = 0;
							data[(/*BODY_VEL*/ 7) + 1] = 0;
							data[(/*BODY_VEL*/ 7) + 2] = 0;
						}

						// Body + Constraint
						if (comp._onSleep.length > 0) {
							this._pushCallbacks(comp, comp._onSleep);
						}
					}
				} else {
					comps = island.components;
					limit2 = comps.length;
					while (limit2 > 0) {
						limit2 -= 1;
						comp = comps.pop();

						comp._wakeTime = island.wakeTime;
						if (comp._isBody) {
							bodies.push(comp);
						} else {
							constraints.push(comp);
						}

						// Reset island properties
						comp._island = null;
						comp._islandRoot = comp;
						comp._islandRank = 0;
					}

					Physics2DIsland.deallocate(island);
				}
			}
		};

		// =====================================================================
		Physics2DWorld.prototype._sortArbiters = function () {
			this._subSortArbiters(this.dynamicArbiters);
			this._subSortArbiters(this.staticArbiters);
		};

		Physics2DWorld.prototype._subSortArbiters = function (arbiters) {
			// Insertion sort of arbiters list using shape id's as
			// lexicographical keys.
			//
			// Insertion sort is suitable here, as arbiter list will be
			// SUBSTANTIALLY sorted already.
			//
			// We perform this sort so that broadphase has no effect
			// on physics behaviour.
			var i;
			var limit = arbiters.length - 1;
			for (i = 1; i < limit; i += 1) {
				var item = arbiters[i];
				var idA = item.shapeA.id;
				var idB = item.shapeB.id;

				var hole = i;
				while (hole > 0) {
					var cur = arbiters[hole - 1];
					var curIDA = cur.shapeA.id;
					if (curIDA < idA || (curIDA === idA && cur.shapeB.id < idB)) {
						break;
					}

					arbiters[hole] = cur;
					hole -= 1;
				}

				arbiters[hole] = item;
			}
		};

		// =====================================================================
		Physics2DWorld.prototype._onWakeCallbacks = function (component) {
			if (this._midStep) {
				if (component._onWake.length > 0) {
					this._pushCallbacks(component, component._onWake);
				}
			} else {
				component._woken = true;
			}
		};

		Physics2DWorld.prototype._pushCallbacks = function (thisObject, callbacks) {
			var cbs = this._callbacks;
			var limit = callbacks.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var cb = Physics2DCallback.allocate();
				cb.thisObject = thisObject;
				cb.callback = callbacks[i];
				cb.time = this._eventTime;
				cb.index = i;
				cbs.push(cb);
			}
		};

		Physics2DWorld.prototype._pushInteractionEvents = function (eventType, arb) {
			var cbs = this._callbacks;

			var shapeA = arb.shapeA;
			var shapeB = arb.shapeB;

			var groupA = shapeA._group;
			var groupB = shapeB._group;

			// Event listeners on shapeA
			var events = shapeA._events;
			var limit = events.length;
			var i, eventObject, cb;
			for (i = 0; i < limit; i += 1) {
				eventObject = events[i];

				/*jshint bitwise: false*/
				if (eventObject.type === eventType && (eventObject.mask === undefined || ((eventObject.mask & groupB) !== 0))) {
					cb = Physics2DCallback.allocate();
					cb.thisObject = shapeA;
					cb.callback = eventObject.callback;
					cb.time = this._eventTime;
					cb.index = i;
					cb.arbiter = arb;
					cbs.push(cb);
				}
			}

			// Event listeners on shapeB
			events = shapeB._events;
			limit = events.length;
			for (i = 0; i < limit; i += 1) {
				eventObject = events[i];

				/*jshint bitwise: false*/
				if (eventObject.type === eventType && (eventObject.mask === undefined || ((eventObject.mask & groupA) !== 0))) {
					cb = Physics2DCallback.allocate();
					cb.thisObject = shapeA;
					cb.callback = eventObject.callback;
					cb.time = this._eventTime;
					cb.index = i;
					cb.arbiter = arb;
					cbs.push(cb);
				}
			}
		};

		// =====================================================================
		// precon: constraint was removed from live list.
		Physics2DWorld.prototype._brokenConstraint = function (con) {
			if (con._onBreak.length > 0) {
				this._pushCallbacks(con, con._onBreak);
			}

			if (con._removeOnBreak) {
				con.world = null;

				var constraints = this.constraints;
				var index = constraints.indexOf(con);
				constraints[index] = constraints[constraints.length - 1];
				constraints.pop();

				con._outWorld();
			} else {
				con._active = false;
			}

			con._clearCache();
		};

		Physics2DWorld.prototype._preStep = function (deltaTime) {
			var constraints = this.liveConstraints;
			var limit = constraints.length;
			var i;
			for (i = 0; i < limit;) {
				var con = constraints[i];
				if (con._preStep(deltaTime)) {
					limit -= 1;
					constraints[i] = constraints[limit];
					constraints.pop();
					this._brokenConstraint(con);
					continue;
				}

				i += 1;
			}

			this._preStepArbiters(this.dynamicArbiters, deltaTime);
			this._preStepArbiters(this.staticArbiters, deltaTime);
		};

		// Used in continuous collisions, only want to pre-step a single arbiter.
		Physics2DWorld.prototype._preStepArbiter = function (arb, deltaTime, progressEvents) {
			var timeStamp = this.timeStamp;

			// Should never be the case that arbiter needs to be put to sleep
			// Or needs to be retired, or to issue an end.
			arb.active = (arb._updateStamp === timeStamp);

			// Will however, require a begin callback to be issued in certain
			// cases (Continuous collision). and a progress callback (continuous
			// collision causing objects to be woken).
			if (arb._createContinuous && arb._createStamp === timeStamp) {
				this._pushInteractionEvents((/*EVENT_BEGIN*/ 1), arb);
			} else if (progressEvents && arb.active) {
				this._pushInteractionEvents((/*EVENT_PROGRESS*/ 2), arb);
			}

			if (arb.active) {
				/*jshint bitwise: false*/
				if ((arb._state & (/*STATE_ACCEPT*/ 1)) !== 0) {
					if (!arb._preStep(deltaTime, timeStamp, true)) {
						arb.active = false;
					}
				} else if (!arb.sensor && !arb._cleanContacts(timeStamp)) {
					arb.active = false;
				}
			}
		};

		// Used in usual case, pre stepping whole list of arbiters.
		Physics2DWorld.prototype._preStepArbiters = function (arbiters, deltaTime) {
			var timeStamp = this.timeStamp;
			var limit = arbiters.length;
			var i;
			for (i = 0; i < limit;) {
				var arb = arbiters[i];
				if (!arb._retired && (arb.bodyA.sleeping && arb.bodyB.sleeping)) {
					arb._sleepStamp = timeStamp;
					arb.sleeping = true;
					arb.active = false;

					// Issue progress callback for first update that arbiter sleeps!
					this._pushInteractionEvents((/*EVENT_PROGRESS*/ 2), arb);

					limit -= 1;
					arbiters[i] = arbiters[limit];
					arbiters.pop();
					continue;
				}

				// Permit arbiter to exist for 1 further update.
				// So that we can issue end callbacks.
				if (!arb._lazyRetired) {
					if (arb._retired || arb._updateStamp + (arb.sensor ? 1 : Physics2DConfig.DELAYED_DEATH) < timeStamp) {
						arb._retire();
						limit -= 1;
						arbiters[i] = arbiters[limit];
						arbiters.pop();
						Physics2DArbiter.deallocate(arb);
						continue;
					}
				} else {
					arb._lazyRetired = false;
					i += 1;
					continue;
				}

				arb.active = (arb._updateStamp === timeStamp);

				// Set up callbacks.
				if (arb._createStamp === timeStamp) {
					this._pushInteractionEvents((/*EVENT_BEGIN*/ 1), arb);
				} else if (arb.active) {
					this._pushInteractionEvents((/*EVENT_PROGRESS*/ 2), arb);
				} else if (arb._updateStamp === (timeStamp - 1)) {
					this._pushInteractionEvents((/*EVENT_END*/ 3), arb);
					arb._endGenerated = this.timeStamp;
				}

				if (arb.active) {
					/*jshint bitwise: false*/
					if ((arb._state & (/*STATE_ACCEPT*/ 1)) !== 0) {
						if (!arb._preStep(deltaTime, timeStamp)) {
							arb.active = false;
						}
					} else if (!arb.sensor && !arb._cleanContacts(timeStamp)) {
						arb.active = false;
					}
				}

				i += 1;
			}
		};

		// =====================================================================
		Physics2DWorld.prototype._iterateVelocity = function (count) {
			var constraints = this.liveConstraints;
			while (count > 0) {
				var limit = constraints.length;
				var i;
				for (i = 0; i < limit;) {
					var con = constraints[i];
					if (con._iterateVel()) {
						limit -= 1;
						constraints[i] = constraints[limit];
						constraints.pop();
						this._brokenConstraint(con);
						continue;
					}

					i += 1;
				}

				this._iterateVelocityArbiters(this.dynamicArbiters);
				this._iterateVelocityArbiters(this.staticArbiters);
				count -= 1;
			}
		};

		Physics2DWorld.prototype._iterateVelocityArbiters = function (arbiters) {
			var limit = arbiters.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var arb = arbiters[i];

				/*jshint bitwise: false*/
				if (arb.active && !arb.sensor && (arb._state & (/*STATE_ACCEPT*/ 1)) !== 0) {
					arb._iterateVelocity();
				}
			}
		};

		// =====================================================================
		Physics2DWorld.prototype._iteratePosition = function (count) {
			var constraints = this.liveConstraints;
			while (count > 0) {
				var limit = constraints.length;
				var i;
				for (i = 0; i < limit;) {
					var con = constraints[i];
					if (con._stiff && con._iteratePos()) {
						limit -= 1;
						constraints[i] = constraints[limit];
						constraints.pop();
						this._brokenConstraint(con);
						continue;
					}

					i += 1;
				}

				this._iteratePositionArbiters(this.dynamicArbiters);
				this._iteratePositionArbiters(this.staticArbiters);
				count -= 1;
			}
		};

		Physics2DWorld.prototype._iteratePositionArbiters = function (arbiters) {
			var limit = arbiters.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var arb = arbiters[i];

				/*jshint bitwise: false*/
				if (arb.active && !arb.sensor && (arb._state & (/*STATE_ACCEPT*/ 1)) !== 0) {
					arb._iteratePosition();
				}
			}
		};

		// =====================================================================
		Physics2DWorld.prototype._integrateVelocity = function (deltaTime) {
			var gravityX = this._gravityX;
			var gravityY = this._gravityY;

			var bodies = this.liveDynamics;
			var limit = bodies.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var body = bodies[i];
				var data = body._data;

				var imass = data[(/*BODY_IMASS*/ 0)];
				var drag;
				if (imass !== 0) {
					data[(/*BODY_VEL*/ 7)] += ((data[(/*BODY_FORCE*/ 10)] * imass) + gravityX) * deltaTime;
					data[(/*BODY_VEL*/ 7) + 1] += ((data[(/*BODY_FORCE*/ 10) + 1] * imass) + gravityY) * deltaTime;

					drag = Math.exp(deltaTime * data[(/*BODY_LIN_DRAG*/ 21)]);
					data[(/*BODY_VEL*/ 7)] *= drag;
					data[(/*BODY_VEL*/ 7) + 1] *= drag;
				}

				var iinertia = data[(/*BODY_IINERTIA*/ 1)];
				if (iinertia !== 0) {
					data[(/*BODY_VEL*/ 7) + 2] += (data[(/*BODY_FORCE*/ 10) + 2] * iinertia) * deltaTime;
					data[(/*BODY_VEL*/ 7) + 2] *= Math.exp(deltaTime * data[(/*BODY_ANG_DRAG*/ 22)]);
				}
			}
		};

		// =====================================================================
		Physics2DWorld.prototype._integratePosition = function (deltaTime) {
			this._integratePositionBodies(this.liveDynamics, deltaTime);
			this._integratePositionBodies(this.liveKinematics, deltaTime);
		};

		Physics2DWorld.prototype._integratePositionBodies = function (bodies, deltaTime) {
			var MAX_VEL = (2 * Math.PI / deltaTime);
			var idt2 = (1 / (deltaTime * deltaTime));

			var linThreshold = Physics2DConfig.MIN_LINEAR_STATIC_SWEEP;
			var angThreshold = Physics2DConfig.MIN_ANGULAR_STATIC_SWEEP;
			linThreshold *= linThreshold * idt2;
			angThreshold *= angThreshold * idt2;

			var bulletLinThreshold = Physics2DConfig.MIN_LINEAR_BULLET_SWEEP;
			var bulletAngThreshold = Physics2DConfig.MIN_ANGULAR_BULLET_SWEEP;
			bulletLinThreshold *= bulletLinThreshold * idt2;
			bulletAngThreshold *= bulletAngThreshold * idt2;

			var bphase = this.broadphase;

			var limit = bodies.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var body = bodies[i];
				var data = body._data;
				var preX = data[(/*BODY_PRE_POS*/ 15)] = data[(/*BODY_POS*/ 2)];
				var preY = data[(/*BODY_PRE_POS*/ 15) + 1] = data[(/*BODY_POS*/ 2) + 1];
				data[(/*BODY_PRE_POS*/ 15) + 2] = data[(/*BODY_POS*/ 2) + 2];

				var curX = data[(/*BODY_POS*/ 2)] += (data[(/*BODY_VEL*/ 7)] * deltaTime);
				var curY = data[(/*BODY_POS*/ 2) + 1] += (data[(/*BODY_VEL*/ 7) + 1] * deltaTime);
				var angVel = data[(/*BODY_VEL*/ 7) + 2];
				body._deltaRotation(angVel * deltaTime);

				data[(/*BODY_SWEEP_TIME*/ 18)] = deltaTime;

				// If moving very slowly, treat as static freezing object at t = deltaTime
				var vx = data[(/*BODY_VEL*/ 7)];
				var vy = data[(/*BODY_VEL*/ 7) + 1];
				var vw = data[(/*BODY_SWEEP_ANGVEL*/ 20)] = (angVel % MAX_VEL);

				var rad = data[(/*BODY_RADIUS*/ 19)];
				var lin = (linThreshold * rad * rad);
				var vmag = ((vx * vx) + (vy * vy));
				if (vmag > lin || (vw * vw) > angThreshold) {
					// Compute swept AABB
					var minX = (preX < curX ? preX : curX);
					var minY = (preY < curY ? preY : curY);
					var maxX = (preX < curX ? curX : preX);
					var maxY = (preY < curY ? curY : preY);

					var shapes = body.shapes;
					var limit2 = shapes.length;
					var j;
					for (j = 0; j < limit2; j += 1) {
						var shape = shapes[j];
						var sdata = shape._data;
						rad = sdata[(/*SHAPE_SWEEP_RADIUS*/ 4)];
						sdata[(/*SHAPE_AABB*/ 0)] = (minX - rad);
						sdata[(/*SHAPE_AABB*/ 0) + 1] = (minY - rad);
						sdata[(/*SHAPE_AABB*/ 0) + 2] = (maxX + rad);
						sdata[(/*SHAPE_AABB*/ 0) + 3] = (maxY + rad);

						bphase.update(shape._bphaseHandle, sdata);
					}

					body._sweepFrozen = false;

					if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
						body._bullet = (body.bullet && (vmag > (bulletLinThreshold * rad * rad) || (vw * vw) > bulletAngThreshold));
					}
				} else {
					body._sweepFrozen = true;
					body._bullet = false;
				}
			}
		};

		// =====================================================================
		Physics2DWorld.prototype._finalize = function () {
			this._finalizeBodies(this.liveDynamics);
			this._finalizeBodies(this.liveKinematics);

			// Finalize contact positions for API to be correct at end of step() in queries
			this._finalizeArbiters(this.dynamicArbiters);
			this._finalizeArbiters(this.staticArbiters);
		};

		Physics2DWorld.prototype._finalizeArbiters = function (arbiters) {
			var limit = arbiters.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var arb = arbiters[i];
				if (arb.active && !arb.sensor) {
					arb._refreshContactData();
				}
			}
		};

		Physics2DWorld.prototype._finalizeBodies = function (bodies) {
			var bphase = this.broadphase;
			var limit = bodies.length;
			var i;
			for (i = 0; i < limit;) {
				var body = bodies[i];
				var data = body._data;

				var shapes = body.shapes;
				var limit2 = shapes.length;
				var j, shape;

				if (data[(/*BODY_PRE_POS*/ 15)] !== data[(/*BODY_POS*/ 2)] || data[(/*BODY_PRE_POS*/ 15) + 1] !== data[(/*BODY_POS*/ 2) + 1] || data[(/*BODY_PRE_POS*/ 15) + 2] !== data[(/*BODY_POS*/ 2) + 2]) {
					body._invalidated = true;
				} else if (body._type === (/*TYPE_KINEMATIC*/ 1)) {
					limit -= 1;
					bodies[i] = bodies[limit];
					bodies.pop();

					body.sleeping = true;

					for (j = 0; j < limit2; j += 1) {
						shape = shapes[j];
						bphase.update(shape._bphaseHandle, shape._data, true);
					}
					continue;
				}

				i += 1;
			}
		};

		// =====================================================================
		Physics2DWorld.prototype._doCallbacks = function () {
			// Order by event index so as to guarantee that event listeners
			// added first, are processed first.
			//
			// Inlined quick sort, builtin JS.sort was too slow with function comparator.
			var callbacks = this._callbacks;
			var i;
			var stack = [callbacks.length - 1, 0];
			do {
				var left = stack.pop();
				var right = stack.pop();
				if (left > right) {
					continue;
				}

				/*jshint bitwise: false*/
				var pivot = (left + right) >> 1;

				/*jshint bitwise: true*/
				// Partition about center
				var pivotValue = callbacks[pivot];
				var index = left;
				var pIndex = pivotValue.index;
				var pTime = pivotValue.time;

				callbacks[pivot] = callbacks[right];
				callbacks[right] = pivotValue;
				for (i = left; i < right; i += 1) {
					var cur = callbacks[i];
					if (cur.time < pTime || (cur.time === pTime && cur.index < pIndex)) {
						callbacks[i] = callbacks[index];
						callbacks[index] = cur;
						index += 1;
					}
				}
				callbacks[right] = callbacks[index];
				callbacks[index] = pivotValue;

				// index + 1 <-> right
				if (index + 1 < right) {
					stack.push(right);
					stack.push(index + 1);
				}

				// left <-> index - 1
				if (left < index - 1) {
					stack.push(index - 1);
					stack.push(left);
				}
			} while(stack.length > 0);

			// Issue callbacks
			var limit = callbacks.length;
			for (i = 0; i < limit; i += 1) {
				var cb = callbacks[i];
				if (cb.arbiter) {
					// BEGIN/PROGRESS/END
					var arb = cb.arbiter;
					var sa = arb.shapeA;
					var sb = arb.shapeB;
					var thisShape = cb.thisObject;
					cb.callback.call(thisShape, arb, (thisShape === sa ? sb : sa));
				} else {
					// WAKE/SLEEP/BREAK
					cb.callback.call(cb.thisObject);
				}
				Physics2DCallback.deallocate(cb);
			}
			callbacks.length = 0;
		};

		// =====================================================================
		Physics2DWorld.prototype._warmStart = function () {
			var constraints = this.liveConstraints;
			var limit = constraints.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				constraints[i]._warmStart();
			}

			this._warmStartArbiters(this.dynamicArbiters);
			this._warmStartArbiters(this.staticArbiters);
		};

		Physics2DWorld.prototype._warmStartArbiters = function (arbiters) {
			var limit = arbiters.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var arb = arbiters[i];

				/*jshint bitwise: false*/
				if (arb.active && !arb.sensor && (arb._state & (/*STATE_ACCEPT*/ 1)) !== 0) {
					arb._warmStart();
				}
			}
		};

		// =====================================================================
		Physics2DWorld.prototype._forceSleepBody = function (body) {
			if (body.sleeping || body._type !== (/*TYPE_DYNAMIC*/ 0)) {
				return;
			}

			body.sleeping = true;

			var bodies = this.liveDynamics;
			var index = bodies.indexOf(body);
			bodies[index] = bodies[bodies.length - 1];
			bodies.pop();

			var shapes = body.shapes;
			var limit = shapes.length;
			var i;
			var bphase = this.broadphase;
			for (i = 0; i < limit; i += 1) {
				var shape = shapes[i];
				bphase.update(shape._bphaseHandle, shape._data, true);

				// Force arbiters to go to sleep.
				var arbiters = shape.arbiters;
				var limit2 = arbiters.length;
				var j;
				for (j = 0; j < limit2; j += 1) {
					var arb = arbiters[j];
					if (arb._retired || arb.sleeping) {
						continue;
					}

					arb.sleeping = true;
					arb._sleepStamp = this.timeStamp;
					var arbs;
					if (arb._static) {
						arbs = this.staticArbiters;
					} else {
						arbs = this.dynamicArbiters;
					}

					index = arbs.indexOf(arb);
					arbs[index] = arbs[arbs.length - 1];
					arbs.pop();
				}
			}
		};

		Physics2DWorld.prototype._forceSleepConstraint = function (constraint) {
			if (constraint.sleeping) {
				return;
			}

			constraint.sleeping = true;

			if (constraint._active) {
				var constraints = this.liveConstraints;
				var index = constraints.indexOf(constraint);
				constraints[index] = constraints[constraints.length - 1];
				constraints.pop();
			}
		};

		Physics2DWorld.prototype._wakeConstraint = function (constraint, noCallback) {
			if (constraint.world !== this) {
				return;
			}

			if (constraint._active) {
				constraint._wakeTime = (this.timeStamp + (this._midStep ? 0 : 1));
				if (constraint.sleeping) {
					if (!constraint._island) {
						constraint.sleeping = false;
						this.liveConstraints.push(constraint);
						constraint._wakeConnected();

						if (!noCallback) {
							this._onWakeCallbacks(constraint);
						}
					} else {
						this._wakeIsland(constraint._island, (noCallback ? constraint : null));
					}
				}
			}
		};

		Physics2DWorld.prototype._wakeBody = function (body, noCallback, continuousCallbacks) {
			if (body.world !== this) {
				return;
			}

			body._wakeTime = (this.timeStamp + (this._midStep ? 0 : 1));
			if (body.sleeping) {
				if (!body._island) {
					var bphase = this.broadphase;

					// new body, or forced wake, or kinematic
					if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
						body.sleeping = false;
						this.liveDynamics.push(body);
					} else if (body._type === (/*TYPE_KINEMATIC*/ 1)) {
						body.sleeping = false;
						this.liveKinematics.push(body);
					}

					var constraints = body.constraints;
					var limit = constraints.length;
					var i;
					for (i = 0; i < limit; i += 1) {
						this._wakeConstraint(constraints[i]);
					}

					var isStatic = (body._type === (/*TYPE_STATIC*/ 2));

					var shapes = body.shapes;
					limit = shapes.length;
					for (i = 0; i < limit; i += 1) {
						var shape = shapes[i];
						this._wakeArbiters(shape.arbiters, false, continuousCallbacks);
						if (!isStatic) {
							bphase.update(shape._bphaseHandle, shape._data, false);
						}
					}

					if (!noCallback && (body._type === (/*TYPE_DYNAMIC*/ 0))) {
						this._onWakeCallbacks(body);
					}
				} else {
					this._wakeIsland(body._island, (noCallback ? body : null), continuousCallbacks);
				}
			}
		};

		Physics2DWorld.prototype._wakeArbiter = function (arb, continuousCallbacks) {
			arb.sleeping = false;

			var timeStamp = (this.timeStamp + (this._midStep ? 0 : 1));
			var tDelta = (timeStamp - arb._sleepStamp);
			arb._updateStamp += tDelta;
			var contacts = arb.contacts;
			var limit2 = contacts.length;
			var j;
			for (j = 0; j < limit2; j += 1) {
				contacts[j]._timeStamp += tDelta;
			}

			if (arb._static) {
				this.staticArbiters.push(arb);
			} else {
				this.dynamicArbiters.push(arb);
			}

			// Arbiter was woken as the result of a continuous collisions
			// And we must pre-step and generate callbacks.
			if (continuousCallbacks) {
				this._continuousArbiterPrepare(arb, this._deltaTime, true);
			}
		};

		Physics2DWorld.prototype._continuousArbiterPrepare = function (arb, deltaTime, progressEvents) {
			this._preStepArbiter(arb, deltaTime, progressEvents);

			/*jshint bitwise: false*/
			if (arb.active && !arb.sensor && (arb._state & (/*STATE_ACCEPT*/ 1)) !== 0) {
				// Single velocity iteration of just this arbiter.
				// Helps objects to bounce immediately, any errors will be resolved
				// in following step anyhow.
				arb._iterateVelocity();
			}
		};

		Physics2DWorld.prototype._wakeArbiters = function (arbiters, skip, continuousCallbacks) {
			var limit = arbiters.length;
			var i;
			var timeStamp = (this.timeStamp + (this._midStep ? 0 : 1));
			for (i = 0; i < limit; i += 1) {
				var arb = arbiters[i];
				if (arb._retired) {
					continue;
				}

				if (arb.sleeping) {
					this._wakeArbiter(arb, continuousCallbacks);
				}

				if (!skip) {
					// arb.active is not yet computed.
					/*jshint bitwise: false*/
					if ((arb._updateStamp === timeStamp) && !arb.sensor && (arb._state & (/*STATE_ACCEPT*/ 1)) !== 0) {
						var b1 = arb.bodyA;
						var b2 = arb.bodyB;
						if (b1._type === (/*TYPE_DYNAMIC*/ 0) && b1.sleeping) {
							this._wakeBody(b1, false, continuousCallbacks);
						}
						if (b2._type === (/*TYPE_DYNAMIC*/ 0) && b2.sleeping) {
							this._wakeBody(b2, false, continuousCallbacks);
						}
					}
				}
			}
		};

		Physics2DWorld.prototype._wakeIsland = function (island, noCallbackObject, continuousCallbacks) {
			var bphase = this.broadphase;
			var bodies = this.liveDynamics;
			var constraints = this.liveConstraints;

			var timeStamp = (this.timeStamp + (this._midStep ? 0 : 1));
			var components = island.components;
			var limit = components.length;
			while (limit > 0) {
				limit -= 1;
				var c = components.pop();
				c._wakeTime = timeStamp;

				// Reset island properties.
				c._island = null;
				c._islandRoot = c;
				c._islandRank = 0;

				c.sleeping = false;

				if (c._isBody) {
					// TODO: fix <any> casts
					// only dynamic bodies are inserted to islands.
					bodies.push(c);

					var shapes = c.shapes;
					var limit2 = shapes.length;
					var i;
					for (i = 0; i < limit2; i += 1) {
						var shape = shapes[i];
						this._wakeArbiters(shape.arbiters, true, continuousCallbacks);
						bphase.update(shape._bphaseHandle, shape._data, false);
					}
				} else {
					constraints.push(c);
				}

				// Body + Constraint
				if (noCallbackObject !== c) {
					this._onWakeCallbacks(c);
				}
			}

			Physics2DIsland.deallocate(island);
		};

		// =====================================================================
		Physics2DWorld.prototype._transmitBodyType = function (body, newType) {
			// Wake as old type.
			// Interactions that are presently active may
			// become ignored.
			this._wakeBody(body);

			// Just woke the body, so it's not sleeping
			var bodies;
			if (body._type === (/*TYPE_DYNAMIC*/ 0)) {
				bodies = this.liveDynamics;
			} else if (body._type === (/*TYPE_KINEMATIC*/ 1)) {
				bodies = this.liveKinematics;
			}

			var index;
			if (bodies) {
				index = bodies.indexOf(body);
				bodies[index] = bodies[bodies.length - 1];
				bodies.pop();
			}

			body._type = newType;

			var staticBody = (newType === (/*TYPE_STATIC*/ 2));
			if (staticBody) {
				// Ensure body is updated as run time validation
				// Does not occur for static types.
				body._update();
			}

			if (newType === (/*TYPE_DYNAMIC*/ 0)) {
				// Set up ready for island computations
				body._islandRoot = body;
				body._islandRank = 0;
			}

			var bphase = this.broadphase;

			// Destroy redundant arbiters, and mutate arbiter static type.
			var shapes = body.shapes;
			var limit = shapes.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var shape = shapes[i];
				if (staticBody) {
					// Static bodies aren't synced by wakeBody
					bphase.update(shape._bphaseHandle, shape._data, true);
				}

				var arbiters = shape.arbiters;
				var limit2 = arbiters.length;
				var j;
				for (j = 0; j < limit2;) {
					var arb = arbiters[j];
					if (arb._retired) {
						continue;
					}

					var bothStaticType = (arb.bodyA._type !== (/*TYPE_DYNAMIC*/ 0) && arb.bodyB._type !== (/*TYPE_DYNAMIC*/ 0));
					var atleastOneKinematic = (arb.bodyA._type === (/*TYPE_KINEMATIC*/ 1) || arb.bodyB._type === (/*TYPE_KINEMATIC*/ 1));
					if (bothStaticType && !(atleastOneKinematic && arb.sensor)) {
						limit2 -= 1;
						arbiters[j] = arbiters[limit2];
						arbiters.pop();
						arb._lazyRetire(shape);
						this._pushInteractionEvents((/*EVENT_END*/ 3), arb);
						continue;
					}

					var staticType = (arb.bodyA._type !== (/*TYPE_DYNAMIC*/ 0) || arb.bodyB._type !== (/*TYPE_DYNAMIC*/ 0));
					if (staticType !== arb._static) {
						var arbs = (arb._static ? this.staticArbiters : this.dynamicArbiters);
						index = arbs.indexOf(arb);
						arbs[index] = arbs[arbs.length - 1];
						arbs.pop();

						arb._static = staticType;
						arbs = (staticType ? this.staticArbiters : this.dynamicArbiters);
						arbs.push(arb);
					}

					j += 1;
				}
			}

			// Force wake as new type.
			// Interactions that may have been previously ignored
			// may now become active.
			body.sleeping = true;
			this._wakeBody(body);
		};

		// =====================================================================
		Physics2DWorld.prototype._validate = function () {
			this._validateBodies(this.liveDynamics);
			this._validateBodies(this.liveKinematics);

			// Issue deferred wake callbacks to stack.
			var constraints = this.liveConstraints;
			var i;
			var limit = constraints.length;
			for (i = 0; i < limit; i += 1) {
				var con = constraints[i];
				if (con._woken && con._onWake.length > 0) {
					this._pushCallbacks(con, con._onWake);
				}
				con._woken = false;
			}
		};

		Physics2DWorld.prototype._validateBodies = function (bodies) {
			var bphase = this.broadphase;
			var i;
			var limit = bodies.length;
			for (i = 0; i < limit; i += 1) {
				var body = bodies[i];

				// Prevent errors accumulating.
				var data = body._data;
				var rot = data[(/*BODY_POS*/ 2) + 2];
				data[(/*BODY_AXIS*/ 5)] = Math.cos(rot);
				data[(/*BODY_AXIS*/ 5) + 1] = Math.sin(rot);

				// Update shape world-data.
				body._update();

				if (body._type === (/*TYPE_DYNAMIC*/ 0) && body._woken && body._onWake.length > 0) {
					this._pushCallbacks(body, body._onWake);
				}
				body._woken = false;

				var shapes = body.shapes;
				var limit2 = shapes.length;
				var j;
				for (j = 0; j < limit2; j += 1) {
					var shape = shapes[j];
					bphase.update(shape._bphaseHandle, shape._data);
				}
			}
		};

		Physics2DWorld.create = function (params) {
			var w = new Physics2DWorld();
			w.simulatedTime = 0;

			// ALL such objects.
			w.rigidBodies = [];
			w.constraints = [];

			// Non-sleeping such objects.
			w.liveDynamics = [];
			w.liveKinematics = [];
			w.liveConstraints = [];

			// Non-sleeping only.
			w.dynamicArbiters = [];
			w.staticArbiters = [];

			w._islands = [];
			w._toiEvents = [];
			w._deferredWake = [];

			w._eventTime = (/*EVENT_TIME_PRE*/ -1);
			w._callbacks = [];

			w.broadphase = (params.broadphase || Physics2DBoxTreeBroadphase.create());

			w.velocityIterations = (params.velocityIterations || 8);
			w.positionIterations = (params.positionIterations || 8);

			w._midStep = false;
			w.timeStamp = 0;

			var gravity = params.gravity;
			w._gravityX = (gravity ? gravity[0] : 0);
			w._gravityY = (gravity ? gravity[1] : 10);

			w._collisions = Physics2DCollisionUtils.create();

			// =====================================================================
			w._sampleRectangle = Types.createFloatArray(4);

			var shapeSampler = function shapeSamplerFn(lambda) {
				return {
					store: null,
					count: 0,
					collisions: w._collisions,
					sample: function (handle, bounds) {
						var shape = handle.data;
						if (lambda.call(this, shape, bounds)) {
							this.store[this.count] = shape;
							this.count += 1;
						}
					}
				};
			};

			var bodySampler = function bodySamplerFn(lambda) {
				return {
					store: null,
					count: 0,
					collisions: w._collisions,
					sample: function (handle, bounds) {
						var shape = handle.data;
						if (lambda.call(this, shape, bounds)) {
							var found = false;
							var body = shape.body;
							var i;
							var limit = this.count;
							var bodies = this.store;
							for (i = 0; i < limit; i += 1) {
								if (bodies[i] === body) {
									found = true;
									break;
								}
							}

							if (!found) {
								bodies[limit] = body;
								this.count += 1;
							}
						}
					}
				};
			};

			var pointSampler = function pointSamplerFn(shape, point) {
				return this.collisions._contains(shape, point[0], point[1]);
			};
			w._shapePointCallback = shapeSampler(pointSampler);
			w._bodyPointCallback = bodySampler(pointSampler);

			var rectangleSampler = function rectangleSamplerFn(shape, unusedSampleBox) {
				return this.collisions._test(shape, this.rectangleShape);
			};
			w._shapeRectangleCallback = shapeSampler(rectangleSampler);
			w._bodyRectangleCallback = bodySampler(rectangleSampler);

			w._rectangleQueryVertices = [
				Types.createFloatArray(2),
				Types.createFloatArray(2),
				Types.createFloatArray(2),
				Types.createFloatArray(2)
			];
			w._rectangleQueryShape = Physics2DPolygon.create({ vertices: w._rectangleQueryVertices });
			w._shapeRectangleCallback.rectangleShape = w._rectangleQueryShape;
			w._bodyRectangleCallback.rectangleShape = w._rectangleQueryShape;

			var circleSampler = function circleSamplerFn(shape, unusedSampleBox) {
				return this.collisions._test(shape, this.circleShape);
			};
			w._shapeCircleCallback = shapeSampler(circleSampler);
			w._bodyCircleCallback = bodySampler(circleSampler);

			w._circleQueryShape = Physics2DCircle.create({ radius: 1 });
			w._shapeCircleCallback.circleShape = w._circleQueryShape;
			w._bodyCircleCallback.circleShape = w._circleQueryShape;

			var tempCastResult = {
				shape: null,
				hitPoint: Types.createFloatArray(2),
				hitNormal: Types.createFloatArray(2),
				factor: 0
			};

			w._rayCast = {
				minNormal: Types.createFloatArray(2),
				minShape: null,
				minFactor: 0,
				userCallback: null,
				userThis: null,
				ray: null,
				noInner: false,
				normal: Types.createFloatArray(2),
				sample: function sampleFn(handle, _) {
					var shape = handle.data;

					var ray = this.ray;
					var normal = this.normal;

					var oldFactor = ray.maxFactor;
					ray.maxFactor = this.minFactor;
					var factor = w._collisions.rayTest(shape, ray, normal, this.noInner);
					ray.maxFactor = oldFactor;

					if (this.userCallback) {
						var result = tempCastResult;
						var vector = result.hitNormal;
						vector[0] = normal[0];
						vector[1] = normal[1];

						vector = result.hitPoint;
						var origin = ray.origin;
						var direction = ray.direction;
						vector[0] = (origin[0] + (direction[0] * factor));
						vector[1] = (origin[1] + (direction[1] * factor));
						result.factor = factor;
						result.shape = shape;

						if (!this.userCallback.call(this.userThis, ray, result)) {
							return;
						}
					}

					if (factor !== undefined) {
						this.minFactor = factor;
						this.minShape = shape;

						var minNormal = this.minNormal;
						minNormal[0] = normal[0];
						minNormal[1] = normal[1];
					}
				}
			};

			w._convexCast = {
				toi: w._collisions._toi,
				minData: Types.createFloatArray(4),
				minShape: null,
				minTOIAlpha: 0,
				userCallback: null,
				userThis: null,
				deltaTime: 0,
				sample: function sampleFn(handle, _) {
					var toi = this.toi;
					var shape = handle.data;

					// sweeping shape against itself!
					// can happen if input for sweep was a shape in the World.
					if (shape === toi.shapeA) {
						return;
					}

					toi.shapeB = shape;
					shape.body._update();

					var ret = w._collisions._staticSweep(toi, (this.minTOIAlpha * this.deltaTime), 0) * this.minTOIAlpha;

					if (ret <= 0) {
						return;
					}

					var tdata = toi._data;
					if (this.userCallback) {
						var result = tempCastResult;
						var vector = result.hitNormal;
						vector[0] = (-tdata[(/*TOI_AXIS*/ 0)]);
						vector[1] = (-tdata[(/*TOI_AXIS*/ 0) + 1]);
						vector = result.hitPoint;
						vector[0] = tdata[(/*TOI_WITNESS_B*/ 4)];
						vector[1] = tdata[(/*TOI_WITNESS_B*/ 4) + 1];
						result.factor = (ret * this.deltaTime);
						result.shape = shape;
						result.shape = shape;

						if (!this.userCallback.call(this.userThis, toi.shapeA, result)) {
							return;
						}
					}

					this.minTOIAlpha = ret;
					var data = this.minData;
					data[0] = tdata[(/*TOI_AXIS*/ 0)];
					data[1] = tdata[(/*TOI_AXIS*/ 0) + 1];
					data[2] = tdata[(/*TOI_WITNESS_B*/ 4)];
					data[3] = tdata[(/*TOI_WITNESS_B*/ 4) + 1];
					this.minShape = shape;
				}
			};

			return w;
		};

		Physics2DWorld.version = 1;
		return Physics2DWorld;
})