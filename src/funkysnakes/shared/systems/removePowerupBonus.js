define(
	"funkysnakes/shared/systems/removePowerupBonus",
	[
		"funkysnakes/shared/config/constants",

		'spell/functions'
	],
	function(
		constants,

		_
	) {
		"use strict"


		return function(
			deltaTimeInS,
			heads
		) {
			_.each( heads, function( head ) {
				// speed bonus
				var bonusCountdowns = head.head.bonusCountdowns

				bonusCountdowns = _.map( bonusCountdowns, function( countdown ) {
					return countdown - deltaTimeInS
				} )
				_.each( bonusCountdowns, function( countdown ) {
					if ( countdown <= 0 ) {
						head.head.speedBonus -= constants.speedPowerupBonus
					}
				} )
				bonusCountdowns = _.filter( bonusCountdowns, function( countdown ) {
					return countdown > 0
				} )

				head.head.bonusCountdowns = bonusCountdowns

				if ( bonusCountdowns.length === 0 ) {
					head.activePowerups[ "speed" ] = false
				}


				// invincibility bonus
				if ( head.head.invincibilityCountdown > 0 ) {
					head.head.invincibilityCountdown -= deltaTimeInS
					head.head.invincibilityCountdown = Math.max( head.head.invincibilityCountdown, 0 )

					if ( head.head.invincibilityCountdown === 0 ) {
						head.activePowerups[ "invincibility" ] = false
					}
				}
			} )
		}
	}
)
