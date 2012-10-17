define(
	'spell/client/2d/graphics/physics/drawPoint',
	function() {
		'use strict'


		return function( context, scale ) {
			if( !scale ) scale = 1

			var a = 2 * scale,
				halfA = a * 0.5

			context.fillRect( -halfA, -halfA, a, a )
		}
	}
)
