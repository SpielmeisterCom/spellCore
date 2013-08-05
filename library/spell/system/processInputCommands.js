define(
	'spell/system/processInputCommands',
	[
		'spell/Defines',
		'spell/Events',

		'spell/functions'
	],
	function(
		Defines,
		Events,

		_
	) {
		'use strict'


		/**
		 * Forward commands to entities.
		 *
		 * @param spell
		 * @param timeInMs
		 * @param deltaTimeInMs
		 */
		var process = function( spell, timeInMs, deltaTimeInMs ) {
			var commands            = spell.inputManager.getCommands(),
				entityManager       = spell.entityManager,
				playerControlledIds = this.playerControlledIds

			for( var i = 0, n = commands.length; i < n; i++ ) {
				for( var j = 0, m = playerControlledIds.length; j < m; j++ ) {
					entityManager.triggerEvent( playerControlledIds[ j ], commands[ i ] )
				}
			}
		}

		var processKeyInput = function( spell ) {}

		processKeyInput.prototype = {
			init : function( spell ) {
				spell.inputManager.clearCommands()

				var playerControlledIds = this.playerControlledIds = []

				var processControllableComponentEvents = this.processControllableComponentEvents = function( component, entityId ) {
					if( component.controllerId !== 'player' ||
						_.contains( playerControlledIds, entityId ) ) {

						return
					}

					playerControlledIds.push( entityId )
				}

				spell.eventManager.subscribe( [ Events.COMPONENT_CREATED, Defines.CONTROLLABLE_COMPONENT_ID ], processControllableComponentEvents )
				spell.eventManager.subscribe( [ Events.COMPONENT_UPDATED, Defines.CONTROLLABLE_COMPONENT_ID ], processControllableComponentEvents )
			},
			destroy : function( spell ) {
				var processControllableComponentEvents = this.processControllableComponentEvents

				spell.eventManager.unsubscribe( [ Events.COMPONENT_CREATED, Defines.CONTROLLABLE_COMPONENT_ID ], processControllableComponentEvents )
				spell.eventManager.unsubscribe( [ Events.COMPONENT_UPDATED, Defines.CONTROLLABLE_COMPONENT_ID ], processControllableComponentEvents )
			},
			activate : function( spell ) {},
			deactivate : function( spell ) {},
			process : process
		}

		return processKeyInput
	}
)
