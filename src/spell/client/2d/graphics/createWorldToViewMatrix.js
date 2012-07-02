define(
	'spell/client/2d/graphics/createWorldToViewMatrix',
	[
		'glmatrix/mat4'
	],
	function(
		mat4
	) {
		'use strict'


		return function( matrix, cameraDimensions ) {
			mat4.ortho(
				0,
				cameraDimensions[ 0 ],
				0,
				cameraDimensions[ 1 ],
				0,
				1000,
				matrix
			)

			mat4.translate( matrix, [ 0, 0, 0 ] ) // camera is located at (0/0/0); WATCH OUT: apply inverse translation

			return matrix
		}
	}
)
