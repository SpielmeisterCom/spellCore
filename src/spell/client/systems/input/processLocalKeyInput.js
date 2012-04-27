define(
	"spell/client/systems/input/processLocalKeyInput",
	[
		"underscore"
	],
	function(
		_
	) {
		"use strict"


		return function(
			timeInMs,
			inputEvents,
			inputDefinitionEntities,
			actorEntities
		) {
			// update the actor entities action component with the player input
			_.each( inputEvents, function( event ) {
				_.each( inputDefinitionEntities, function( definition ) {
					var inputDefinition = definition.inputDefinition

					var keyCodeToAction = _.find( inputDefinition.keyCodeToActionMapping, function( keyCodeToAction ) {
						return keyCodeToAction.keyCode === event.keyCode
					} )

					if( !keyCodeToAction ) return


					var isExecuting = ( event.type === 'keydown' )

					_.each( actorEntities, function( actorEntity ) {
						var actor = actorEntity.actor,
							action = actor.actions[ keyCodeToAction.actionId ]

						if( !action ||
							action.executing === isExecuting || // only changes in action state are interesting
							actor.id !== inputDefinition.actorId ) {

							return
						}


						action.executing = isExecuting
						action.needSync  = true
					} )
				} )
			} )
		}
	}
)
