define(
	'funkysnakes/shared/systems/spawnPowerup',
	[
		'funkysnakes/shared/config/constants',

		'spell/server/util/network/nextNetworkId',
		'spell/shared/util/random/XorShift32',

		'underscore'
	],
	function(
		constants,

		nextNetworkId,
		XorShift32,

		_
	) {
		'use strict'


		var spawnProbability = 0.015

		var powerupProbability = {
			speedPowerup:         9,
//			invincibilityPowerup: 5,
			shieldPowerup:        1
		}


		var totalPoints = 0
		var probabilityLookup = {}
		_.each( powerupProbability, function( points, powerup ) {
			probabilityLookup[ powerup ] = { min: totalPoints, max: totalPoints + points - 1 }
			totalPoints += points
		} )


		var left   = constants.left
		var right  = constants.right
		var top    = constants.top
		var bottom = constants.bottom

		var padding = 20
		var prng = new XorShift32( Math.round( Math.random() * Math.pow( 2, 32 ) ) )


		return function( entityManager ) {
			if( spawnProbability > prng.next() ) {
				var x = prng.nextBetween( left + padding, right - padding ),
					y = prng.nextBetween( bottom + padding, top - padding )

				var powerupNumber = Math.floor( prng.next() * totalPoints )

				_.each(
					probabilityLookup,
					function( lookup, powerup ) {
						if (
							powerupNumber >= lookup.min &&
							powerupNumber <= lookup.max
						) {
							var type

							if( powerup === 'speedPowerup' ) {
								type = 'speed'

							} else if( powerup === 'invincibilityPowerup' ) {
								type = 'invincibility'

							} else if( powerup === 'shieldPowerup' ) {
								type = 'shield'
							}


							entityManager.createEntity(
								powerup,
								[ {
									type:      type,
									position:  [ x, y, 0 ],
									networkId: nextNetworkId()
								} ]
							)
						}
					}
				)
			}
		}
	}
)
