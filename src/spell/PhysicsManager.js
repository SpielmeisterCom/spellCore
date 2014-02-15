/**
 * @class spell.physicsManager
 * @singleton
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
		'spell/physics/2D/SweepAndPrune'
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
		Physics2DSweepAndPrune
	) {
		'use strict'


		var PhysicsManager = function() {
		}

		var idToBody           = {}


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

		var getVelocity = function( entityId ) {
			var body = getBodyById( entityId )
			if( !body ) return

			return body.getVelocity()
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

			body.setPosition([
				position[ 0 ],
				position[ 1 ]
			])
		}

		var getPosition = function( entityId ) {
			var body = getBodyById( entityId )
			if( !body ) return

			return body.getPosition()
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
			var translation = transform.translation,
				scale       = this.scale

			var physicsBody = Physics.createRigidBody({
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

		var getRawWorld = function() {
			return this.rawWorld
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

			createWorld   : createWorld,

			getWorld      : getWorld,

			step          : step,

			clear         : clear,

			applyForce    : applyForce,

			setAngularVelocity: setAngularVelocity,

			getAngularVelocity: getAngularVelocity,

			getSurfaceVelocity: getSurfaceVelocity,

			setSurfaceVelocity: setSurfaceVelocity,

			applyImpulse  : applyImpulse,

			setTorque     : setTorque,

			createBodyDef : createBodyDef,

			destroyBody   : destroyBody,

			getRawWorld   : getRawWorld,

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