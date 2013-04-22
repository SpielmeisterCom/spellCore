define(
	'spell/client/util/createEffectiveCameraDimensions',
	[
		'spell/client/util/createComprisedRectangle',

		'spell/math/vec2'
	],
	function(
		createComprisedRectangle,

		vec2
	) {
		'use strict'


		return function( cameraWidth, cameraHeight, cameraScale, aspectRatio ) {
			var tmpVec2 = vec2.fromValues( cameraWidth, cameraHeight )

			return vec2.multiply(
				tmpVec2,
				cameraScale,
				createComprisedRectangle( tmpVec2, aspectRatio )
			)
		}
	}
)
