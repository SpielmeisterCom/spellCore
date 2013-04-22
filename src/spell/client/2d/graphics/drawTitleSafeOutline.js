define(
	'spell/client/2d/graphics/drawTitleSafeOutline',
	[
		'spell/client/util/createIncludedRectangle',

		'spell/math/util',
		'spell/math/mat3',
		'spell/math/vec2'
	],
	function(
		createIncludedRectangle,


		mathUtil,
		mat3,
		vec2
	) {
		'use strict'


		var tmpMat3 = mat3.identity( mat3.create() ),
			tmp     = vec2.create()

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
				scaledCameraDimensions    = vec2.multiply( tmp, cameraDimensions, scale ),
				cameraAspectRatio         = scaledCameraDimensions[ 0 ] / scaledCameraDimensions[ 1 ],
				effectiveCameraDimensions = createIncludedRectangle( screenSize, cameraAspectRatio )

			var translation = vec2.scale(
				tmp,
				vec2.subtract( tmp, screenSize, effectiveCameraDimensions ),
				0.5
			)

			context.save()
			{
				// world to view matrix
				mathUtil.mat3Ortho( tmpMat3, 0, screenSize[ 0 ], 0, screenSize[ 1 ] )
				mat3.translate( tmpMat3, tmpMat3, translation )

				context.setViewMatrix( tmpMat3 )

				context.setColor( color )
				drawRect( context, 0, 0, effectiveCameraDimensions[ 0 ], effectiveCameraDimensions[ 1 ], 2 )
			}
			context.restore()
		}
	}
)
