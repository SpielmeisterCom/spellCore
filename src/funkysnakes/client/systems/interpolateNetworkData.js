define(
	"funkysnakes/client/systems/interpolateNetworkData",
	[
		"funkysnakes/shared/config/constants",

		"spell/shared/util/network/snapshots",
		"spell/shared/util/math",

		"spell/math/vec3",
		'spell/shared/util/platform/underscore'
	],
	function(
		constants,

		snapshots,
		math,

		vec3,
		_
	) {
		"use strict"


		return function(
			timeInMilliseconds,
			entitiesToInterpolate,
			entityManager
		) {
			var renderTime = timeInMilliseconds - constants.interpolationDelay

			_.each( entitiesToInterpolate, function( entity ) {
				var entitySnapshots = entity.synchronizationSlave.snapshots

				snapshots.forwardTo( entitySnapshots, renderTime )
				var current = snapshots.current( entitySnapshots )
				var next    = snapshots.next( entitySnapshots )

				if( current !== undefined &&
					next !== undefined ) {

					var alpha = math.clamp( ( renderTime - current.time ) / ( next.time - current.time ), 0.0, 1.0 )

					if ( current.data.entity.hasOwnProperty( "position" ) ) {
						var beforePosition = current.data.entity[ "position" ]
						var afterPosition  = next.data.entity[ "position" ]
						var position       = [ 0, 0, 0 ]
						vec3.lerp( beforePosition, afterPosition, alpha, position )

						entityManager.addComponent( entity, "position", [ position ] )
					}

					if ( current.data.entity.hasOwnProperty( "orientation" ) ) {
						var beforeOrientation = current.data.entity[ "orientation" ].angle
						var afterOrientation  = next.data.entity[ "orientation" ].angle
						var orientation       = beforeOrientation + alpha * ( afterOrientation - beforeOrientation )

						entity.orientation.angle = orientation
					}

					if ( current.data.entity.hasOwnProperty( "collisionCircle" ) ) {
						entityManager.addComponent( entity, "collisionCircle", [ current.data.entity[ "collisionCircle" ].radius ] )
					}

					// shield
					if( current.data.entity.hasOwnProperty( "shield" ) ) {
						var lifetime

						if( next.data.entity.hasOwnProperty( "shield" ) ) {
							lifetime = current.data.entity.shield.lifetime +
								( next.data.entity.shield.lifetime - current.data.entity.shield.lifetime ) * alpha
						}

						entityManager.addComponent(
							entity,
							"shield",
							[ {
								state:    current.data.entity.shield.state,
								lifetime: lifetime
							} ]
						)
					}

					// handle removal of shield component
					if( !next.data.entity.hasOwnProperty( "shield" ) &&
						current.data.entity.hasOwnProperty( "shield" ) ) {

						entityManager.removeComponent( entity, "shield" )
					}

					// amountTailElements
					if( current.data.entity.hasOwnProperty( "amountTailElements" ) ) {
						entity.amountTailElements.value = current.data.entity.amountTailElements.value
					}

					entity.activePowerups = current.data.entity[ "activePowerups" ]

				} else if( current !== undefined ) {
					entityManager.addComponent( entity, "position", [ current.data.entity[ "position" ] ] )
					entity.orientation = current.data.entity[ "orientation" ]
					entity.activePowerups = current.data.entity[ "activePowerups" ]

				} else if( next !== undefined ) {
					entityManager.addComponent( entity, "position", [ next.data.entity[ "position" ] ] )
					entity.orientation = next.data.entity[ "orientation" ]
					entity.activePowerups = next.data.entity[ "activePowerups" ]

					// tailElement
					if( next.data.entity.hasOwnProperty( "tailElement" ) &&
						!entity.hasOwnProperty( "tailElement" ) ) {

						entityManager.addComponent(
							entity,
							"tailElement",
							[ next.data.entity.tailElement ]
						)
					}
				}
			} )
		}
	}
)
