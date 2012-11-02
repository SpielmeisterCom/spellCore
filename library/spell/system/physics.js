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


		var Box2D          = PlatformKit.Box2D,
			b2Vec2         = Box2D.Common.Math.b2Vec2,
			b2World        = Box2D.Dynamics.b2World,
			b2FixtureDef   = Box2D.Dynamics.b2FixtureDef,
			b2Body         = Box2D.Dynamics.b2Body,
			b2BodyDef      = Box2D.Dynamics.b2BodyDef,
			b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
			b2CircleShape  = Box2D.Collision.Shapes.b2CircleShape

		var awakeColor      = [ 0.82, 0.76, 0.07 ],
			notAwakeColor   = [ 0.27, 0.25, 0.02 ],
			maxVelocity     = 20

		var getBodyById = function( world, entityId ) {
			for( var body = world.GetBodyList(); body; body = body.m_next ) {
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

		var createB2BodyDef = function( world, worldToPhysicsScale, entityId, body, transform ) {
			var translation = transform.translation,
				b2bodyDef   = new b2BodyDef

			b2bodyDef.fixedRotation = body.fixedRotation
			b2bodyDef.type          = body.type === 'dynamic' ? b2Body.b2_dynamicBody : b2Body.b2_staticBody
			b2bodyDef.position.x    = translation[ 0 ] * worldToPhysicsScale
			b2bodyDef.position.y    = translation[ 1 ] * worldToPhysicsScale
			b2bodyDef.userData      = entityId

			return world.CreateBody( b2bodyDef )
		}

		var addShape = function( world, worldToPhysicsScale, entityId, b2BodyDef, fixture, boxShape, circleShape, playerShape ) {
			var fixtureDef = new b2FixtureDef()

			fixtureDef.density     = fixture.density
			fixtureDef.friction    = fixture.friction
			fixtureDef.restitution = fixture.restitution

			if( boxShape ) {
				fixtureDef.shape = new b2PolygonShape()
				fixtureDef.shape.SetAsBox(
					boxShape.dimensions[ 0 ] / 2 * worldToPhysicsScale,
					boxShape.dimensions[ 1 ] / 2 * worldToPhysicsScale
				)

				b2BodyDef.CreateFixture( fixtureDef )

			} else if( circleShape ) {
				fixtureDef.shape = new b2CircleShape( circleShape.radius * worldToPhysicsScale )

				b2BodyDef.CreateFixture( fixtureDef )

			} else if( playerShape ) {
				var halfWidth  = playerShape.dimensions[ 0 ] / 2 * worldToPhysicsScale,
					halfHeight = playerShape.dimensions[ 1 ] / 2 * worldToPhysicsScale

				// main shape
				fixtureDef.shape = new b2PolygonShape()
				fixtureDef.shape.SetAsBox( halfWidth, halfHeight )

				b2BodyDef.CreateFixture( fixtureDef )

				// foot sensor shape
				var radius         = halfWidth,
					footFixtureDef = new b2FixtureDef()

//				footFixtureDef.density     = fixture.density
//				footFixtureDef.friction    = fixture.friction
//				footFixtureDef.restitution = fixture.restitution

				footFixtureDef.isSensor = true
				footFixtureDef.userData = { type : 'footSensor', id : entityId }
				footFixtureDef.shape = new b2CircleShape( radius )
				footFixtureDef.shape.SetLocalPosition( new b2Vec2( 0, -1 * halfHeight ) )

				b2BodyDef.CreateFixture( footFixtureDef )
			}
		}

		var createPhysicsObject = function( world, worldToPhysicsScale, entityId, body, fixture, boxShape, circleShape, playerShape, transform ) {
			var b2BodyDef = createB2BodyDef( world, worldToPhysicsScale, entityId, body, transform )

			addShape( world, worldToPhysicsScale, entityId, b2BodyDef, fixture, boxShape, circleShape, playerShape )
		}

		var simulate = function( world, deltaTimeInMs ) {
			world.Step( deltaTimeInMs / 1000, 10, 8 )
			world.ClearForces()
		}

		var transferState = function( world, worldToPhysicsScale, bodies, transforms ) {
			for( var b2Body = world.GetBodyList(); b2Body; b2Body = b2Body.m_next ) {
				var id = b2Body.GetUserData()

				if( !id ) continue

				var position  = b2Body.GetPosition(),
					transform = transforms[ id ]

				transform.translation[ 0 ] = position.x / worldToPhysicsScale
				transform.translation[ 1 ] = position.y / worldToPhysicsScale
				transform.rotation = b2Body.GetAngle() * -1

				var velocityVec2 = b2Body.GetLinearVelocity(),
					body         = bodies[ id ]

				body.velocity[ 0 ] = velocityVec2.x / worldToPhysicsScale
				body.velocity[ 1 ] = velocityVec2.y / worldToPhysicsScale
			}
		}

		var updateDebug = function( world, debugBoxes, debugCircles, transforms ) {
			for( var body = world.GetBodyList(); body; body = body.m_next ) {
				var id = body.GetUserData()

				if( !id ) continue

				var debugShape = debugBoxes[ id ] || debugCircles[ id ]

				debugShape.color = body.IsAwake() ? awakeColor : notAwakeColor
			}
		}

		var applyInfluence = function( entityManager, world, worldToPhysicsScale, applyForces, applyTorques, applyImpulses, applyVelocities, setPositions ) {
			for( var body = world.GetBodyList(); body; body = body.m_next ) {
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
							new b2Vec2( forceX, forceY ),
							applyForce.usePoint ?
								new b2Vec2( point[ 0 ] * worldToPhysicsScale, point[ 1 ] * worldToPhysicsScale ) :
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
							new b2Vec2( impulseX, impulseY ),
							applyImpulse.usePoint ?
								new b2Vec2( point[ 0 ] * worldToPhysicsScale, point[ 1 ] * worldToPhysicsScale ) :
								body.GetWorldCenter()
						)

						entityManager.removeComponent( id, 'spell.component.physics.applyImpulse' )
					}
				}

				// spell.component.physics.applyVelocity
				var velocity = applyVelocities[ id ]

				if( velocity ) {
					body.SetLinearVelocity(
						new b2Vec2(
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
						new b2Vec2(
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

			this.world = new b2World(
				new b2Vec2( this.config.gravity[ 0 ], this.config.gravity[ 1 ] ),
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
				updateDebug( world, this.debugBoxes, this.debugCircles, transforms )
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
