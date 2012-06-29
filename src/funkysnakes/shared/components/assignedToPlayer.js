define(
	"funkysnakes/shared/components/assignedToPlayer",
	function() {
		"use strict"


		/*
		 * playerId = -1 means entity is neutral
		 */
		return function( playerId ) {
			this.playerId = ( playerId !== undefined ? playerId : -1 )
		}
	}
)
