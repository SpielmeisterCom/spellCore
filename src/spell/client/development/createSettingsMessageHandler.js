define(
	'spell/client/development/createSettingsMessageHandler',
	[
		'spell/client/development/createMessageDispatcher',
		'spell/shared/util/Events'
	],
	function(
		createMessageDispatcher,
		Events
	) {
		'use strict'


		var addDebugFlag = function( configurationManager, name, value ) {
			if( !configurationManager.debug ) {
				configurationManager.debug = {}
			}

			configurationManager.debug[ name ] = value
		}

		return function( spell ) {
			return createMessageDispatcher(
				{
					'drawCoordinateGrid' : function( payload ) {
						addDebugFlag( spell.configurationManager, 'drawCoordinateGrid', payload )
					},
					'drawTitleSafeOutline' : function( payload ) {
						addDebugFlag( spell.configurationManager, 'drawTitleSafeOutline', payload )
					},
					'simulateScreenAspectRatio' : function( payload ) {
						addDebugFlag( spell.configurationManager, 'screenAspectRatio', payload.aspectRatio )

						spell.eventManager.publish( Events.SCREEN_ASPECT_RATIO, [ payload.aspectRatio ] )
					}
				}
			)
		}
	}
)
