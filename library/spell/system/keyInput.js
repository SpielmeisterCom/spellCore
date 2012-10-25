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

		var updateActors = function( actors, actorId, actionId, isExecuting ) {
			for( var id in actors ) {
				var actor  = actors[ id ],
					action = actor.actions[ actionId ]

				if( action &&
					actor.id === actorId &&
					action.executing !== isExecuting ) { // only changes in action state are interesting

					action.executing = isExecuting
				}
			}
		}

		var processEvent = function( inputEvent, actors, inputDefinitions ) {
			for( var id in inputDefinitions ) {
				var inputDefinition     = inputDefinitions[ id ],
					keyToActionMapAsset = inputDefinition.asset,
					actionId            = keyToActionMapAsset[ inputEvent.keyCode ]

				if( actionId ) {
					var isExecuting = ( inputEvent.type === 'keydown' )

					updateActors( actors, inputDefinition.actorId, actionId, isExecuting )
				}
			}
		}

		/**
		 * Update the actor entities action component with the player input
		 *
		 * @param spell
		 * @param timeInMs
		 * @param deltaTimeInMs
		 */
		var process = function( spell, timeInMs, deltaTimeInMs ) {
			var actors           = this.actors,
				inputEvents      = this.inputEvents,
				inputDefinitions = this.inputDefinitions

			for( var i = 0, numInputEvents = this.inputEvents.length; i < numInputEvents; i++ ) {
				processEvent( inputEvents[ i ], actors, inputDefinitions )
			}

			inputEvents.length = 0
		}


		/**
		 * public
		 */

		var KeyInput = function( spell ) {
			this.inputEvents  = spell.inputEvents
			this.inputManager = spell.inputManager
		}

		KeyInput.prototype = {
			init : function( spell ) {
				this.inputManager.init()
			},
			destroy : function( spell ) {
				this.inputManager.destroy()
			},
			activate : function() {},
			deactivate : function() {},
			process : process
		}

		return KeyInput
	}
)
