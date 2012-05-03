define(
	"funkysnakes/shared/components/head",
	function() {
		"use strict"


		return function( clientId ) {
			this.clientId   = clientId

			this.bonusCountdowns = []
			this.speedBonus      = 0

			this.invincibilityCountdown = 0
		}
	}
)
