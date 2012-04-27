define(
	"spell/client/systems/network/processEntityUpdates",
	[
		"spell/shared/util/network/Messages",
		"spell/shared/util/network/snapshots",

		"underscore"
	],
	function(
		Messages,
		snapshots,

		_
	) {
		"use strict"


		return function(
			synchronizedEntities,
			entityManager,
			incomingMessages
		) {
			var deltaStateUpdates = incomingMessages[ Messages.DELTA_STATE_UPDATE ]

			while( deltaStateUpdates !== undefined && deltaStateUpdates.length > 0 ) {
				var stateUpdate = deltaStateUpdates.shift()

				_.each(
					stateUpdate.createdEntities,
					function( createdEntity ) {
						entityManager.createEntity( createdEntity.type, createdEntity.args )
					}
				)

				_.each( stateUpdate.destroyedEntities, function( entityId ) {
					var entityToDestroy = synchronizedEntities[ entityId ]
					entityManager.addComponent( entityToDestroy, "markedForDestruction" )
				} )

				_.each( stateUpdate.updatedEntities, function( entityGroup ) {
					_.each( entityGroup, function( updatedEntity ) {
						if( !synchronizedEntities.hasOwnProperty( updatedEntity.id ) ) {
							throw "Unknown synchronized entity. Id: " + updatedEntity.id
						}

						var entity = synchronizedEntities[ updatedEntity.id ]
						delete updatedEntity.id

						var entitySnapshots = entity.synchronizationSlave.snapshots
						snapshots.add( entitySnapshots, stateUpdate.time, {
							entity : updatedEntity
						} )
					} )
				} )
			}
		}
	}
)
