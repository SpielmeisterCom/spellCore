define(
	'spell/shared/util/createDebugMessageHandler',
	function() {
		'use strict'


		return function( globals, startEngine ) {
			var messageTypeToHandler = {
				'spelled.debug.drawCoordinateGrid' : function( payload ) {
					globals.configurationManager.drawCoordinateGrid = !!payload
				},
				'spelled.debug.executeRuntimeModule' : function( payload ) {
					globals.runtimeModule = payload
					startEngine()
				}
			}

			return function( message ) {
				globals.logger.debug( 'Received message: ' + message.type )


				var handler = messageTypeToHandler[ message.type ]

				if( !handler ) return

				handler( message.payload )
			}
		}
	}
)
