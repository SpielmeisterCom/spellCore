define(
	"funkysnakes/shared/systems/checkBorderCollision",
	[
		"funkysnakes/shared/config/constants",
		"spell/server/util/network/nextNetworkId",

		"spell/math/vec3",
		'spell/shared/util/platform/underscore'
	],
	function(
		constants,
		nextNetworkId,

		vec3,
		_
	) {
		"use strict"


		var leftBorder   = constants.left
		var rightBorder  = constants.right
		var topBorder    = constants.top
		var bottomBorder = constants.bottom


		var getContactInformation = function( positionOfCollisionCircle, radiusOfCollisionCircle ) {
			if( positionOfCollisionCircle[0] > rightBorder - radiusOfCollisionCircle ) {
				return {
					border: "right",
					normal: [ -1, 0, 0 ]
				}

			} else if( positionOfCollisionCircle[0] < leftBorder + radiusOfCollisionCircle ) {
				return {
					border: "left",
					normal: [ 1, 0, 0 ]
				}

			} else if( positionOfCollisionCircle[1] > topBorder - radiusOfCollisionCircle ) { // positive y is downwards
				return {
					border: "top",
					normal: [ 0, 1, 0 ]
				}

			} else if( positionOfCollisionCircle[1] < bottomBorder + radiusOfCollisionCircle ) { // positive y is downwards
				return {
					border: "bottom",
					normal: [ 0, -1, 0 ]
				}

			} else {
				return {
					border: "none"
				}
			}
		}

		var bounceBorder = function( contact, head ) {
			var direction = vec3.create( [
				Math.sin( head.orientation.angle ),
				-Math.cos( head.orientation.angle ),
				0
			] )

			vec3.reflect( direction, contact.normal )
			head.orientation.angle = Math.atan2( direction[ 0 ], -1 * direction[ 1 ] )
		}


		return function(
			timeInMs,
			heads,
			entityManager
		) {
			_.each( heads, function( head ) {
				var contact = getContactInformation( head.position, head.collisionCircle.radius )

				if( contact.border === "none" ) return


				if( head.hasOwnProperty( "shield" ) ) {
					bounceBorder( contact, head )
					head.shield.state = "activated"
					entityManager.createEntity(
						"effect",
						[ {
							networkId: nextNetworkId(),
							soundId: "fx/boing"
						} ]
					)

				} else {
					entityManager.removeComponent( head, "active" )
				}
			} )
		}
	}
)
