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

		var init = function( globals ) {
			this.inputManager.init()
		}

		var cleanUp = function( globals ) {}

		var processEvent = function( actors, inputDefinitions ) {
			var inputEvent = this

			_.each(
				inputDefinitions,
				function( inputDefinition ) {
					var actionId = _.find(
						inputDefinition.keyToAction,
						function( action, key ) {
							return keyCodes[ key ] === inputEvent.keyCode
						}
					)

					if( !actionId ) return


					var isExecuting = ( inputEvent.type === 'keydown' )

					_.each(
						actors,
						function( actor ) {
							var action = actor.actions[ actionId ]

							if( !action ||
								action.executing === isExecuting || // only changes in action state are interesting
								actor.id !== inputDefinition.actorId ) {

								return
							}

							action.executing = isExecuting
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
		 */
		var process = function( globals, timeInMs, deltaTimeInMs ) {
			_.invoke( this.inputEvents, processEvent, this.actors, this.inputDefinitions )

			this.inputEvents.length = 0
		}


		/**
		 * public
		 */

		var KeyInput = function( globals, actors, inputDefinitions ) {
			this.inputEvents      = globals.inputEvents
			this.inputManager     = globals.inputManager
			this.actors           = actors
			this.inputDefinitions = inputDefinitions
		}

		KeyInput.prototype = {
			cleanUp : cleanUp,
			init : init,
			process : process
		}

		return KeyInput
	}
)
