define(
	"funkysnakes/shared/systems/updateShields",
	[
		'spell/functions'
	],
	function(
		_
	) {
		"use strict"


		return function(
			dtInSeconds,
			heads,
			entityManager
		) {
			_.each( heads, function( head ) {
				if( head.shield.state != "activated" ) return


				head.shield.lifetime = head.shield.lifetime - dtInSeconds

				if( head.shield.lifetime < 0 ) {
					entityManager.removeComponent( head, "shield" )
				}
			} )
		}
	}
)
