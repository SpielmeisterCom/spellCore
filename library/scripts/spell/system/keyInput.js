define(
	'spell/system/keyInput',
	[
		'spell/shared/util/input/keyCodes',

		'spell/shared/util/platform/underscore'
	],
	function(
		keyCodes,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var actorComponentId           = 'spell.component.core.actor',
			inputDefinitionComponentId = 'spell.component.core.inputDefinition'

		var init = function( globals ) {
			this.inputManager.init()
		}

		var cleanUp = function( globals ) {}

		var processEvent = function( inputDefinitionEntities, actorEntities, inputEvent ) {
			_.each(
				inputDefinitionEntities,
				function( definition ) {
					var inputDefinition = definition[ inputDefinitionComponentId ]

					var actionId = _.find(
						inputDefinition.keyToAction,
						function( action, key ) {
							return keyCodes[ key ] === inputEvent.keyCode
						}
					)

					if( !actionId ) return


					var isExecuting = ( inputEvent.type === 'keydown' )

					_.each(
						actorEntities,
						function( actorEntity ) {
							var actor = actorEntity[ actorComponentId ],
								action = actor.actions[ actionId ]

							if( !action ||
								action.executing === isExecuting || // only changes in action state are interesting
								actor.id !== inputDefinition.actorId ) {

								return
							}


							action.executing = isExecuting

							console.log( actorEntity )
						}
					)
				}
			)
		}

		/**
		 * Update the actor entities action component with the player input
		 *
		 * @param globals
		 * @param timeInMs
		 * @param deltaTimeInMs
		 * @param inputDefinitionEntities
		 * @param actorEntities
		 */
		var process = function( globals, timeInMs, deltaTimeInMs, inputDefinitionEntities, actorEntities ) {
			_.each(
				this.inputEvents,
				function( inputEvent ) {
					processEvent( inputDefinitionEntities, actorEntities, inputEvent )
				}
			)

			this.inputEvents.length = 0
		}


		/**
		 * public
		 */

		var KeyInput = function( globals ) {
			this.inputEvents  = globals.inputEvents
			this.inputManager = globals.inputManager
		}

		KeyInput.prototype = {
			cleanUp : cleanUp,
			init : init,
			process : process
		}

		return KeyInput
	}
)
