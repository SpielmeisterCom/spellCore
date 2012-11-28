define(
	'spell/client/2d/graphics/physics/drawBox',
	function() {
		'use strict'


		return function( context, width, height, color, lineWidth ) {
			var halfWidth  = width * 0.5,
				halfHeight = height * 0.5

			context.setLineColor( color )
			context.drawRect( -halfWidth, -halfHeight, width, height, lineWidth )
			context.drawLine( halfWidth * 0.618, 0, halfWidth, 0, lineWidth )
		}
	}
)
