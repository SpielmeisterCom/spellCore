define(
	'spell/client/development/createSettingsMessageHandler',
	[
		'spell/client/development/createMessageDispatcher'
	],
	function(
		createMessageDispatcher
	) {
		'use strict'


		return function( spell ) {
			return createMessageDispatcher( {
				drawCoordinateGrid : function( payload ) {
					spell.configurationManager.setValue( 'drawCoordinateGrid', payload )
				},
				drawTitleSafeOutline : function( payload ) {
					spell.configurationManager.setValue( 'drawTitleSafeOutline', payload )
				},
				simulateScreenAspectRatio : function( payload ) {
					spell.configurationManager.setValue( 'screenAspectRatio', payload.aspectRatio )
				}
			} )
		}
	}
)
