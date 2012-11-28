define(
	'spell/client/2d/graphics/physics/drawCircle',
	function() {
		'use strict'


		return function( context, radius, color, lineWidth ) {
			var negHalfRadius = radius * -0.5

			context.setLineColor( color )
			context.drawCircle( negHalfRadius, negHalfRadius, radius, lineWidth )
			context.drawLine( radius, 0, radius * 0.618, 0, lineWidth )
		}
	}
)
