define(
	'spell/system/keyInput',
	[
		'spell/shared/util/input/keyCodes',

		'spell/functions'
	],
	function(
		keyCodes,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var init = function( spell ) {
			this.inputManager.init()
		}

		var cleanUp = function( spell ) {}

		var processEvent = function( assets, actors, inputDefinitions ) {
			var inputEvent = this

			_.each(
				inputDefinitions,
				function( inputDefinition ) {
					var keyToActionMapAsset = assets[ inputDefinition.assetId ]
					if( !keyToActionMapAsset ) return

					var actionId = keyToActionMapAsset[ inputEvent.keyCode ]
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
		 * @param spell
		 * @param timeInMs
		 * @param deltaTimeInMs
		 */
		var process = function( spell, timeInMs, deltaTimeInMs ) {
			_.invoke( this.inputEvents, processEvent, this.assets, this.actors, this.inputDefinitions )

			this.inputEvents.length = 0
		}


		/**
		 * public
		 */

		var KeyInput = function( spell ) {
			this.assets       = spell.assets
			this.inputEvents  = spell.inputEvents
			this.inputManager = spell.inputManager
		}

		KeyInput.prototype = {
			cleanUp : cleanUp,
			init : init,
			process : process
		}

		return KeyInput
	}
)
