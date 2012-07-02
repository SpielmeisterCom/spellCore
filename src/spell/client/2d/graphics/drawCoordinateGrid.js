define(
	'spell/client/2d/graphics/drawCoordinateGrid',
	[
		'spell/client/2d/graphics/createWorldToViewMatrix',

		'glmatrix/vec4',
		'glmatrix/mat4'
	],
	function(
		createWorldToViewMatrix,

		vec4,
		mat4
	) {
		'use strict'


		var tmpVec4 = vec4.create(),
			tmpMat4 = mat4.identity()

		var computeGridLineStepSize = function( s ) {
		    var log = Math.log( s ) / Math.log( 10 )
		    var exp = Math.round( log )

		    return Math.pow( 10, exp - 1 )
		}

		var computeGridStart = function( value, stepSize ) {
			var rest = value % stepSize

			return ( rest !== 0 ?
				( value > 0 ?
					value - rest + stepSize :
					value - rest
				) :
				value
			)
		}

		var computeNumLines = function( range, stepSize ) {
			return Math.floor( range / stepSize )
		}

		var drawGridLinesY = function( context, height, stepSize, startX, y, invScale, worldToScreenTranslation, numLines ) {
			var nextStepSize = stepSize * 10,
				scaledY = Math.round( ( y + worldToScreenTranslation[ 1  ] ) * invScale),
				x

			for( var i = 0; i <= numLines; i++ ) {
				x = ( startX + i * stepSize )

				// determining the color
				if( x === 0 ) {
					tmpVec4[ 0 ] = 0
					tmpVec4[ 1 ] = 0.85
					tmpVec4[ 2 ] = 0
					tmpVec4[ 3 ] = 1.0

				} else if( x % nextStepSize === 0 ) {
					tmpVec4[ 0 ] = 0.75
					tmpVec4[ 1 ] = 0.75
					tmpVec4[ 2 ] = 0.75
					tmpVec4[ 3 ] = 1.0

				} else {
					tmpVec4[ 0 ] = 0.25
					tmpVec4[ 1 ] = 0.25
					tmpVec4[ 2 ] = 0.25
					tmpVec4[ 3 ] = 1.0
				}

				context.setFillStyleColor( tmpVec4 )
				context.fillRect(
					Math.round( ( x + worldToScreenTranslation[ 0 ] ) * invScale ),
					scaledY,
					1,
					height
				)
			}
		}

		var drawGridLinesX = function( context, width, stepSize, startY, x, invScale, worldToScreenTranslation, numLines ) {
			var nextStepSize = stepSize * 10,
				scaledX = Math.round( ( x + worldToScreenTranslation[ 0 ] ) * invScale ),
				y

			for( var i = 0; i <= numLines; i++ ) {
				y = ( startY + i * stepSize )

				// determining the color
				if( y === 0 ) {
					tmpVec4[ 0 ] = 0
					tmpVec4[ 1 ] = 0
					tmpVec4[ 2 ] = 0.85
					tmpVec4[ 3 ] = 1.0

				} else if( y % nextStepSize === 0 ) {
					tmpVec4[ 0 ] = 0.75
					tmpVec4[ 1 ] = 0.75
					tmpVec4[ 2 ] = 0.75
					tmpVec4[ 3 ] = 1.0

				} else {
					tmpVec4[ 0 ] = 0.25
					tmpVec4[ 1 ] = 0.25
					tmpVec4[ 2 ] = 0.25
					tmpVec4[ 3 ] = 1.0
				}

				context.setFillStyleColor( tmpVec4 )
				context.fillRect(
					scaledX,
					Math.round( ( y + worldToScreenTranslation[ 1 ] ) * invScale ),
					width,
					1
				)

				y += stepSize
			}
		}

		return function( context, screenSize, cameraDimensions, cameraTransform ) {
			var position     = cameraTransform.translation,
				scale        = cameraTransform.scale,
				cameraWidth  = cameraDimensions[ 0 ],
				cameraHeight = cameraDimensions[ 1 ],
				minX         = position[ 0 ] - cameraWidth / 2,
				minY         = position[ 1 ] - cameraHeight / 2,
				maxX         = minX + cameraWidth,
				maxY         = minY + cameraHeight,
				stepSize     = computeGridLineStepSize( cameraWidth ),
				worldToScreenTranslation = [ -minX, -minY ]

			context.save()
			{
				context.setViewMatrix( createWorldToViewMatrix( tmpMat4, screenSize ) )
				context.setGlobalAlpha( 0.66 )

				// grid lines parallel to y-axis
				drawGridLinesY(
					context,
					cameraHeight,
					stepSize,
					computeGridStart( minX, stepSize ),
					minY,
					1 / scale[ 1 ],
					worldToScreenTranslation,
					computeNumLines( cameraWidth, stepSize )
				)

				// grid lines parallel to x-axis
				drawGridLinesX(
					context,
					cameraWidth,
					stepSize,
					computeGridStart( minY, stepSize ),
					minX,
					1 / scale[ 0 ],
					worldToScreenTranslation,
					computeNumLines( cameraHeight, stepSize )
				)
			}
			context.restore()
		}
	}
)
