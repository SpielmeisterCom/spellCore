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
					var component = spell.entityManager.getComponentById( payload.componentId, payload.entityId )

					if( component ) {
						component[ payload.key ] = payload.value

					} else {
						spell.logger.debug( "Could not update component " + payload.componentId + " in entity " + payload.entityId )
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
