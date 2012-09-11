define(
	'spell/client/2d/graphics/drawTitleSafeOutline',
	[
		'spell/client/util/createIncludedScreenSize',

		'spell/math/mat3',
		'spell/math/vec2'
	],
	function(
		createIncludedScreenSize,

		mat3,
		vec2
	) {
		'use strict'


		var tmpMat3  = mat3.identity(),
			tmp      = vec2.create(),
			invScale = vec2.create()

		var drawRect = function( context, dx, dy, width, height, lineWidth ) {
			if( !lineWidth || lineWidth < 0 ) {
				lineWidth = 1
			}

			var doubledLineWidth = lineWidth * 2

			context.save()
			{
				// horizontal
				context.fillRect( dx, dy, width, lineWidth )
				context.fillRect( dx, dy + height - lineWidth, width, lineWidth )

				// vertical
				context.fillRect( dx, dy + lineWidth, lineWidth, height - doubledLineWidth )
				context.fillRect( dx + width - lineWidth, dy + lineWidth, lineWidth, height - doubledLineWidth )
			}
			context.restore()
		}


		return function( context, screenSize, cameraDimensions, cameraTransform ) {
			var scale                     = cameraTransform.scale,
				color                     = [ 1, 0, 1, 1 ],
				scaledCameraDimensions    = vec2.multiply( cameraDimensions, scale, tmp ),
				cameraAspectRatio         = scaledCameraDimensions[ 0 ] / scaledCameraDimensions[ 1 ],
				effectiveCameraDimensions = createIncludedScreenSize( screenSize, cameraAspectRatio )

			var translation = vec2.scale(
				vec2.subtract( screenSize, effectiveCameraDimensions, tmp ),
				0.5
			)

			context.save()
			{
				// world to view matrix
				mat3.ortho( 0, screenSize[ 0 ], 0, screenSize[ 1 ], tmpMat3 )
				mat3.translate( tmpMat3, translation )

				context.setViewMatrix( tmpMat3 )

				context.setFillStyleColor( color )
				drawRect( context, 0, 0, effectiveCameraDimensions[ 0 ], effectiveCameraDimensions[ 1 ], 2 )
			}
			context.restore()
		}
	}
)
