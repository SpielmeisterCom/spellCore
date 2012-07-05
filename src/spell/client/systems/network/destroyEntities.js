define(
	"spell/client/systems/network/destroyEntities",
	[
		"spell/shared/util/network/snapshots",

		'spell/functions'
	],
	function(
		snapshots,

		_
	) {
		"use strict"


		return function(
			timeInMilliseconds,
			interpolationDelay,
			directlyUpdatedEntities,
			interpolatedEntities,
			entityManager
		) {
			_.each( directlyUpdatedEntities, function( entity ) {
				entityManager.destroyEntity( entity )
			} )

			_.each( interpolatedEntities, function( entity ) {
				var renderTime     = timeInMilliseconds - interpolationDelay
				var latestSnapshot = snapshots.latest( entity.synchronizationSlave.snapshots )

				if (
					latestSnapshot === undefined ||
					renderTime > latestSnapshot.time
				) {
					entityManager.destroyEntity( entity )
				}
			} )
		}
	}
)
