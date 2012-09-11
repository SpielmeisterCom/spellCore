define(
	'spell/client/util/onScreenResize',
	[
		'spell/shared/util/Events'
	],
	function(
		Events
	) {
		'use strict'


		return function( eventManager, width, height ) {
			eventManager.publish( Events.SCREEN_RESIZE, [ [ width, height ] ] )
		}
	}
)
