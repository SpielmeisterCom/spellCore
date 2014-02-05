define(
	'spell/shared/util/physics/createPhysicsWorld',
	[
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		PlatformKit,

		_
	) {
		'use strict'


		var Physics            = PlatformKit.Physics.device,
            idToBody           = {}

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

        var step = function( deltaTimeInMs ) {
            this.rawWorld.step( deltaTimeInMs * 0.001 )
        }

		var PhysicsWorld = function( gravity, scale ) {
			if( !gravity ) gravity = [ 0, 0 ]
			if( !scale ) scale = 1

            //TODO: maybe usage of other broadphase object
			this.rawWorld = Physics.createWorld( {
                gravity : gravity
            });

			this.scale = scale
		}

        PhysicsWorld.prototype = {
            step          : step,
			applyForce    : applyForce,
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

		return function( gravity, scale ) {
			return new PhysicsWorld( gravity, scale )
		}
	}
)
