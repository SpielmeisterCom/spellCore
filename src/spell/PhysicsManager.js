/**
 * @class spell.physicsManager
 * @singleton
 *
 * Provides rigid body physics
 *
 * The PhysicsManager is powered by Turblenz 2DPhysicsDevice Copyright (c) 2009-2014 Turbulenz Limited
 *
 * physicsManager uses SI units of meters (m), radians (rad), seconds (s), kilograms (kg) and Newtons (N).
 *
 * Physics parameters are tuned for objects in size ranging down to an absolute minimum of 0.001m = 1mm. Objects smaller than this will not behave correctly due to contact slop and thresholds in continuous collision detection routines. At the same time, for stability reasons there is a permitted slop in positional contacts of 0.01m = 1cm so that whilst objects down to 1mm are acceptible, objects this small will not interact together properly. You should try to keep objects at least 1cm big.
 * A suggestion if your game operates in pixels (px) is to use a scaling factor of roughly 60px for every 1m.
 */
define(
	'spell/PhysicsManager',
	[
		'spell/shared/util/platform/Types',
		'spell/physics/2D/Material',
		'spell/physics/2D/Circle',
		'spell/physics/2D/Polygon',
		'spell/physics/2D/RigidBody',
		'spell/physics/2D/World',
		'spell/physics/2D/AngleConstraint',
		'spell/physics/2D/PulleyConstraint',
		'spell/physics/2D/MotorConstraint',
		'spell/physics/2D/WeldConstraint',
		'spell/physics/2D/PointConstraint',
		'spell/physics/2D/LineConstraint',
		'spell/physics/2D/DistanceConstraint',
		'spell/physics/2D/CustomConstraint',
		'spell/physics/2D/SweepAndPrune',
		'spell/physics/2D/BoxTreeBroadphase',
		'spell/physics/2D/CollisionUtils',
		'spell/physics/2D/DebugDraw'
	],
	function(
		Types,
		Physics2DMaterial,
		Physics2DCircle,
		Physics2DPolygon,
		Physics2DRigidBody,
		Physics2DWorld,
		Physics2DAngleConstraint,
		Physics2DPulleyConstraint,
		Physics2DMotorConstraint,
		Physics2DWeldConstraint,
		Physics2DPointConstraint,
		Physics2DLineConstraint,
		Physics2DDistanceConstraint,
		Physics2DCustomConstraint,
		Physics2DSweepAndPrune,
		Physics2DBoxTreeBroadphase,
		Physics2DCollisionUtils,
		Physics2DDebugDraw
	) {
		'use strict'


		var PhysicsManager = function() {

			var _graphicsDevice = {
				width: 800,
				height: 600,
				technique: undefined,
				setStream: function() {

				},
				setTechnique: function( technique ) {
					this.technique = technique
				},
				setTechniqueParameters: function() {

				},
				setScissor: function() {

				},
				createIndexBuffer: function() {
					return {
						destroy: function() {

						},
						setData: function() {

						}
					}
				},
				setIndexBuffer: function() {

				},
				drawIndexed: function() {

				},
				createSemantics: function() {

				},
				createVertexBuffer: function() {
					return {
						destroy: function() {

						},
						setData: function() {

						}
					}
				},
				createShader: function() {
					return {
						getTechnique: function() {
							return {}
						}
					}
				},
				createTechniqueParameters: function() {

					return {
						clipSpace: new Array(4)
					}
				}
			}

			this.debugDraw = Physics2DDebugDraw.create( { graphicsDevice: _graphicsDevice } )
			this.debug = false
		}

		var idToBody           = {}




		var getBodyById = function( entityId ) {
			return idToBody[ entityId ]
		}

		var applyForce = function( entityId, force ) {
			var body = getBodyById( entityId )
			if( !body ) return

			var scale  = this.scale,
				forceX = force[ 0 ] * scale,
				forceY = force[ 1 ] * scale

			if( forceX || forceY ) {
				body.setForce( [ forceX, forceY ] )
			}
		}

		var setTorque = function( entityId, torque ) {
			var body = getBodyById( entityId )
			if( !body ) return

			if( torque ) {
				body.setTorque( torque )
			}
		}

		var applyImpulse = function( entityId, impulse, point ) {
			var body = getBodyById( entityId )
			if( !body ) return

			var scale    = this.scale,
				impulseX = impulse[ 0 ] * scale,
				impulseY = impulse[ 1 ] * scale

			if( impulseX || impulseY ) {
				body.applyImpulse(
					[ impulseX, impulseY ],
					point ?
						[ point[ 0 ] * scale, point[ 1 ] * scale ] :
						undefined
				)
			}
		}

		var setVelocity = function( entityId, velocity ) {
			var body = getBodyById( entityId )
			if( !body ) return

			var scale = this.scale

			body.setVelocity( [
				velocity[ 0 ] * scale,
				velocity[ 1 ] * scale
			])
		}

		var setVelocityX = function( entityId, velocityX ) {
			var body = getBodyById( entityId )
			if( !body ) return

			var scale    = this.scale,
				velocity = body.getVelocity()

			body.setVelocity( [
				velocityX * scale,
				velocity[ 1 ]
			])
		}

		var setVelocityY = function( entityId, velocityY ) {
			var body = getBodyById( entityId )
			if( !body ) return

			var scale    = this.scale,
				velocity = body.getVelocity()

			body.setVelocity( [
				velocity[ 0 ],
				velocityY * scale
			])
		}

		var getVelocity = function( entityId, dst ) {
			var body = getBodyById( entityId )
			if( !body ) return

			return body.getVelocity( dst )
		}

		var setFilterData = function( entityId, group, maskBits ) {
			var body = getBodyById( entityId )
			if( !body ) return

			var shapes = body.shapes

			for( var i = 0; i < shapes.length; i++ ) {
				var shape = shapes[ i ]

				if( group !== undefined ) {
					shape.setGroup( group )
				}

				if( maskBits !== undefined ) {
					shape.setMask( maskBits )
				}
			}
		}

		var setPosition = function( entityId, position ) {
			var body = getBodyById( entityId )
			if( !body ) return

			body.setPosition( position )
		}

		var getPosition = function( entityId, dst ) {
			var body = getBodyById( entityId )
			if( !body ) return

			return body.getPosition( dst )
		}

		var getRotation = function( entityId ) {
			var body = getBodyById( entityId )
			if( !body ) return

			return body.getRotation()
		}

		var setRotation = function( entityId, rotation ) {
			var body = getBodyById( entityId )
			if( !body ) return

			body.setRotation( rotation )
		}

		var createBodyDef = function( entityId, body, shapes, transform ) {
			var translation = transform.worldTranslation,
				scale       = this.scale

			var physicsBody = Physics2DRigidBody.create({
				type            : body.type,
				velocity        : [
					body.velocity[ 0 ] * scale,
					body.velocity[ 1 ] * scale
				],
				shapes          : shapes,
				position        :[
					translation[ 0 ],
					translation[ 1 ]
				],
				rotation        : transform.rotation,
                fixedRotation   : body.fixedRotation,
				mass            : body.mass > 0 ? body.mass : undefined,
				inertia         : body.inertia > 0 ? body.inertia : undefined,
				sleeping        : body.sleeping,
				bullet          : body.bullet,
				angularVelocity : body.angularVelocity,
				force           : body.force,
				torque          : body.torque,
				linearDrag      : body.linearDrag,
				angularDrag     : body.angularDrag,
				surfaceVelocity : body.surfaceVelocity,
				userData        : entityId
			})

			this.rawWorld.addRigidBody( physicsBody )

			idToBody[ entityId ] = physicsBody

			return physicsBody
		}

		var destroyBody = function( entityId ) {
			var body = getBodyById( entityId )
			if( !body ) return

			delete idToBody[ entityId ]

			this.rawWorld.removeRigidBody( body )
		}

		var step = function( deltaTime) {
			this.rawWorld.step( deltaTime )
		}

		var setAngularVelocity = function( entityId, angularVelocity ) {
			var body = getBodyById( entityId )
			if( !body ) return

			body.setAngularVelocity( angularVelocity )
		}

		var getAngularVelocity = function( entityId ) {
			var body = getBodyById( entityId )
			if( !body ) return

			return body.getAngularVelocity()
		}

		var setSurfaceVelocity = function( entityId, velocity ) {
			var body = getBodyById( entityId )
			if( !body ) return

			body.setSurfaceVelocity( velocity )
		}

		var getSurfaceVelocity = function( entityId ) {
			var body = getBodyById( entityId )
			if( !body ) return

			return body.getSurfaceVelocity()
		}

		var clear = function() {
			this.rawWorld.clear()
		}

		var getWorld = function() {
			return this.rawWorld
		}

        var putToSleep = function( entityId ) {
            var body = getBodyById( entityId )
            if( !body ) return

            return body.sleep()
        }

        var wakeUp = function( entityId ) {
            var body = getBodyById( entityId )
            if( !body ) return

            return body.wake()
        }

		var createWorld = function( gravity, scale, velocityIterations, positionIterations ) {
			if( !gravity ) gravity = [ 0, 0 ]
			if( !scale ) scale = 1

			this.rawWorld = Physics2DWorld.create({
				gravity            : gravity,
				velocityIterations : velocityIterations,
				positionIterations : positionIterations
			})

			this.scale = scale

			return this.rawWorld
		}

		var createRectangleVertices = function (minX, minY, maxX, maxY) {
			var tmp;
			if (maxX < minX) {
				tmp = minX;
				minX = maxX;
				maxX = tmp;
			}
			if (maxY < minY) {
				tmp = minY;
				minY = maxY;
				maxY = tmp;
			}

			var v0 = Types.createFloatArray(2);
			v0[0] = minX;
			v0[1] = minY;
			var v1 = Types.createFloatArray(2);
			v1[0] = maxX;
			v1[1] = minY;
			var v2 = Types.createFloatArray(2);
			v2[0] = maxX;
			v2[1] = maxY;
			var v3 = Types.createFloatArray(2);
			v3[0] = minX;
			v3[1] = maxY;

			return [v0, v1, v2, v3];
		};

		var createBoxVertices = function (width, height) {
			var w = (width * 0.5);
			var h = (height * 0.5);

			var v0 = Types.createFloatArray(2);
			v0[0] = -w;
			v0[1] = -h;
			var v1 = Types.createFloatArray(2);
			v1[0] = w;
			v1[1] = -h;
			var v2 = Types.createFloatArray(2);
			v2[0] = w;
			v2[1] = h;
			var v3 = Types.createFloatArray(2);
			v3[0] = -w;
			v3[1] = h;

			return [v0, v1, v2, v3];
		};

		var createRegularPolygonVertices = function (diameterX, diameterY, numVertices) {
			var rX = (diameterX * 0.5);
			var rY = (diameterY * 0.5);
			var vertices = [];

			var num = numVertices;
			var angInc = (Math.PI * 2 / num);

			var i;
			for (i = 0; i < num; i += 1) {
				var ang = (angInc * i);
				var vec = vertices[vertices.length] = Types.createFloatArray(2);
				vec[0] = (rX * Math.cos(ang));
				vec[1] = (rY * Math.sin(ang));
			}

			return vertices;
		};


		PhysicsManager.prototype = {
            BODY_TYPE_STATIC    : 'static',
            BODY_TYPE_DYNAMIC   : 'dynamic',
            BODY_TYPE_KINEMATIC : 'kinematic',

			createRectangleVertices : createRectangleVertices,

			createBoxVertices : createBoxVertices,

			createRegularPolygonVertices : createRegularPolygonVertices,

			getDefaultMaterial: function() {
				return Physics2DMaterial.defaultMaterial
			},

			createCircleShape: function( params ) {
				return Physics2DCircle.create( params )
			},

			createPolygonShape: function( params ) {
			 return Physics2DPolygon.create( params, null )
			},

			/**
			 * Create a RigidBody object.
			 * @param params
			 * @param {String} [params.type] The type of Rigid Body to create. One of *static*, *dynamic*, *kinematic*. Defaults to *dynamic*.
			 * @param {Array} [params.shapes] The set of Shapes to assign to the Rigid Body. Shapes may not be shared between rigid bodies. Shapes of a *static* body may not be modified once the body has been assigned to a World object.
			 * @param {Number} [params.mass] The mass in *kg* for this rigid body. This value must be strictly positive and has no effect on *static* and *kinematic* bodies which in terms of physics computations are assumed to have infinite mass. However if such a body should be transformed into a *dynamic* body at run-time, this value will still persist. If unspecified, mass will be computed as per *body.computeMassFromShapes()*.
			 * @param {Number} [params.inertia] The moment of inertia in kg*m²/rad². This value must be strictly positive and has no effect on *static* and *kinematic* bodies which in terms of physics computations are assumed to have infinite inertia. However if such a body should be transformed into a *dynamic* body at run-time, this value will still persist. If unspecified, inertia will be computed as per *body.computeInertiaFromShapes()*.
			 * @param {Boolean} [params.sleeping] Define if the body is to be created in a sleeping state. When added to a World object, the body will remain asleep until woken. Defaults to *false*.
			 * @param {Boolean} [params.bullet] Define if a *dynamic* body should collide continuously with other *dynamic* bodies. Continuous collision occur always between static/kinematic and dynamic bodies, but will occur between two dynamic bodies only if at least one of them is marked as a *bullet*. Due to implementation details of continuous collisions, you are advised not to create groups of bodies that interact together as bullets which may lead to visual stalling.
			 * @param {Array} [params.position] The position of the body’s origin in world coordinates. The position of a *static* body cannot be changed once it has been assigned to a World object, and modifications to this value equate to a teleportation of the body. *kinematic* bodies should be moved via manipulations of the body *velocity*. Defaults to *[0, 0]*.
			 * @param {Number} [params.rotation] The rotation of the body in clockwise radians. The rotation of a *static* body cannot be changed once it has been assigned to a World object, and modifications to this value equate to a teleportation of the body. *kinematic* bodies should be rotated via manipulations of the body *angularVelocity*. Defaults to *0*.
			 * @param {Array} [params.velocity] The linear velocity of the body in *m/s*. This parameter is ignored for *static* bodies which are not permitted to have a velocity. Defaults to *[0, 0]*.
			 * @param {Array} [params.angularVelocity] The angular velocity of the body in *rad/s*. This parameter is ignored for *static* bodies which are not permitted to have a velocity. Defaults to *[0, 0]*.
			 * @param {Array} [params.force] Force applied to the body at it’s origin for every update. As this is a force, and not an acceleration this property has no effect on *static* and *kinematic* bodies, or any *dynamic* body with infinite mass. This force is persistent, and is not reset after world update. Defaults to *[0, 0]*.
			 * @param {Array} [params.torque] Torque applied to the body at it’s origin for every update. As this is a torque, and not an acceleration this property has no effect on *static* and *kinematic* bodies, or any *dynamic* body with infinite inertia. This torque is persistent, and is not reset after world update. Defaults to *[0, 0]*.
			 * @param {Number} [params.linearDrag] The fraction of the linear velocity of a body which will be lost per second. This value must be >= 0. This property has no effect on *static* and *kinematic* bodies, or any *dynamic* body with infinite mass. Defaults to *0.05*.
			 * @param {Number} [params.angularDrag] The fraction of the angular velocity of a body which will be lost per second. This value must be >= 0. This property has no effect on *static* and *kinematic* bodies, or any *dynamic* body with infinite inertia. Defaults to *0.05*.
			 * @param {Array} [params.surfaceVelocity] An additional velocity in (*m/s*) used for contact physics and rotated to match the surface direction used to manipulate the effects of friction and normal reactions. Static objects may also be given a surface velocity. For example one may create a conveyor belt that moves objects pushed against in a clockwise direction by supplying a surface velocity with positive x-component. Defaults to *[0, 0]*.
			 * @param {Object} [params.userData] Field on which to store whatever information you may like.

			 * @returns {params}
			 */
			createRigidBody: function( params ) {
				return Physics2DRigidBody.create( params )
			},

			createMaterial: function( params ) {
				return Physics2DMaterial.create( params )
			},

			createCollisionUtils: function () {
				return Physics2DCollisionUtils.create()
			},

			createSweepAndPruneBroadphase: function () {
				return Physics2DSweepAndPrune.create()
			},

			createBoxTreeBroadphase: function () {
				return Physics2DBoxTreeBroadphase.create()
			},

			createPointConstraint: function( params ) {
				return Physics2DPointConstraint.create( params )
			},

			createWeldConstraint: function( params ) {
				return Physics2DWeldConstraint.create( params )
			},

			createAngleConstraint: function( params ) {
				return Physics2DAngleConstraint.create( params );
			},

			createDistanceConstraint: function( params ) {
				return Physics2DDistanceConstraint.create( params )
			},

			createLineConstraint: function( params ) {
				return Physics2DLineConstraint.create( params )
			},

			createMotorConstraint: function( params ) {
				return Physics2DMotorConstraint.create( params )
			},

			createPulleyConstraint: function( params ) {
				return Physics2DPulleyConstraint.create( params )
			},

			createCustomConstraint: function( params ) {
				return Physics2DCustomConstraint.create( params )
			},

			setDebugDrawOptions  : function( params ) {
				this.debugDraw.showConstraints     = params.showConstraints
				this.debugDraw.showContacts        = params.showContacts
				this.debugDraw.showContactImpulses = params.showContactImpulses
				this.debugDraw.showRigidBodies     = params.showRigidBodies
				this.debugDraw.showColliderShapes  = params.showColliderShapes
				this.debugDraw.showSensorShapes    = params.showSensorShapes
				this.debugDraw.showBodyDetail      = params.showBodyDetail
				this.debugDraw.showShapeDetail     = params.showShapeDetail

				this.debug = (
					params.showConstraints ||
					params.showContacts ||
					params.showContactImpulses ||
					params.showRigidBodies ||
					params.showColliderShapes ||
					params.showSensorShapes ||
					params.showBodyDetail ||
					params.showShapeDetail
				)
			},

			debugDrawHook : function( renderingContext, viewport ) {
				if( !this.debug == true )
					return

				this.debugDraw.renderingContext = renderingContext
				this.debugDraw.begin()
				this.debugDraw.drawWorld( this.rawWorld, viewport )
				this.debugDraw.end()

			},

            setBodyType : function( id, type ) {
                var body = getBodyById( id )
                if( !body ) return

                if( type === this.BODY_TYPE_STATIC && !body.isStatic() ) {
                    body.setAsStatic()

                } else if( type === this.BODY_TYPE_DYNAMIC && !body.isDynamic() ) {
                    body.setAsDynamic()

                } else if( type === this.BODY_TYPE_KINEMATIC && !body.isKinematic() ) {
                    body.setAsKinematic()
                }
            },

			createWorld   : createWorld,

			getWorld      : getWorld,

			step          : step,

			clear         : clear,

            putToSleep    : putToSleep,

            wakeUp        : wakeUp,

			applyForce    : applyForce,

			setAngularVelocity: setAngularVelocity,

			getAngularVelocity: getAngularVelocity,

			getSurfaceVelocity: getSurfaceVelocity,

			setSurfaceVelocity: setSurfaceVelocity,

			applyImpulse  : applyImpulse,

			setTorque     : setTorque,

			createBodyDef : createBodyDef,

			destroyBody   : destroyBody,

			setFilterData : setFilterData,

			setPosition   : setPosition,

			getPosition   : getPosition,

			setVelocity   : setVelocity,

			setVelocityX  : setVelocityX,

			setVelocityY  : setVelocityY,

			getVelocity   : getVelocity,

			setRotation   : setRotation,

			getRotation   : getRotation
		}

		return PhysicsManager
	}
)

/*



*/