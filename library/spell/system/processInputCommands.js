define(
	'spell/system/processInputCommands',
	[
		'spell/Defines',

		'spell/functions'
	],
	function(
		Defines,

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
				pendingStopCommands = this.pendingStopCommands,
				playerControlledIds = this.playerControlledIds

			for( var i = 0, n = commands.length; i < n; i++ ) {
				var command = commands[ i ],
					id      = command.id

				if( command.isStart ) {
					pendingStopCommands[ id ] = true

				} else {
					if( pendingStopCommands[ id ] ) {
						pendingStopCommands[ id ] = false
					}
				}

				for( var j = 0, m = playerControlledIds.length; j < m; j++ ) {
					var mapping      = playerControlledIds[ j ],
						entityId     = mapping.entityId

					if( mapping.controllerId === command.inputContextId ) {
						entityManager.triggerEvent( entityId, command.getEventName() )
					}
				}
			}
		}

		var processInputCommands = function( spell ) {
			this.pendingStopCommands = {}
		}

		processInputCommands.prototype = {
			init : function( spell ) {
				spell.inputManager.clearCommands()

				var playerControlledIds = this.playerControlledIds = []

				var processControllableComponentEvents = this.processControllableComponentEvents = function( component, entityId ) {
					if( _.contains( playerControlledIds, entityId ) ) {

						return
					}

					playerControlledIds.push( { entityId: entityId, controllerId: component.controllerId } )
				}

				var eventManager = spell.eventManager

				eventManager.subscribe( [ eventManager.EVENT.COMPONENT_CREATED, Defines.CONTROLLABLE_COMPONENT_ID ], processControllableComponentEvents )
				eventManager.subscribe( [ eventManager.EVENT.COMPONENT_UPDATED, Defines.CONTROLLABLE_COMPONENT_ID ], processControllableComponentEvents )
			},
			destroy : function( spell ) {
				var eventManager                       = spell.eventManager,
					processControllableComponentEvents = this.processControllableComponentEvents

				eventManager.unsubscribe( [ eventManager.EVENT.COMPONENT_CREATED, Defines.CONTROLLABLE_COMPONENT_ID ], processControllableComponentEvents )
				eventManager.unsubscribe( [ eventManager.EVENT.COMPONENT_UPDATED, Defines.CONTROLLABLE_COMPONENT_ID ], processControllableComponentEvents )
			},
			activate : function( spell ) {
				this.pendingStopCommands = {}
			},
			deactivate : function( spell ) {
				// Trigger the still pending stop commands.
				var entityManager       = spell.entityManager,
					pendingStopCommands = this.pendingStopCommands,
					playerControlledIds = this.playerControlledIds

				for( var id in pendingStopCommands ) {
					if( !pendingStopCommands[ id ] ) continue

					for( var i = 0, n = playerControlledIds.length; i < n; i++ ) {
                        var mapping      = playerControlledIds[ i ],
                            entityId     = mapping.entityId

                        entityManager.triggerEvent( entityId, 'stop' + id )
					}
				}

				this.pendingStopCommands = {}
			},
			process : process
		}

		return processInputCommands
	}
)
