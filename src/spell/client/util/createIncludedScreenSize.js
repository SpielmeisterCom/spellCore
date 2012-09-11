define(
	'spell/client/util/createIncludedScreenSize',
	function() {
		'use strict'


		/**
		 * Returns a screen size that has the supplied aspect ratio and includes the supplied screen dimensions.
		 *
		 * For example:
		 *
		 *   createIncludedScreenSize( [ 120, 90 ], 16/9 )
		 *   => [ 120, 67.5 ]
		 */
		return function( dimensions, requestedAspectRatio ) {
			var width              = dimensions[ 0 ],
				height             = dimensions[ 1 ],
				currentAspectRatio = width / height

				if( requestedAspectRatio <= currentAspectRatio ) {
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
