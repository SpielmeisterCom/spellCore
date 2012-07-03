define(
	'spell/client/2d/graphics/drawCoordinateGrid',
	[
		'spell/client/2d/graphics/createWorldToViewMatrix',
		'spell/client/2d/graphics/drawText',
		'spell/client/2d/graphics/fonts/OpenSans14px',

		'glmatrix/vec4',
		'glmatrix/mat4'
	],
	function(
		createWorldToViewMatrix,
		drawText,
		OpenSans14px,

		vec4,
		mat4
	) {
		'use strict'


		var tmpMat4         = mat4.identity(),
			lineOpacity     = 0.5,
			paleLineColor   = vec4.create( [ 0.4, 0.4, 0.4, lineOpacity ] ),
			brightLineColor = vec4.create( [ 0.7, 0.7, 0.7, lineOpacity ] ),
			XAxisColor      = vec4.create( [ 0, 0, 0.7, lineOpacity ] ),
			YAxisColor      = vec4.create( [ 0, 0.7, 0, lineOpacity ] )

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

		var drawGridLinesY = function( context, resources, height, stepSize, startX, y, invScale, worldToScreenTranslation, numLines ) {
			var nextStepSize = stepSize * 10,
				scaledY = Math.round( ( y + worldToScreenTranslation[ 1  ] ) * invScale),
				scaledX,
				x

			for( var i = 0; i <= numLines; i++ ) {
				x = ( startX + i * stepSize )
				scaledX = Math.round( ( x + worldToScreenTranslation[ 0 ] ) * invScale )

				// determining the color
				context.setFillStyleColor(
					( x === 0 ?
						YAxisColor :
						( x % nextStepSize === 0 ?
							brightLineColor :
							paleLineColor
						)
					)
				)

				// draw line
				context.fillRect( scaledX, scaledY, 1, height )

				// draw label
				drawText( context, resources, OpenSans14px, scaledX + 3, scaledY, x )
			}
		}

		var drawGridLinesX = function( context, resources, width, stepSize, startY, x, invScale, worldToScreenTranslation, numLines ) {
			var nextStepSize = stepSize * 10,
				scaledX = Math.round( ( x + worldToScreenTranslation[ 0 ] ) * invScale ),
				scaledY,
				y

			for( var i = 0; i <= numLines; i++ ) {
				y = ( startY + i * stepSize )
				scaledY = Math.round( ( y + worldToScreenTranslation[ 1 ] ) * invScale )

				// determining the color
				context.setFillStyleColor(
					( y === 0 ?
						XAxisColor :
						( y % nextStepSize === 0 ?
							brightLineColor :
							paleLineColor
						)
					)
				)

				// draw line
				context.fillRect( scaledX, scaledY, width, 1 )

				// draw label
				drawText( context, resources, OpenSans14px, scaledX + 3, scaledY, y )
			}
		}

		return function( context, resources, screenSize, cameraDimensions, cameraTransform ) {
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

				// grid lines parallel to y-axis
				drawGridLinesY(
					context,
					resources,
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
					resources,
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
