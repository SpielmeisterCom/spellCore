define(
	'spell/client/2d/graphics/drawShape',
	function() {
		'use strict'


		return {
			rectangle: function( context, shape ) {
				debugger
				var halfWidth    = shape.width * 0.5,
					quarterWidth = shape.width * 0.25

				context.setLineColor( shape.color )
				context.drawRect( 0, 0, shape.width, shape.height, shape.lineWidth )
			}
		}
	}
)
