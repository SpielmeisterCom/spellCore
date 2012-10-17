define(
	'spell/client/2d/graphics/physics/drawBox',
	function() {
		'use strict'


		return function( context, width, height, color, lineWidth ) {
			var halfWidth    = width * 0.5,
				quarterWidth = width * 0.25

			context.setLineColor( color )
			context.drawRect( 0, 0, width, height, lineWidth )
			context.drawLine( halfWidth * 0.618, 0, halfWidth, 0, lineWidth )
		}
	}
)
