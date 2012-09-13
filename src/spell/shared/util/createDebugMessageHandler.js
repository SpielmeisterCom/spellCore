define(
	'spell/shared/util/createDebugMessageHandler',
	[
		'spell/shared/util/Events',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		Events,
		PlatformKit,

		_
	) {
		'use strict'


		var addDebugFlag = function( configurationManager, name, value ) {
			if( !configurationManager.debug ) {
				configurationManager.debug = {}
			}

			configurationManager.debug[ name ] = value
		}

		return function( spell, startEngine ) {
			var messageTypeToHandler = {
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
				'spelled.debug.drawCoordinateGrid' : function( payload ) {
					addDebugFlag( spell.configurationManager, 'drawCoordinateGrid', !!payload )
				},
				'spelled.debug.drawTitleSafeOutline' : function( payload ) {
					addDebugFlag( spell.configurationManager, 'drawTitleSafeOutline', !!payload )
				},
				'spelled.debug.simulateScreenAspectRatio' : function( payload ) {
					addDebugFlag( spell.configurationManager, 'screenAspectRatio', payload.aspectRatio )

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
