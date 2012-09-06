define(
	'spell/shared/util/createDebugMessageHandler',
	[
		'spell/functions'
	],
	function(
		_
	) {
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
					var success = spell.entityManager.updateComponent( payload.componentId, payload.entityId, payload.config )

					if( !success ) {
						spell.logger.error( 'Could not update component \'' + payload.componentId + '\' in entity ' + payload.entityId + '.' )
					}
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
