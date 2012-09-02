define(
	'spell/shared/util/createDebugMessageHandler',
	function() {
		'use strict'


		return function( spell, startEngine ) {
			var messageTypeToHandler = {
				'spelled.debug.drawCoordinateGrid' : function( payload ) {
					spell.configurationManager.drawCoordinateGrid = !!payload
				},
				'spelled.debug.executeRuntimeModule' : function( payload ) {
					spell.runtimeModule = payload
					startEngine( payload )
				},
				'spelled.debug.updateComponent' : function( payload ) {
					//TODO: check if the scene is correct

					var component = spell.entityManager.getComponent( payload.entityId, payload.componentId );
					if ( component ) {
						spell.logger.debug( "Setting " + payload.componentId + ":" + payload.key + " = " + payload.value + " in entity " + payload.entityId)
						component[payload.key] = payload.value
					} else {
						spell.logger.debug( "Could not find component " + payload.componentId + " in entity " + payload.entityId )
					}
				}
			}

			return function( message ) {
				spell.logger.debug( 'Received message: ' + message.type )


				var handler = messageTypeToHandler[ message.type ]

				if( !handler ) return

				handler( message.payload )
			}
		}
	}
)
