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
