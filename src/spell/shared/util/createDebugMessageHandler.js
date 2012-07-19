define(
	'spell/shared/util/createDebugMessageHandler',
	function() {
		'use strict'


		return function( globals ) {
			var messageTypeToHandler = {
				'spelled.debug.drawCoordinateGrid' : function( payload ) {
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
