define(
	'spell/client/util/createComprisedScreenSize',
	function() {
		'use strict'


		/**
		 * Returns a screen size that has the supplied aspect ratio and comprises the supplied screen dimensions.
		 *
		 * For example:
		 *
		 *   createComprisedScreenSize( [ 120, 90 ], 16/9 )
		 *   => [ 160, 90 ]
		 */
		return function( dimensions, requestedAspectRatio ) {
			var width              = dimensions[ 0 ],
				height             = dimensions[ 1 ],
				currentAspectRatio = width / height

				if( requestedAspectRatio >= currentAspectRatio ) {
					// screen has additional space left horizontally
					width = requestedAspectRatio * height

				} else {
					// screen has additional space left vertically
					height = width / requestedAspectRatio
				}

			return [ width, height ]
		}
	}
)
