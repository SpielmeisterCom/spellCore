define(
	'spell/client/2d/graphics/drawShape',
	function() {
		'use strict'


		return {
			rectangle : function( context, shape ) {
				var width         = shape.width,
					height        = shape.height,
					negHalfWidth  = width * -0.5,
					negHalfHeight = height * -0.5

				if( shape.fill ) {
					context.setColor( shape.fillColor )
					context.fillRect( negHalfWidth, negHalfHeight, width, height )
				}

				context.setLineColor( shape.lineColor )
				context.drawRect( negHalfWidth, negHalfHeight, width, height, shape.lineWidth )
			}
		}
	}
)
