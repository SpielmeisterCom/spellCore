define(
	'spell/client/2d/graphics/drawShape',
	function() {
		'use strict'


		return {
			rectangle: function( context, shape ) {
				var halfWidth    = shape.width * 0.5,
					quarterWidth = shape.width * 0.25

				if( shape.fill ) {
					context.setColor( shape.fillColor )
					context.fillRect( 0, 0, shape.width, shape.height )
				}

				context.setLineColor( shape.lineColor )
				context.drawRect( 0, 0, shape.width, shape.height, shape.lineWidth )
			}
		}
	}
)
