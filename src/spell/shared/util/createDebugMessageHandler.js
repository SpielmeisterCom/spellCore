define(
	'spell/shared/util/createDebugMessageHandler',
	function() {
		'use strict'


		return function( globals ) {
			var messageTypeToHandler = {
				'keyEvent' : function( payload ) {
					var type = payload.type

					if( type === 'keydown' ||
						type === 'keyup' ) {

						globals.inputManager.injectKeyEvent( type, payload.keyCode )
					}
				},
				'drawCoordinateGrid' : function( payload ) {
					globals.configurationManager.drawCoordinateGrid = !!payload
				}
			}

			return function( message ) {
				var handler = messageTypeToHandler[ message.type ]

				if( !handler ) return

				handler( message.payload )
			}
		}
	}
)
