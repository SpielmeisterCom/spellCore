define(
	'spell/shared/util/createDebugMessageHandler',
	[
		'spell/shared/util/Events',
		'spell/client/util/createIncludedScreenSize',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		Events,
		createIncludedScreenSize,
		PlatformKit,

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
					var success = spell.EntityManager.updateComponent( payload.componentId, payload.entityId, payload.config )

					if( !success ) {
						spell.logger.error( 'Could not update component \'' + payload.componentId + '\' in entity ' + payload.entityId + '.' )
					}
				},
				'spelled.debug.simulateScreenAspectRatio' : function( payload ) {
					spell.eventManager.publish( Events.SCREEN_ASPECT_RATIO, [ payload.aspectRatio ] )
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
