define(
	'spell/client/util/onScreenResize',
	[
		'spell/math/util',
		'spell/shared/util/Events'
	],
	function(
		mathUtil,
		Events
	) {
		'use strict'


		var constants = {
			minWidth : 320,
			minHeight : 240,
			maxWidth : 1024,
			maxHeight : 768
		}

		return function( eventManager, width, height ) {
			// clamping screen dimensions to allowed range
			width  = mathUtil.clamp( width, constants.minWidth, constants.maxWidth )
			height = mathUtil.clamp( height, constants.minHeight, constants.maxHeight )

			var aspectRatio = width / height

			// correcting aspect ratio
			if( aspectRatio <= ( 4 / 3 ) ) {
				height = Math.floor( width * 3 / 4 )

			} else {
				width = Math.floor( height * 4 / 3 )
			}

			eventManager.publish( Events.SCREEN_RESIZE, [ [ width, height ] ] )
		}
	}
)
