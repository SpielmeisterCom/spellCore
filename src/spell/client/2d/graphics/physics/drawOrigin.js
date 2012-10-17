define(
	'spell/client/2d/graphics/physics/drawOrigin',
	function() {
		'use strict'


		return function( context, scale ) {
			if( !scale ) scale = 1

			context.drawLine( -scale, -scale, scale, scale )
			context.drawLine( -scale, scale, scale, -scale )
		}
	}
)
