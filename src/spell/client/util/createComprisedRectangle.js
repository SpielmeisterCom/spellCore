define(
	'spell/client/util/createComprisedRectangle',
	function() {
		'use strict'


		/**
		 * Returns a screen size that has the supplied aspect ratio and comprises the supplied screen dimensions.
		 *
		 * For example:
		 *
		 *   createComprisedRectangle( [ 120, 90 ], 16/9 )
		 *   => [ 160, 90 ]
		 */
		return function( dimensions, requestedAspectRatio, round ) {
			round = !!round

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

			if( round ) {
				width  = Math.round( width )
				height = Math.round( height )
			}

			return [ width, height ]
		}
	}
)
