define(
	'spell/system/box2D',
	[
		'spell/shared/util/Events',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		Events,
		PlatformKit,

		_
	) {
		'use strict'


		// private

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
			maxVelocity     = 10

		var isSphereShape = function( bodyDef ) {
			return !!bodyDef.radius
		}

		var getBodyById = function( world, entityId ) {
			for( var body = world.GetBodyList(); body; body = body.m_next ) {
				if( entityId === body.GetUserData() ) {
					return body
				}
			}
		}

		var createBody = function( spell, worldToPhysicsScale, debug, world, entityId, entity ) {
			var simpleBoxOrSphere = entity[ 'spell.component.box2d.simpleBox' ] || entity[ 'spell.component.box2d.simpleSphere' ],
				transform         = entity[ 'spell.component.2d.transform' ]

			if( !simpleBoxOrSphere || !transform ) return

			createBox2DBody( world, worldToPhysicsScale, entityId, simpleBoxOrSphere, transform )

			if( debug ) {
				var componentId,
					config

				if( isSphereShape( simpleBoxOrSphere ) ) {
					componentId = 'spell.component.2d.graphics.debug.circle'
					config = {
						radius : simpleBoxOrSphere.radius
					}

				} else {
					componentId = 'spell.component.2d.graphics.debug.box'
					config = {
						width : simpleBoxOrSphere.dimensions[ 0 ],
						height : simpleBoxOrSphere.dimensions[ 1 ]
					}
				}

				spell.entityManager.addComponent(
					entityId,
					{
						componentId : componentId,
						config : config
					}
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


		// public

		var init = function( spell ) {
			var doSleep = true

			this.world = new b2World(
				new b2Vec2(
					this.config.gravity[ 0 ] * this.worldToPhysicsScale,
					this.config.gravity[ 1 ] * this.worldToPhysicsScale
				),
				doSleep
			)
		}

		var activate = function( spell ) {
			this.entityCreatedHandler = _.bind( createBody, null, spell, this.worldToPhysicsScale, this.debug, this.world )
			this.entityDestroyHandler = _.bind( this.removedEntities.push, this.removedEntities )

			spell.eventManager.subscribe( Events.ENTITY_CREATED, this.entityCreatedHandler )
			spell.eventManager.subscribe( Events.ENTITY_DESTROYED, this.entityDestroyHandler )
		}

		var deactivate = function( spell ) {
			spell.eventManager.unsubscribe( Events.ENTITY_CREATED, this.entityCreatedHandler )
			spell.eventManager.unsubscribe( Events.ENTITY_DESTROYED, this.entityDestroyHandler )
		}

		var createBox2DBody = function( world, worldToPhysicsScale, entityId, simpleBoxOrSphere, transform ) {
			// fixture
			var b2fixtureDef = new b2FixtureDef

			b2fixtureDef.density     = simpleBoxOrSphere.density
			b2fixtureDef.friction    = simpleBoxOrSphere.friction
			b2fixtureDef.restitution = simpleBoxOrSphere.restitution

			if( isSphereShape( simpleBoxOrSphere ) ) {
				b2fixtureDef.shape = new b2CircleShape( simpleBoxOrSphere.radius * worldToPhysicsScale )

			} else {
				b2fixtureDef.shape = new b2PolygonShape
				b2fixtureDef.shape.SetAsBox(
					simpleBoxOrSphere.dimensions[ 0 ] / 2 * worldToPhysicsScale,
					simpleBoxOrSphere.dimensions[ 1 ] / 2 * worldToPhysicsScale
				)
			}

			// body
			var translation = transform.translation,
				b2bodyDef   = new b2BodyDef

			b2bodyDef.fixedRotation = simpleBoxOrSphere.fixedRotation
			b2bodyDef.type          = simpleBoxOrSphere.type === 'dynamic' ? b2Body.b2_dynamicBody : b2Body.b2_staticBody
			b2bodyDef.position.x    = translation[ 0 ] * worldToPhysicsScale
			b2bodyDef.position.y    = translation[ 1 ] * worldToPhysicsScale
			b2bodyDef.userData      = entityId

			world.CreateBody( b2bodyDef ).CreateFixture( b2fixtureDef )
		}

		var simulate = function( world, deltaTimeInMs ) {
			world.Step( deltaTimeInMs / 1000, 10, 8 )
			world.ClearForces()
		}

		var transferState = function( world, worldToPhysicsScale, transforms ) {
			for( var body = world.GetBodyList(); body; body = body.m_next ) {
				var id = body.GetUserData()

				if( !id ) continue

				var position  = body.GetPosition(),
					transform = transforms[ id ]

				transform.translation[ 0 ] = position.x / worldToPhysicsScale
				transform.translation[ 1 ] = position.y / worldToPhysicsScale
				transform.rotation = body.GetAngle() * -1
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

				// spell.component.box2d.applyForce
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
								new b2Vec2( point[ 0 ], point[ 1 ] ) :
								body.GetWorldCenter()
						)
					}
				}

				// spell.component.box2d.applyTorque
				var applyTorque = applyTorques[ id ]

				if( applyTorque ) {
					var torque = applyTorque.torque * worldToPhysicsScale

					if( torque ) {
						body.ApplyTorque( torque )
					}
				}

				// spell.component.box2d.applyImpulse
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
								new b2Vec2( point[ 0 ], point[ 1 ] ) :
								body.GetWorldCenter()
						)

						entityManager.removeComponent( id, 'spell.component.box2d.applyImpulse' )
					}
				}

				// spell.component.box2d.applyVelocity
				var velocity = applyVelocities[ id ]

				if( velocity ) {
					body.SetLinearVelocity(
						new b2Vec2(
							velocity.velocity[ 0 ] * worldToPhysicsScale,
							velocity.velocity[ 1 ] * worldToPhysicsScale
						)
					)

					entityManager.removeComponent( id, 'spell.component.box2d.applyVelocity' )
				}

				// spell.component.box2d.setPosition
				var setPosition = setPositions[ id ]

				if( setPosition ) {
					body.SetPosition(
						new b2Vec2(
							setPosition.value[ 0 ] * worldToPhysicsScale,
							setPosition.value[ 1 ] * worldToPhysicsScale
						)
					)

					entityManager.removeComponent( id, 'spell.component.box2d.setPosition' )
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

		var process = function( spell, timeInMs, deltaTimeInMs ) {
			var world               = this.world,
				transforms          = this.transforms,
				removedEntities     = this.removedEntities,
				worldToPhysicsScale = this.worldToPhysicsScale

			if( removedEntities.length ) {
				destroyBodies( world, removedEntities )
				removedEntities.length = 0
			}

			applyInfluence( spell.entityManager, world, worldToPhysicsScale, this.applyForces, this.applyTorques, this.applyImpulses, this.applyVelocities, this.setPositions )
			simulate( world, deltaTimeInMs )
			transferState( world, worldToPhysicsScale, transforms )

			if( this.debug ) {
				updateDebug( world, this.debugBoxes, this.debugCircles, transforms )
			}
		}

		var Box2DSystem = function( spell ) {
			this.debug = !!spell.configurationManager.debug
			this.entityCreatedHandler
			this.entityDestroyHandler
			this.removedEntities = []
			this.world
			this.worldToPhysicsScale = this.config.scale
		}

		Box2DSystem.prototype = {
			init : init,
			destroy : function() {},
			activate : activate,
			deactivate : deactivate,
			process : process
		}

		return Box2DSystem
	}
)
