define(
	'spell/system/physics',
	[
		'spell/Defines',
		'spell/shared/util/Events',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		Defines,
		Events,
		PlatformKit,

		_
	) {
		'use strict'


		var Box2D                 = PlatformKit.Box2D,
			createB2Vec2          = Box2D.Common.Math.createB2Vec2,
			createB2World         = Box2D.Dynamics.createB2World,
			createB2FixtureDef    = Box2D.Dynamics.createB2FixtureDef,
			createB2Body          = Box2D.Dynamics.createB2Body,
			b2Body                = Box2D.Dynamics.b2Body,
			createB2BodyDef       = Box2D.Dynamics.createB2BodyDef,
			createB2PolygonShape  = Box2D.Collision.Shapes.createB2PolygonShape,
			createB2CircleShape   = Box2D.Collision.Shapes.createB2CircleShape

		var awakeColor      = [ 0.82, 0.76, 0.07 ],
			notAwakeColor   = [ 0.27, 0.25, 0.02 ],
			maxVelocity     = 20

		var getBodyById = function( world, entityId ) {
			for( var body = world.GetBodyList(); body; body = body.GetNext() ) {
				if( entityId === body.GetUserData() ) {
					return body
				}
			}
		}

		var createBody = function( spell, worldToPhysicsScale, debug, world, entityId, entity ) {
			var body        = entity[ Defines.PHYSICS_BODY_COMPONENT_ID ],
				fixture     = entity[ Defines.PHYSICS_FIXTURE_COMPONENT_ID ],
				boxShape    = entity[ Defines.PHYSICS_BOX_SHAPE_COMPONENT_ID ],
				circleShape = entity[ Defines.PHYSICS_CIRCLE_SHAPE_COMPONENT_ID ],
				playerShape = entity[ Defines.PHYSICS_JNRPLAYER_SHAPE_COMPONENT_ID ],
				transform   = entity[ Defines.TRANSFORM_COMPONENT_ID ]

			if( !body || !fixture || !transform ||
				( !boxShape && !circleShape && !playerShape ) ) {

				return
			}

			createPhysicsObject( world, worldToPhysicsScale, entityId, body, fixture, boxShape, circleShape, playerShape, transform )

			if( debug ) {
				var componentId,
					config

				if( circleShape ) {
					componentId = 'spell.component.2d.graphics.debug.circle'
					config = {
						radius : circleShape.radius
					}

				} else {
					var boxesqueShape = boxShape || playerShape

					componentId = 'spell.component.2d.graphics.debug.box'
					config = {
						width : boxesqueShape.dimensions[ 0 ],
						height : boxesqueShape.dimensions[ 1 ]
					}
				}

				spell.entityManager.addComponent(
					entityId,
					componentId,
					config
				)
			}
		}

		var destroyBodies = function( world, destroyedEntities ) {
			for( var i = 0, numDestroyedEntities = destroyedEntities.length; i < numDestroyedEntities; i++ ) {
				var body = getBodyById( world, destroyedEntities[ i ] )

				if( !body ) continue

				world.DestroyBody( body )
			}
		}

		var createBodyDef = function( world, worldToPhysicsScale, entityId, body, transform ) {
			var translation = transform.translation,
				bodyDef     = createB2BodyDef()

			bodyDef.fixedRotation = body.fixedRotation
			bodyDef.type          = body.type === 'dynamic' ? b2Body.b2_dynamicBody : b2Body.b2_staticBody
			bodyDef.position.x    = translation[ 0 ] * worldToPhysicsScale
			bodyDef.position.y    = translation[ 1 ] * worldToPhysicsScale
			bodyDef.userData      = entityId

			return world.CreateBody( bodyDef )
		}

		var addShape = function( world, worldToPhysicsScale, entityId, bodyDef, fixture, boxShape, circleShape, playerShape ) {
			var fixtureDef = createB2FixtureDef()

			fixtureDef.density     = fixture.density
			fixtureDef.friction    = fixture.friction
			fixtureDef.restitution = fixture.restitution

			if( boxShape ) {
				fixtureDef.shape = createB2PolygonShape()
				fixtureDef.shape.SetAsBox(
					boxShape.dimensions[ 0 ] / 2 * worldToPhysicsScale,
					boxShape.dimensions[ 1 ] / 2 * worldToPhysicsScale
				)

				bodyDef.CreateFixture( fixtureDef )

			} else if( circleShape ) {
				fixtureDef.shape = createB2CircleShape( circleShape.radius * worldToPhysicsScale )

				bodyDef.CreateFixture( fixtureDef )

			} else if( playerShape ) {
				var halfWidth  = playerShape.dimensions[ 0 ] / 2 * worldToPhysicsScale,
					footRadius = halfWidth,
					halfHeight = playerShape.dimensions[ 1 ] / 2 * worldToPhysicsScale - footRadius

				// main shape
				fixtureDef.shape = createB2PolygonShape()
				fixtureDef.shape.SetAsBox( halfWidth, halfHeight - footRadius, createB2Vec2( 0, footRadius ) )

				bodyDef.CreateFixture( fixtureDef )

				// foot shape
				var footFixtureDef = createB2FixtureDef()

				footFixtureDef.density     = fixture.density / 2
				footFixtureDef.friction    = fixture.friction
				footFixtureDef.restitution = fixture.restitution
				footFixtureDef.shape       = createB2CircleShape( footRadius )
				footFixtureDef.shape.SetLocalPosition( createB2Vec2( 0, halfHeight * -1 ) )

				bodyDef.CreateFixture( footFixtureDef )

				// foot sensor shape
				var footSensorFixtureDef = createB2FixtureDef()

//				footSensorFixtureDef.density     = fixture.density
//				footSensorFixtureDef.friction    = fixture.friction
//				footSensorFixtureDef.restitution = fixture.restitution

				footSensorFixtureDef.isSensor = true
				footSensorFixtureDef.userData = { type : 'footSensor', id : entityId }
				footSensorFixtureDef.shape    = createB2CircleShape( footRadius * 1.1 )
				footSensorFixtureDef.shape.SetLocalPosition( createB2Vec2( 0, halfHeight * -1 ) )

				bodyDef.CreateFixture( footSensorFixtureDef )
			}
		}

		var createPhysicsObject = function( world, worldToPhysicsScale, entityId, body, fixture, boxShape, circleShape, playerShape, transform ) {
			var bodyDef = createBodyDef( world, worldToPhysicsScale, entityId, body, transform )

			addShape( world, worldToPhysicsScale, entityId, bodyDef, fixture, boxShape, circleShape, playerShape )
		}

		var simulate = function( world, deltaTimeInMs ) {
			world.Step( deltaTimeInMs / 1000, 10, 8 )
			world.ClearForces()
		}

		var transferState = function( world, worldToPhysicsScale, bodies, transforms ) {
			for( var body = world.GetBodyList(); body; body = body.GetNext() ) {
				var id = body.GetUserData()

				if( !id ) continue

				var position  = body.GetPosition(),
					transform = transforms[ id ]

				transform.translation[ 0 ] = position.x / worldToPhysicsScale
				transform.translation[ 1 ] = position.y / worldToPhysicsScale
				transform.rotation = body.GetAngle() * -1

				var velocityVec2  = body.GetLinearVelocity(),
					bodyComponent = bodies[ id ]

				bodyComponent.velocity[ 0 ] = velocityVec2.x / worldToPhysicsScale
				bodyComponent.velocity[ 1 ] = velocityVec2.y / worldToPhysicsScale
			}
		}

		var updateDebug = function( world, debugBoxes, debugCircles ) {
			for( var body = world.GetBodyList(); body; body = body.GetNext() ) {
				var id = body.GetUserData()

				if( !id ) continue

				var debugShape = debugBoxes[ id ] || debugCircles[ id ]

				debugShape.color = body.IsAwake() ? awakeColor : notAwakeColor
			}
		}

		var applyInfluence = function( entityManager, world, worldToPhysicsScale, applyForces, applyTorques, applyImpulses, applyVelocities, setPositions ) {
			for( var body = world.GetBodyList(); body; body = body.GetNext() ) {
				var id = body.GetUserData()

				if( !id ) continue

				// spell.component.physics.applyForce
				var applyForce = applyForces[ id ]

				if( applyForce ) {
					var force  = applyForce.force,
						forceX = force[ 0 ] * worldToPhysicsScale,
						forceY = force[ 1 ] * worldToPhysicsScale

					if( forceX || forceY ) {
						var point = applyForce.point

						body.ApplyForce(
							createB2Vec2( forceX, forceY ),
							applyForce.usePoint ?
								createB2Vec2( point[ 0 ] * worldToPhysicsScale, point[ 1 ] * worldToPhysicsScale ) :
								body.GetWorldCenter()
						)
					}
				}

				// spell.component.physics.applyTorque
				var applyTorque = applyTorques[ id ]

				if( applyTorque ) {
					var torque = applyTorque.torque * worldToPhysicsScale

					if( torque ) {
						body.ApplyTorque( torque )
					}
				}

				// spell.component.physics.applyImpulse
				var applyImpulse = applyImpulses[ id ]

				if( applyImpulse ) {
					var impulse  = applyImpulse.impulse,
						impulseX = impulse[ 0 ] * worldToPhysicsScale,
						impulseY = impulse[ 1 ] * worldToPhysicsScale

					if( impulseX || impulseY ) {
						var point = applyImpulse.point

						body.ApplyImpulse(
							createB2Vec2( impulseX, impulseY ),
							applyImpulse.usePoint ?
								createB2Vec2( point[ 0 ] * worldToPhysicsScale, point[ 1 ] * worldToPhysicsScale ) :
								body.GetWorldCenter()
						)

						entityManager.removeComponent( id, 'spell.component.physics.applyImpulse' )
					}
				}

				// spell.component.physics.applyVelocity
				var velocity = applyVelocities[ id ]

				if( velocity ) {
					body.SetLinearVelocity(
						createB2Vec2(
							velocity.velocity[ 0 ] * worldToPhysicsScale,
							velocity.velocity[ 1 ] * worldToPhysicsScale
						)
					)

					entityManager.removeComponent( id, 'spell.component.physics.applyVelocity' )
				}

				// spell.component.physics.setPosition
				var setPosition = setPositions[ id ]

				if( setPosition ) {
					body.SetPosition(
						createB2Vec2(
							setPosition.value[ 0 ] * worldToPhysicsScale,
							setPosition.value[ 1 ] * worldToPhysicsScale
						)
					)

					entityManager.removeComponent( id, 'spell.component.physics.setPosition' )
				}


				// check max velocity constraint
				var velocityVec2 = body.GetLinearVelocity(),
					velocity     = velocityVec2.Length()

				if( velocity > 0 && velocity >  maxVelocity ) {
					velocityVec2.x = maxVelocity / velocity * velocityVec2.x
					velocityVec2.y = maxVelocity / velocity * velocityVec2.y
					body.SetLinearVelocity( velocityVec2 )
				}
			}
		}

		var init = function( spell ) {
			var doSleep = true

			this.world = createB2World(
				createB2Vec2( this.config.gravity[ 0 ], this.config.gravity[ 1 ] ),
				doSleep
			)
		}

		var activate = function( spell ) {
			this.entityCreatedHandler = _.bind( createBody, null, spell, this.worldToPhysicsScale, this.debug, this.world )
			this.entityDestroyHandler = _.bind( this.removedEntitiesQueue.push, this.removedEntitiesQueue )

			spell.eventManager.subscribe( Events.ENTITY_CREATED, this.entityCreatedHandler )
			spell.eventManager.subscribe( Events.ENTITY_DESTROYED, this.entityDestroyHandler )
		}

		var deactivate = function( spell ) {
			spell.eventManager.unsubscribe( Events.ENTITY_CREATED, this.entityCreatedHandler )
			spell.eventManager.unsubscribe( Events.ENTITY_DESTROYED, this.entityDestroyHandler )
		}

		var process = function( spell, timeInMs, deltaTimeInMs ) {
			var world                = this.world,
				transforms           = this.transforms,
				removedEntitiesQueue = this.removedEntitiesQueue,
				worldToPhysicsScale  = this.worldToPhysicsScale

			if( removedEntitiesQueue.length ) {
				destroyBodies( world, removedEntitiesQueue )
				removedEntitiesQueue.length = 0
			}

			applyInfluence( spell.entityManager, world, worldToPhysicsScale, this.applyForces, this.applyTorques, this.applyImpulses, this.applyVelocities, this.setPositions )
			simulate( world, deltaTimeInMs )
			transferState( world, worldToPhysicsScale, this.bodies, transforms )

			if( this.debug ) {
				updateDebug( world, this.debugBoxes, this.debugCircles )
			}
		}

		var Physics = function( spell ) {
			this.debug = !!spell.configurationManager.debug
			this.entityCreatedHandler
			this.entityDestroyHandler
			this.world
			this.worldToPhysicsScale = this.config.scale
			this.removedEntitiesQueue = []
		}

		Physics.prototype = {
			init : init,
			destroy : function() {},
			activate : activate,
			deactivate : deactivate,
			process : process
		}

		return Physics
	}
)
