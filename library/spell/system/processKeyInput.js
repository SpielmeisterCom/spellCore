define(
	'spell/system/processKeyInput',
	[
		'spell/Events'
	],
	function(
		Events
	) {
		'use strict'


		/**
		 * private
		 */

		var updateActors = function( actors, eventManager, entityManager, actorId, actionId, isExecuting ) {
			for( var id in actors ) {
				var actor  = actors[ id ],
					action = actor.actions[ actionId ]

				if( action &&
					actor.id === actorId &&
					action.executing !== isExecuting ) { // only changes in action state are interesting

					action.executing = isExecuting

					entityManager.triggerEvent( id, actionId + 'Action' + (isExecuting ? 'Started' : 'Stopped'))

					//TODO: remove legacy way to access action events: via global eventManager
					eventManager.publish(
						[ isExecuting ? Events.ACTION_STARTED : Events.ACTION_STOPPED, actionId ],
						[ id ]
					)
				}
			}
		}

		var processEvent = function( eventManager, entityManager, inputEvent, actors, inputDefinitions ) {
			for( var id in inputDefinitions ) {
				var inputDefinition     = inputDefinitions[ id ],
					keyToActionMapAsset = inputDefinition.asset,
					actionId            = keyToActionMapAsset[ inputEvent.keyCode ]

				if( actionId ) {
					var isExecuting = ( inputEvent.type === 'keydown' )

					updateActors( actors, eventManager, entityManager, inputDefinition.actorId, actionId, isExecuting )
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
				eventManager     = spell.eventManager,
				entityManager    = spell.entityManager,
				inputEvents      = spell.inputManager.getInputEvents(),
				inputDefinitions = this.inputDefinitions

			for( var i = 0, numInputEvents = inputEvents.length; i < numInputEvents; i++ ) {
				processEvent( eventManager, entityManager, inputEvents[ i ], actors, inputDefinitions )
			}
		}


		/**
		 * public
		 */

		var processKeyInput = function( spell ) {}

		processKeyInput.prototype = {
			init : function( spell ) {
				spell.inputManager.clearInputEvents()
			},
			destroy : function( spell ) {},
			activate : function( spell ) {},
			deactivate : function( spell ) {},
			process : process
		}

		return processKeyInput
	}
)
