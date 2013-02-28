define(
	'spell/shared/util/physics/createBox2dWorld',
	[
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		PlatformKit,

		_
	) {
		'use strict'


		var Box2D              = PlatformKit.Box2D,
			createB2Vec2       = Box2D.Common.Math.createB2Vec2,
			createB2World      = Box2D.Dynamics.createB2World,
			b2Body             = Box2D.Dynamics.b2Body,
			createB2BodyDef    = Box2D.Dynamics.createB2BodyDef,
			createB2FilterData = Box2D.Dynamics.createB2FilterData,
			idToBody           = {}

		var getBodyById = function( entityId ) {
			return idToBody[ entityId ]
		}

		var applyForce = function( entityId, force, point ) {
			var body = this.getBodyById( entityId )
			if( !body ) return

			var scale  = this.scale,
				forceX = force[ 0 ] * scale,
				forceY = force[ 1 ] * scale

			if( forceX || forceY ) {
				body.ApplyForce(
					createB2Vec2( forceX, forceY ),
					point ?
						createB2Vec2( point[ 0 ] * scale, point[ 1 ] * scale ) :
						body.GetWorldCenter()
				)
			}
		}

		var applyTorque = function( entityId, torque ) {
			var body = this.getBodyById( entityId )
			if( !body ) return

			if( torque ) {
				body.ApplyTorque( torque * this.scale )
			}
		}

		var applyImpulse = function( entityId, impulse, point ) {
			var body = this.getBodyById( entityId )
			if( !body ) return

			var scale    = this.scale,
				impulseX = impulse[ 0 ] * scale,
				impulseY = impulse[ 1 ] * scale

			if( impulseX || impulseY ) {
				body.ApplyImpulse(
					createB2Vec2( impulseX, impulseY ),
					point ?
						createB2Vec2( point[ 0 ] * scale, point[ 1 ] * scale ) :
						body.GetWorldCenter()
				)
			}
		}

		var setVelocity = function( entityId, velocity ) {
			var body = this.getBodyById( entityId )
			if( !body ) return

			var scale = this.scale

			body.SetLinearVelocity(
				createB2Vec2( velocity[ 0 ] * scale, velocity[ 1 ] * scale )
			)
		}

		var setFilterData = function( entityId, categoryBits, maskBits ) {
			var body = this.getBodyById( entityId )
			if( !body ) return

			for( var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext() ) {
				var filterData    = fixture.GetFilterData(),
					newFilterData = createB2FilterData()

				newFilterData.categoryBits = categoryBits === undefined ?
					filterData.categoryBits :
					categoryBits

				newFilterData.maskBits = maskBits === undefined ?
					filterData.maskBits :
					maskBits

				fixture.SetFilterData( newFilterData )
			}
		}

		var setAwake = function( entityId, state ) {
			var body = this.getBodyById( entityId )
			if( !body ) return

			body.SetAwake( state )
		}

		var setPosition = function( entityId, position ) {
			var body = this.getBodyById( entityId )
			if( !body ) return

			var scale = this.scale

			body.SetPosition(
				createB2Vec2( position[ 0 ] * scale, position[ 1 ] * scale )
			)
		}

		var getBodyType = function( type ) {
			return type === 'static' ? b2Body.b2_staticBody :
				type === 'dynamic' ? b2Body.b2_dynamicBody :
					type === 'kinematic' ? b2Body.b2_kinematicBody :
						undefined
		}

		var isBodyTypeStatic = function( type ) {
			return type === 'static'
		}

		var createBodyDef = function( entityId, body, transform ) {
			var translation = transform.translation,
				bodyDef     = createB2BodyDef(),
				type        = getBodyType( body.type ),
				scale       = this.scale

			if( type === undefined ) return

			bodyDef.awake         = !isBodyTypeStatic( body.type )
			bodyDef.fixedRotation = body.fixedRotation
			bodyDef.type          = type
			bodyDef.position.x    = translation[ 0 ] * scale
			bodyDef.position.y    = translation[ 1 ] * scale
			bodyDef.angle         = transform.rotation
			bodyDef.userData      = entityId

			var body = this.rawWorld.CreateBody( bodyDef )

			idToBody[ entityId ] = body

			return body
		}

		var destroyBody = function( entityId ) {
			var body = this.getBodyById( entityId )
			if( !body ) return

			delete idToBody[ entityId ]

			this.rawWorld.DestroyBody( body )
		}

		var getRawWorld = function() {
			return this.rawWorld
		}

		var Box2dWorld = function( doSleep, gravity, scale ) {
			if( doSleep === undefined ) doSleep = true
			if( !gravity ) gravity = [ 0, 0 ]
			if( !scale ) scale = 1

			this.rawWorld = createB2World(
				createB2Vec2( gravity[ 0 ], gravity[ 1 ] ),
				doSleep
			)

			this.scale = scale
		}

		Box2dWorld.prototype = {
			applyForce    : applyForce,
			applyImpulse  : applyImpulse,
			applyTorque   : applyTorque,
			createBodyDef : createBodyDef,
			destroyBody   : destroyBody,
			getBodyById   : getBodyById,
			getRawWorld   : getRawWorld,
			setAwake      : setAwake,
			setFilterData : setFilterData,
			setPosition   : setPosition,
			setVelocity   : setVelocity
		}

		return function( doSleep, gravity, scale ) {
			return new Box2dWorld( doSleep, gravity, scale )
		}
	}
)
