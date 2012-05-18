define(
	'funkysnakes/server/systems/endGame',
	[
		'spell/shared/util/network/Messages',

		'spell/shared/util/platform/underscore'
	],
	function(
		Messages,

		_
	) {
		'use strict'


		return function(
			activeHeads,
			playerEntities,
			zoneManager,
			thisZone,
			clients
		) {
			if( _.size( activeHeads ) === 0 ) {
				var clientToPlayerId = {}

				if( _.size( clients ) > 0 ) {
					_.each(
						playerEntities,
						function( entity ) {
							clientToPlayerId[ entity.player.clientId ] = entity.player.playerId
						}
					)
				}

				zoneManager.destroyZone( thisZone, clientToPlayerId )
			}
		}
	}
)
