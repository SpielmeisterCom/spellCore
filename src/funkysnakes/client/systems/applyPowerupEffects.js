define(
	"funkysnakes/client/systems/applyPowerupEffects",
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		"use strict"


		return function(
			heads
		) {
			_.each( heads, function( head ) {
				if ( head.activePowerups.speed === true ) {
					head.appearance.textureId = head.powerupEffects.speedTextureId
				}
				else if ( head.activePowerups.invincibility === true ) {
					head.appearance.textureId = head.powerupEffects.invincibilityTextureId
				}
				else {
					head.appearance.textureId = head.powerupEffects.baseTextureId
				}
			} )
		}
	}
)
