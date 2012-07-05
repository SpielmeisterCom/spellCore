define(
	"funkysnakes/client/systems/sendActorStateUpdate",
	[
		'spell/functions'
	],
	function(
		_
	) {
		"use strict"


		return function(
			connection,
			player
		) {
			var actions = player.actor.actions,
				actionIds = _.keys( actions ),
				actionStateChanges = []

			// This loop looks weird, but an in place update of "needSync" is required.
			for( var i = 0, length = actionIds.length; i < length; i++ ) {
				var actionId = actionIds[ i ],
					action   = actions[ actionId ]

				if( !action.needSync ) continue


				actionStateChanges.push( {
					id        : actionId,
					executing : action.executing
				} )

				action.needSync = false
			}

			if( actionStateChanges.length === 0 ) return


			connection.send( "actorStateUpdate", actionStateChanges )
		}
	}
)
