define(
	'spell/shared/util/platform/private/graphics/canvas/createCanvasContext',
	[
		'spell/shared/util/platform/private/graphics/StateStack',
		'spell/shared/util/color',

		'spell/math/util',
		'spell/math/vec2',
		'spell/math/mat3'
	],
	function(
		StateStack,
		color,

		mathUtil,
		vec2,
		mat3
	) {
		'use strict'


		var modulo = mathUtil.modulo

		var context,
			canvas,
			clearColor   = color.formatCanvas( [ 0.0, 0.0, 0.0, 1.0 ] ),
			stateStack   = new StateStack( 32 ),
			currentState = stateStack.getTop()


		// HACK: this scale factor is used to mitigate the insane canvas-2d rasterization rules
		var magicScale    = 1.015,
			negMagicScale = -magicScale

		// scaling factor which must be applied to draw a one pixel wide line
		var pixelScale

		// world space to view space transformation matrix
		var worldToView = mat3.create()
		mat3.identity( worldToView )

		// view space to screen space transformation matrix
		var viewToScreen = mat3.create()
		mat3.identity( viewToScreen )

		// accumulated transformation world space to screen space transformation matrix
		var worldToScreen = mat3.create()
		mat3.identity( worldToScreen )

		var screenToWorld = mat3.create()
		mat3.identity( screenToWorld )

		var getUntilTexCoord = function( i, numIterations, endTexCoord ) {
			if( i + 1 === numIterations ) {
				var tc = endTexCoord % 1

				return tc === 0 ? 1 : tc
			}

			return 1
		}

		var normalizeStartTexCoord = function( tc ) {
			if( tc < 0 ) {
				tc += 1
			}

			return modulo( tc, 1 )
		}

		/**
		 * This function emulates texture mapping on canvas-2d. Rotation transformations and negative scales are not
		 * supported.
		 *
		 * @param context
		 * @param texture
		 * @param textureMatrix
		 * @param destinationDimensions
		 */
		var mapTexture = function( context, texture, textureMatrix, destinationDimensions ) {
			var scaleX            = Math.abs( textureMatrix[ 0 ] ),
				scaleY            = Math.abs( textureMatrix[ 4 ] ),
				textureWidth      = texture.dimensions[ 0 ],
				textureHeight     = texture.dimensions[ 1 ],
				destinationWidth  = destinationDimensions[ 0 ],
				destinationHeight = destinationDimensions[ 1 ]

			var startTexCoordX = normalizeStartTexCoord( textureMatrix[ 6 ] ),
				startTexCoordY = normalizeStartTexCoord( textureMatrix[ 7 ] ),
				endTexCoordX   = startTexCoordX + Math.abs( scaleX ),
				endTexCoordY   = startTexCoordY + Math.abs( scaleY )

			var numIterationsX = Math.round( Math.ceil( endTexCoordX ) - Math.floor( startTexCoordX ) ),
				numIterationsY = Math.round( Math.ceil( endTexCoordY ) - Math.floor( startTexCoordY ) )

			for( var y = 0,
				 fromTexCoordY = startTexCoordY,
				 untilTexCoordY = 0,
				 texCoordRangeY = 0,
				 scaledTexCoordRangeY = 0,
				 scaledTexCoordRangeX = 0,
				 destinationPositionY = 0,
				 coveredTexCoordY = 0;
				 y < numIterationsY;
				 y++ ) {

				untilTexCoordY       = getUntilTexCoord( y, numIterationsY, endTexCoordY )
				texCoordRangeY       = untilTexCoordY - fromTexCoordY
				coveredTexCoordY     += texCoordRangeY
				scaledTexCoordRangeY = texCoordRangeY / scaleY

				for( var x = 0,
					 fromTexCoordX = startTexCoordX,
					 untilTexCoordX = 0,
					 texCoordRangeX = 0,
					 destinationPositionX = 0,
					 coveredTexCoordX = 0;
					 x < numIterationsX;
					 x++ ) {

					untilTexCoordX       = getUntilTexCoord( x, numIterationsX, endTexCoordX )
					texCoordRangeX       = untilTexCoordX - fromTexCoordX
					coveredTexCoordX     += texCoordRangeX
					scaledTexCoordRangeX = texCoordRangeX / scaleX

					context.drawImage(
						texture.privateImageResource,
						textureWidth * fromTexCoordX,
						textureHeight * fromTexCoordY,
						textureWidth * texCoordRangeX,
						textureHeight * texCoordRangeY,
						destinationWidth * destinationPositionX - 0.5,
						destinationHeight * destinationPositionY - 0.5,
						destinationWidth * scaledTexCoordRangeX + 1,
						destinationHeight * scaledTexCoordRangeY + 1
					)

					destinationPositionX += scaledTexCoordRangeX
					fromTexCoordX = 0
				}

				destinationPositionY += scaledTexCoordRangeY
				fromTexCoordY = 0
			}
		}

		/*
		 * Returns true if the supplied quad covers the full screen, false otherwise.
		 *
		 * @param x
		 * @param y
		 * @param width
		 * @param height
		 */
		var isFullscreenCovered = function( x, y, width, height ) {
			var leftBorder   = x,
				rightBorder  = x + width,
				topBorder    = y + height,
				bottomBorder = y

			return ( leftBorder <= 0 &&
				rightBorder >= canvas.width &&
				topBorder >= canvas.height &&
				bottomBorder <= 0 )
		}

		var setClippingRegion = function( x, y, width, height ) {
			context.beginPath()
			context.rect( x, y, width, height )
			context.closePath()
			context.clip()
		}

		var updateWorldToScreen = function( viewToScreen, worldToView ) {
			mat3.multiply( viewToScreen, worldToView, worldToScreen )
			mat3.inverse( worldToScreen, screenToWorld )

			pixelScale = Math.abs( 1 / worldToScreen[ 0 ] )

			context.setTransform(
				worldToScreen[ 0 ],
				worldToScreen[ 1 ],
				worldToScreen[ 3 ],
				worldToScreen[ 4 ],
				worldToScreen[ 6 ],
				worldToScreen[ 7 ]
			)
		}

		var initWrapperContext = function() {
			viewport( 0, 0, canvas.width, canvas.height )

			// world space to view space matrix
			var cameraWidth  = canvas.width,
				cameraHeight = canvas.height

			mat3.ortho(
				-cameraWidth / 2,
				cameraWidth / 2,
				-cameraHeight / 2,
				cameraHeight / 2,
				worldToView
			)

			mat3.translate( worldToView, [ -cameraWidth / 2, -cameraHeight / 2 ] ) // WATCH OUT: apply inverse translation for camera position

			updateWorldToScreen( viewToScreen, worldToView )
		}

		/*
		 * Creates a wrapper context from the backend context.
		 */
		var createWrapperContext = function() {
			initWrapperContext()

			return {
				clear                   : clear,
				createTexture           : createCanvasTexture,
				drawTexture             : drawTexture,
				drawSubTexture          : drawSubTexture,
				drawRect                : drawRect,
				drawCircle              : drawCircle,
				drawLine                : drawLine,
				fillRect                : fillRect,
				getConfiguration        : getConfiguration,
				resizeColorBuffer       : resizeColorBuffer,
				restore                 : restore,
				rotate                  : rotate,
				save                    : save,
				multiplyMatrix          : multiplyMatrix,
				scale                   : scale,
				setClearColor           : setClearColor,
				setColor                : setColor,
				setLineColor            : setLineColor,
				setGlobalAlpha          : setGlobalAlpha,
				setTransform            : setTransform,
				setViewMatrix           : setViewMatrix,
				transform               : transform,
				translate               : translate,
				viewport                : viewport,
				transformScreenToWorld  : transformScreenToWorld,
				getCanvasElement        : function() { return canvas }
			}
		}

		/*
		 * Returns a rendering context. Once a context has been created additional calls to this method return the same context instance.
		 *
		 * @param canvas - the canvas dom element
		 */
		var createCanvasContext = function( canvasObj ) {
			if( canvasObj === undefined ) throw 'Missing first argument.'

			if( context !== undefined ) return context

			canvas  = canvasObj
			context = canvas.getContext( '2d' )

			if( context === null ) return null

			return createWrapperContext()
		}


		/*
		 * public
		 */
		var transformScreenToWorld = function( vec ) {
			return mat3.multiplyVec2( screenToWorld, vec, vec2.create() )
		}

		var setColor = function( vec ) {
			currentState.color = color.createRgba( vec )
			context.fillStyle = color.formatCanvas( vec )
		}

		var setLineColor = function( vec ) {
			currentState.lineColor = color.createRgba( vec )
			context.strokeStyle = color.formatCanvas( vec )
		}

		var setGlobalAlpha = function( u ) {
			currentState.opacity = u
			context.globalAlpha = u
		}

		var setClearColor = function( vec ) {
			clearColor = color.formatCanvas( vec )
		}

		var save = function() {
			stateStack.pushState()
			currentState = stateStack.getTop()
		}

		var restore = function() {
			stateStack.popState()
			currentState = stateStack.getTop()

			setViewMatrix( currentState.viewMatrix )
		}

		var multiplyMatrix = function ( mat ) {
			mat3.multiply( currentState.matrix, mat )
		}

		var scale = function( vec ) {
			mat3.scale( currentState.matrix, vec )
		}

		var translate = function( vec ) {
			mat3.translate( currentState.matrix, vec )
		}

		var rotate = function( u ) {
			mat3.rotate( currentState.matrix, u )
		}

		/*
		 * Clears the color buffer with the clear color
		 */
		var clear = function() {
			context.save()
			{
				// reset transformation to identity
				context.setTransform( 1, 0, 0, 1, 0, 0 )

				context.globalAlpha = 1.0
				context.fillStyle = clearColor
				context.fillRect( 0, 0, canvas.width, canvas.height )
			}
			context.restore()
		}

		var drawTexture = function( texture, destinationPosition, destinationDimensions, textureMatrix ) {
			if( texture === undefined ) throw 'Texture is undefined'

			context.save()
			{
				context.globalAlpha = currentState.opacity

				var modelToWorld = currentState.matrix

				context.transform(
					modelToWorld[ 0 ],
					modelToWorld[ 1 ],
					modelToWorld[ 3 ],
					modelToWorld[ 4 ],
					modelToWorld[ 6 ],
					modelToWorld[ 7 ]
				)

				if( !textureMatrix ) {
					// rotating the image so that it is not upside down
					context.translate( destinationPosition[ 0 ], destinationPosition[ 1 ] )
					context.rotate( Math.PI )
					context.scale( -1, 1 )
					context.translate( 0, -destinationDimensions[ 1 ] )

					context.drawImage(
						texture.privateImageResource,
						0,
						0,
						destinationDimensions[ 0 ],
						destinationDimensions[ 1 ]
					)

				} else {
					context.translate( destinationPosition[ 0 ], destinationPosition[ 1 ] )
					context.rotate( Math.PI )

					// Compensating for the lack of negative scales support in mapTexture by letting canvas do the work.
					// Macgyver would have been proud.
					var xAxisInverted = textureMatrix[ 0 ] < 0,
						yAxisInverted = textureMatrix[ 4 ] < 0

					context.scale(
						xAxisInverted ? 1 : -1,
						yAxisInverted ? -1 : 1
					)

					context.translate(
						xAxisInverted ? -destinationDimensions[ 0 ] : 0,
						yAxisInverted ? 0 : -destinationDimensions[ 1 ]
					)

					mapTexture( context, texture, textureMatrix, destinationDimensions )
				}
			}
			context.restore()
		}

		var drawSubTexture = function( texture, sourcePosition, sourceDimensions, destinationPosition, destinationDimensions ) {
			if( texture === undefined ) throw 'Texture is undefined'

			context.save()
			{
				context.globalAlpha = currentState.opacity

				var modelToWorld = currentState.matrix

				context.transform(
					modelToWorld[ 0 ],
					modelToWorld[ 1 ],
					modelToWorld[ 3 ],
					modelToWorld[ 4 ],
					modelToWorld[ 6 ],
					modelToWorld[ 7 ]
				)

				// rotating the image so that it is not upside down
				context.translate( destinationPosition[ 0 ], destinationPosition[ 1 ] )
				context.rotate( Math.PI )
				context.scale( negMagicScale, magicScale )
				context.translate( 0, -destinationDimensions[ 1 ] )

				context.drawImage(
					texture.privateImageResource,
					sourcePosition[ 0 ],
					sourcePosition[ 1 ],
					sourceDimensions[ 0 ],
					sourceDimensions[ 1 ],
					0,
					0,
					destinationDimensions[ 0 ],
					destinationDimensions[ 1 ]
				)
			}
			context.restore()
		}

		var drawRect = function( dx, dy, dw, dh, lineWidth ) {
			if( !lineWidth ) lineWidth = 1

			context.save()
			{
				context.globalAlpha = currentState.opacity

				var modelToWorld = currentState.matrix

				context.transform(
					modelToWorld[ 0 ],
					modelToWorld[ 1 ],
					modelToWorld[ 3 ],
					modelToWorld[ 4 ],
					modelToWorld[ 6 ],
					modelToWorld[ 7 ]
				)

				context.lineWidth = pixelScale * lineWidth
			    context.strokeRect( dx, dy, dw, dh )
			}
			context.restore()
		}

		var drawCircle = function( dx, dy, radius, lineWidth ) {
			if( !lineWidth ) lineWidth = 1

			context.save()
			{
				context.globalAlpha = currentState.opacity

				var modelToWorld = currentState.matrix

				context.transform(
					modelToWorld[ 0 ],
					modelToWorld[ 1 ],
					modelToWorld[ 3 ],
					modelToWorld[ 4 ],
					modelToWorld[ 6 ],
					modelToWorld[ 7 ]
				)

				context.lineWidth = pixelScale * lineWidth
				context.beginPath()
				context.arc( dx, dy, radius, 0, Math.PI * 2, true )
				context.stroke()
			}
			context.restore()
		}

		var drawLine = function( ax, ay, bx, by, lineWidth ) {
			if( !lineWidth ) lineWidth = 1

			context.save()
			{
				context.globalAlpha = currentState.opacity

				var modelToWorld = currentState.matrix

				context.transform(
					modelToWorld[ 0 ],
					modelToWorld[ 1 ],
					modelToWorld[ 3 ],
					modelToWorld[ 4 ],
					modelToWorld[ 6 ],
					modelToWorld[ 7 ]
				)

				var scaledLineWidth = pixelScale * lineWidth

				context.lineWidth = scaledLineWidth

				context.beginPath()
				context.moveTo( ax, ay )
				context.lineTo( bx, by )
				context.stroke()
			}
			context.restore()
		}

		var fillRect = function( dx, dy, dw, dh ) {
			context.save()
			{
				context.globalAlpha = currentState.opacity

				var modelToWorld = currentState.matrix

				context.transform(
					modelToWorld[ 0 ],
					modelToWorld[ 1 ],
					modelToWorld[ 3 ],
					modelToWorld[ 4 ],
					modelToWorld[ 6 ],
					modelToWorld[ 7 ]
				)

				// rotating the image so that it is not upside down
				context.translate( dx, dy )
				context.rotate( Math.PI )
				context.scale( -1, 1 )
				context.translate( 0, -dh )

				context.fillRect( 0, 0, dw, dh )
			}
			context.restore()
		}

		var resizeColorBuffer = function( width, height ) {
			canvas.width  = width
			canvas.height = height
		}

		var transform = function( matrix ) {
			mat3.multiply( currentState.matrix, matrix )
		}

		var setTransform = function( matrix ) {
			mat3.set( matrix, currentState.matrix )
		}

		var setViewMatrix = function( matrix ) {
			mat3.set( matrix, currentState.viewMatrix )
			mat3.set( matrix, worldToView )

			updateWorldToScreen( viewToScreen, worldToView )
		}

		var viewport = function( x, y, width, height ) {
			mat3.identity( viewToScreen )

			viewToScreen[ 0 ] = width * 0.5
			viewToScreen[ 4 ] = height * 0.5 * -1 // mirroring y-axis
			viewToScreen[ 6 ] = x + width * 0.5
			viewToScreen[ 7 ] = y + height * 0.5

			updateWorldToScreen( viewToScreen, worldToView )

			if( !isFullscreenCovered( x, y, width, height ) ) {
				setClippingRegion( x, y, width, height )
			}
		}

		/*
		 * Returns an object describing the current configuration of the rendering backend.
		 */
		var getConfiguration = function() {
			return {
				type   : 'canvas-2d',
				width  : canvas.width,
				height : canvas.height
			}
		}

		/*
		 * Returns instance of texture class
		 *
		 * The public interface of the texture class consists of the two attributes width and height.
		 *
		 * @param image
		 */
		var createCanvasTexture = function( image ) {
			return {
				/*
				 * Public
				 */
				dimensions : [ image.width, image.height ],

				/*
				 * Private
				 *
				 * This is an implementation detail of the class. If you write code that depends on this you better know what you are doing.
				 */
				privateImageResource : image
			}
		}

		return createCanvasContext
	}
)
