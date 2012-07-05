define(
	'spell/server/systems/network/sendEntityUpdate',
	[
		'spell/shared/util/network/Messages',

		'spell/functions'
	],
	function(
		Messages,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var createFullStateData = function( timeInMs, entities ) {
			var createdEntities = _.reduce(
				entities,
				function( memo, iter ) {
					memo.push( {
						type : iter.type,
						args : iter.args
					} )

					return memo
				},
				[]
			)

			return {
				time              : timeInMs,
				createdEntities   : createdEntities,
				destroyedEntities : [],
				updatedEntities   : []
			}
		}

		var createDeltaStateData = function( timeInMs, synchronizedEntities, createdEntities, destroyedEntities ) {
			var updatedEntities      = [],
				entityGroups         = {},
				nextEntityGroupIndex = 0

			_.each( synchronizedEntities, function( entity ) {
				var lastSentSnapshot = entity.synchronizationMaster.lastSentSnapshot

				if( lastSentSnapshot === null ||
					( entity.synchronizationMaster.resendData !== null &&
					  entity.synchronizationMaster.resendData( entity, lastSentSnapshot ) ) ) {

					var entityGroupId = ''
					var snapshot = {
						id: entity.synchronizationMaster.id
					}

					_.each( entity.synchronizationMaster.components, function( componentType ) {
						if( !entity.hasOwnProperty( componentType ) ) return


						entityGroupId += componentType + ','
						snapshot[ componentType ] = entity[ componentType ]
					} )

					if ( !entityGroups.hasOwnProperty( entityGroupId ) ) {
						entityGroups[ entityGroupId ] = nextEntityGroupIndex
						updatedEntities[ nextEntityGroupIndex ] = []
						nextEntityGroupIndex += 1
					}

					updatedEntities[ entityGroups[ entityGroupId ] ].push( snapshot )
					entity.synchronizationMaster.lastSentSnapshot = snapshot
				}
			} )

			return {
				time              : timeInMs,
				createdEntities   : createdEntities,
				destroyedEntities : destroyedEntities,
				updatedEntities   : updatedEntities
			}
		}


		/*
		 * public
		 */

		return function(
			timeInMs,
			playerEntities,
			synchronizedEntities,
			networkListener,
			clients
		) {
			var stateData = createDeltaStateData(
				timeInMs,
				synchronizedEntities,
				networkListener.createdEntities,
				networkListener.destroyedEntities
			)

			_.each(
				clients,
				function( client ) {
					if( client.isPristine ) {
						client.send( Messages.DELTA_STATE_UPDATE, createFullStateData( timeInMs, synchronizedEntities ) )
						client.isPristine = false

					} else {
						client.send( Messages.DELTA_STATE_UPDATE, stateData )
					}
				}
			)

			networkListener.createdEntities   = []
			networkListener.destroyedEntities = []
		}
	}
)
