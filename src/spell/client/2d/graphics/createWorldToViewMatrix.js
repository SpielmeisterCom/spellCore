define(
	'spell/client/2d/graphics/createWorldToViewMatrix',
	[
		'spell/math/mat3'
	],
	function(
		mat3
	) {
		'use strict'


		return function( matrix, cameraDimensions ) {
			mat3.ortho(
				0,
				cameraDimensions[ 0 ],
				0,
				cameraDimensions[ 1 ],
				matrix
			)

			mat3.translate( matrix, [ 0, 0 ] ) // camera is located at (0/0); WATCH OUT: apply inverse translation

			return matrix
		}
	}
)
