define(
	'spell/shared/util/platform/private/graphics/webgl/createWebGlContext',
	[
		'spell/shared/util/platform/private/graphics/StateStack',
		'spell/shared/util/platform/private/graphics/webgl/createContext',
		'spell/shared/util/platform/private/graphics/webgl/shaders',

		'spell/shared/util/color',
		'spell/shared/util/platform/private/nativeType/createFloatArray',

		'spell/math/vec2',
		'spell/math/vec3',
		'spell/math/mat3',

		'spell/functions'
	],
	function(
		StateStack,
		createContext,
		shaders,

		color,
		createFloatArray,

		vec2,
		vec3,
		mat3,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var gl, canvas,
			stateStack           = new StateStack( 32 ),
			currentState         = stateStack.getTop(),
			NUM_CIRCLE_VERTICES  = 32,
			QUAD_VERTEX_OFFSET   = 0,
			CIRCLE_VERTEX_OFFSET = QUAD_VERTEX_OFFSET + 4,
			LINE_VERTEX_OFFSET   = CIRCLE_VERTEX_OFFSET + NUM_CIRCLE_VERTICES,
			vertices             = createFloatArray( ( LINE_VERTEX_OFFSET + 2 ) * 2 ),
			positionVertexBuffer

		var screenSpaceShimMatrix = mat3.create()

		// view space to screen space transformation matrix
		var viewToScreen = mat3.create()
		mat3.identity( viewToScreen )

		// world space to view space transformation matrix
		var worldToView = mat3.create()
		mat3.identity( worldToView )

		// accumulated transformation world space to screen space transformation matrix
		var worldToScreen = mat3.create()
		mat3.identity( worldToScreen )

		var screenToWorld = mat3.create()
		mat3.identity( screenToWorld )

		var tmpMatrix            = mat3.create(),
			defaultTextureMatrix = mat3.create()

		mat3.identity( defaultTextureMatrix )

		/*
		 * Creates a projection matrix that normalizes the transformation behaviour to that of the normalized canvas-2d (that is origin is in bottom left,
		 * positive x-axis to the right, positive y-axis up, screen space coordinates as input. The matrix transforms from screen space to clip space.
		 *
		 * @param width
		 * @param height
		 * @param matrix
		 */
		var createScreenSpaceShimMatrix = function( width, height, matrix ) {
			mat3.ortho(
				0,
				width,
				0,
				height,
				matrix
			)

			return matrix
		}

		var createViewToScreenMatrix = function( width, height, matrix ) {
			mat3.identity( matrix )

			matrix[ 0 ] = width * 0.5
			matrix[ 4 ] = height * 0.5
			matrix[ 6 ] = width * 0.5
			matrix[ 7 ] = height * 0.5

			return matrix
		}

		var initWrapperContext = function( shaderProgram ) {
			viewport( shaderProgram, 0, 0, gl.canvas.width, gl.canvas.height )

			// gl initialization
			gl.clearColor( 0.0, 0.0, 0.0, 1.0 )
			gl.clear( gl.COLOR_BUFFER_BIT )

			// setting up blending
			gl.enable( gl.BLEND )
			gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA )

			gl.disable( gl.DEPTH_TEST )

			gl.activeTexture( gl.TEXTURE0 )
		}

		/*
		 * Creates a wrapper context for the backend context.
		 */
		var createWrapperContext = function() {
			var shaderProgram = createShaderProgram()

			initWrapperContext( shaderProgram )

			return {
				clear                   : clear,
				createTexture           : createWebGlTexture,
				drawTexture             : _.bind( drawTexture, null, shaderProgram ),
				drawSubTexture          : _.bind( drawSubTexture, null, shaderProgram ),
				drawRect                : _.bind( drawRect, null, shaderProgram ),
				drawCircle              : _.bind( drawCircle, null, shaderProgram ),
				drawLine                : _.bind( drawLine, null, shaderProgram ),
				fillRect                : _.bind( fillRect, null, shaderProgram ),
				getConfiguration        : getConfiguration,
				resizeColorBuffer       : resizeColorBuffer,
				restore                 : restore,
				rotate                  : rotate,
				save                    : save,
				scale                   : scale,
				setClearColor           : setClearColor,
				setColor                : setColor,
				setLineColor            : setLineColor,
				setGlobalAlpha          : setGlobalAlpha,
				setTransform            : setTransform,
				setViewMatrix           : setViewMatrix,
				transform               : transform,
				translate               : translate,
				viewport                : _.bind( viewport, null, shaderProgram ),
				transformScreenToWorld  : transformScreenToWorld,
				getCanvasElement        : function() { return canvas }
			}
		}

		/*
		 * Returns a rendering context. Once a context has been created additional calls to this method return the same context instance.
		 *
		 * @param canvas - the canvas dom element
		 */
		var createWebGlContext = function( canvasObj ) {
			if( canvasObj === undefined ) throw 'Missing first argument.'

			if( gl !== undefined ) return gl

			canvas = canvasObj
			gl = createContext( canvas )

			if( gl === null ) return null


			return createWrapperContext()
		}

		var createShaderProgram = function() {
			var shaderProgram = gl.createProgram()

			var vertexShader = gl.createShader( gl.VERTEX_SHADER )
			gl.shaderSource( vertexShader, shaders.vertex )
			gl.compileShader (vertexShader )
			gl.attachShader( shaderProgram, vertexShader )

			var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER )
			gl.shaderSource( fragmentShader, shaders.fragment )
			gl.compileShader( fragmentShader )
			gl.attachShader( shaderProgram, fragmentShader )

			gl.linkProgram( shaderProgram )
			gl.useProgram( shaderProgram )

			// storing the attribute and uniform locations
			shaderProgram.aVertexPosition        = gl.getAttribLocation( shaderProgram, 'aVertexPosition' )
			shaderProgram.uScreenSpaceShimMatrix = gl.getUniformLocation( shaderProgram, 'uScreenSpaceShimMatrix' )
			shaderProgram.uTextureMatrix         = gl.getUniformLocation( shaderProgram, 'uTextureMatrix' )
			shaderProgram.uFillRect              = gl.getUniformLocation( shaderProgram, 'uFillRect' )
			shaderProgram.uGlobalAlpha           = gl.getUniformLocation( shaderProgram, 'uGlobalAlpha' )
			shaderProgram.uGlobalColor           = gl.getUniformLocation( shaderProgram, 'uGlobalColor' )
			shaderProgram.uTexture0              = gl.getUniformLocation( shaderProgram, 'uTexture0' )
			shaderProgram.uModelViewMatrix       = gl.getUniformLocation( shaderProgram, 'uModelViewMatrix' )

			// setting up vertices
			var angleStep = Math.PI * 2 / NUM_CIRCLE_VERTICES

			// quad
			vertices[ QUAD_VERTEX_OFFSET * 2 + 0 ] = 0.0
			vertices[ QUAD_VERTEX_OFFSET * 2 + 1 ] = 0.0
			vertices[ QUAD_VERTEX_OFFSET * 2 + 2 ] = 1.0
			vertices[ QUAD_VERTEX_OFFSET * 2 + 3 ] = 0.0
			vertices[ QUAD_VERTEX_OFFSET * 2 + 4 ] = 1.0
			vertices[ QUAD_VERTEX_OFFSET * 2 + 5 ] = 1.0
			vertices[ QUAD_VERTEX_OFFSET * 2 + 6 ] = 0.0
			vertices[ QUAD_VERTEX_OFFSET * 2 + 7 ] = 1.0

			// circle
			for( var i = 0; i < NUM_CIRCLE_VERTICES; i++ ) {
				var angle = angleStep * i

				vertices[ CIRCLE_VERTEX_OFFSET * 2 + i * 2 ]     = Math.sin( angle )
				vertices[ CIRCLE_VERTEX_OFFSET * 2 + i * 2 + 1 ] = Math.cos( angle )
			}

			// line
			// These vertices are stubs and get overwritten once the drawLine function is called.
			vertices[ LINE_VERTEX_OFFSET * 2 + 0 ] = 0.0
			vertices[ LINE_VERTEX_OFFSET * 2 + 1 ] = 0.0
			vertices[ LINE_VERTEX_OFFSET * 2 + 2 ] = 0.0
			vertices[ LINE_VERTEX_OFFSET * 2 + 3 ] = 0.0

			positionVertexBuffer = gl.createBuffer()
			gl.bindBuffer( gl.ARRAY_BUFFER, positionVertexBuffer )
			gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW )

			gl.vertexAttribPointer( shaderProgram.aVertexPosition, 2, gl.FLOAT, false, 0, 0 )
			gl.enableVertexAttribArray( shaderProgram.aVertexPosition )

			// setting up screen space shim matrix
			gl.uniformMatrix3fv( shaderProgram.uScreenSpaceShimMatrix, false, screenSpaceShimMatrix )

			// setting up texture matrix
			setTextureMatrix( shaderProgram, defaultTextureMatrix )

			return shaderProgram
		}

		var updateTextureMatrix = function( shaderProgram, ss, st, tt, ts, matrix ) {
			mat3.identity( matrix )

			matrix[ 0 ] = ss
			matrix[ 4 ] = st
			matrix[ 6 ] = tt
			matrix[ 7 ] = ts

			gl.uniformMatrix3fv( shaderProgram.uTextureMatrix, false, matrix )
		}

		var setTextureMatrix = function( shaderProgram, textureMatrix ) {
			gl.uniformMatrix3fv( shaderProgram.uTextureMatrix, false, textureMatrix )
		}


		/*
		 * public
		 */
		var transformScreenToWorld = function( vec ) {
			// transform vec to a gl-like origin (bottom left)
			// use worldPosition as temp because we need to allocate it anyway
			var worldPosition = vec2.create( vec )

			worldPosition[ 1 ] = gl.canvas.height - worldPosition[ 1 ]

			mat3.multiplyVec2( screenToWorld, worldPosition, worldPosition )

			return worldPosition
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

		var setColor = function( vec ) {
			currentState.color = color.createRgba( vec )
		}

		var setLineColor = function( vec ) {
			currentState.lineColor = color.createRgba( vec )
		}

		var setGlobalAlpha = function( u ) {
			currentState.opacity = u
		}

		var setClearColor = function( vec ) {
			gl.clearColor( vec[ 0 ], vec[ 1 ], vec[ 2 ], 1.0 )
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
			gl.clear( gl.COLOR_BUFFER_BIT )
		}

		var drawTexture = function( shaderProgram, texture, destinationPosition, destinationDimensions, textureMatrix ) {
			if( texture === undefined ) throw 'Texture is undefined'

			// setting up fillRect mode
			gl.uniform1i( shaderProgram.uFillRect, 0 )

			// setting up global alpha
			gl.uniform1f( shaderProgram.uGlobalAlpha, currentState.opacity )

			// setting up global color
			gl.uniform4fv( shaderProgram.uGlobalColor, currentState.color )

			// setting up texture
			gl.bindTexture( gl.TEXTURE_2D, texture.privateGlTextureResource )
			gl.uniform1i( shaderProgram.uTexture0, 0 )

			// setting up transformation
			mat3.multiply( worldToScreen, currentState.matrix, tmpMatrix )

			// rotating the image so that it is not upside down
			mat3.translate( tmpMatrix, destinationPosition )
			mat3.rotate( tmpMatrix, Math.PI )
			mat3.scale( tmpMatrix, [ -1, 1 ] )
			mat3.scale( tmpMatrix, destinationDimensions )
			mat3.translate( tmpMatrix, [ 0, -1 ] )

			gl.uniformMatrix3fv( shaderProgram.uModelViewMatrix, false, tmpMatrix )

			setTextureMatrix(
				shaderProgram,
				textureMatrix ?
					textureMatrix :
					defaultTextureMatrix
			)

			gl.drawArrays( gl.TRIANGLE_FAN, QUAD_VERTEX_OFFSET, 4 )
		}

		var drawSubTexture = function( shaderProgram, texture, sourcePosition, sourceDimensions, destinationPosition, destinationDimensions ) {
			if( texture === undefined ) throw 'Texture is undefined'

			// setting up fillRect mode
			gl.uniform1i( shaderProgram.uFillRect, 0 )

			// setting up global alpha
			gl.uniform1f( shaderProgram.uGlobalAlpha, currentState.opacity )

			// setting up global color
			gl.uniform4fv( shaderProgram.uGlobalColor, currentState.color )

			// setting up texture
			gl.bindTexture( gl.TEXTURE_2D, texture.privateGlTextureResource )
			gl.uniform1i( shaderProgram.uTexture0, 0 )

			// setting up transformation
			mat3.multiply( worldToScreen, currentState.matrix, tmpMatrix )

			// rotating the image so that it is not upside down
			mat3.translate( tmpMatrix, destinationPosition )
			mat3.rotate( tmpMatrix, Math.PI )
			mat3.scale( tmpMatrix, [ -1, 1 ] )
			mat3.scale( tmpMatrix, destinationDimensions )
			mat3.translate( tmpMatrix, [ 0, -1 ] )

			gl.uniformMatrix3fv( shaderProgram.uModelViewMatrix, false, tmpMatrix )

			// setting up the texture matrix
			var tw = texture.dimensions[ 0 ],
				th = texture.dimensions[ 1 ]

			updateTextureMatrix(
				shaderProgram,
				( sourceDimensions[ 0 ] - 1 ) / tw,
				( sourceDimensions[ 1 ] - 1 ) / th,
				( sourcePosition[ 0 ] + 0.5 ) / tw,
				( sourcePosition[ 1 ] + 0.5 ) / th,
				tmpMatrix
			)

			gl.drawArrays( gl.TRIANGLE_FAN, QUAD_VERTEX_OFFSET, 4 )
		}

		var drawRect = function( shaderProgram, dx, dy, dw, dh, lineWidth ) {
			if( !lineWidth ) lineWidth = 1

			gl.lineWidth( lineWidth )

			// setting up fillRect mode
			gl.uniform1i( shaderProgram.uFillRect, 1 )

			// setting up global alpha
			gl.uniform1f( shaderProgram.uGlobalAlpha, currentState.opacity )

			// setting up global color
			gl.uniform4fv( shaderProgram.uGlobalColor, currentState.lineColor )

			// setting up transformation
			mat3.multiply( worldToScreen, currentState.matrix, tmpMatrix )

			// correcting position
			mat3.translate( tmpMatrix, [ dx, dy ] )
			mat3.scale( tmpMatrix, [ dw, dh ] )

			gl.uniformMatrix3fv( shaderProgram.uModelViewMatrix, false, tmpMatrix )

			gl.drawArrays( gl.LINE_LOOP, QUAD_VERTEX_OFFSET, 4 )
		}

		var drawCircle = function( shaderProgram, dx, dy, radius, lineWidth ) {
			if( !lineWidth ) lineWidth = 1

			gl.lineWidth( lineWidth )

			// setting up fillRect mode
			gl.uniform1i( shaderProgram.uFillRect, 1 )

			// setting up global alpha
			gl.uniform1f( shaderProgram.uGlobalAlpha, currentState.opacity )

			// setting up global color
			gl.uniform4fv( shaderProgram.uGlobalColor, currentState.lineColor )

			// setting up transformation
			mat3.multiply( worldToScreen, currentState.matrix, tmpMatrix )

			// correcting position
			mat3.translate( tmpMatrix, [ dx, dy ] )
			mat3.scale( tmpMatrix, [ radius, radius ] )

			gl.uniformMatrix3fv( shaderProgram.uModelViewMatrix, false, tmpMatrix )

			gl.drawArrays( gl.LINE_LOOP, CIRCLE_VERTEX_OFFSET, NUM_CIRCLE_VERTICES )
		}

		var drawLine = function( shaderProgram, ax, ay, bx, by, lineWidth ) {
			if( !lineWidth ) lineWidth = 1

			gl.lineWidth( lineWidth )

			// setting up fillRect mode
			gl.uniform1i( shaderProgram.uFillRect, 1 )

			// setting up global alpha
			gl.uniform1f( shaderProgram.uGlobalAlpha, currentState.opacity )

			// setting up global color
			gl.uniform4fv( shaderProgram.uGlobalColor, currentState.lineColor )

			// setting up transformation
			mat3.multiply( worldToScreen, currentState.matrix, tmpMatrix )

			gl.uniformMatrix3fv( shaderProgram.uModelViewMatrix, false, tmpMatrix )

			// line
			vertices[ LINE_VERTEX_OFFSET * 2 + 0 ] = ax
			vertices[ LINE_VERTEX_OFFSET * 2 + 1 ] = ay
			vertices[ LINE_VERTEX_OFFSET * 2 + 2 ] = bx
			vertices[ LINE_VERTEX_OFFSET * 2 + 3 ] = by

			gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW )

			gl.drawArrays( gl.LINES, LINE_VERTEX_OFFSET, 2 )
		}

		var fillRect = function( shaderProgram, dx, dy, dw, dh ) {
			// setting up fillRect mode
			gl.uniform1i( shaderProgram.uFillRect, 1 )

			// setting up global alpha
			gl.uniform1f( shaderProgram.uGlobalAlpha, currentState.opacity )

			// setting up global color
			gl.uniform4fv( shaderProgram.uGlobalColor, currentState.color )

			// setting up transformation
			mat3.multiply( worldToScreen, currentState.matrix, tmpMatrix )

			// correcting position
			mat3.translate( tmpMatrix, [ dx, dy ] )
			mat3.scale( tmpMatrix, [ dw, dh ] )

			gl.uniformMatrix3fv( shaderProgram.uModelViewMatrix, false, tmpMatrix )

			gl.drawArrays( gl.TRIANGLE_FAN, QUAD_VERTEX_OFFSET, 4 )
		}

		var resizeColorBuffer = function( width, height ) {
			gl.canvas.width  = width
			gl.canvas.height = height

			createViewToScreenMatrix( width, height, viewToScreen )
			mat3.multiply( viewToScreen, worldToView, worldToScreen )
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
			createViewToScreenMatrix( gl.canvas.width, gl.canvas.height, viewToScreen )
			mat3.multiply( viewToScreen, worldToView, worldToScreen )
			mat3.inverse( worldToScreen, screenToWorld )
		}

		var viewport = function( shaderProgram, x, y, width, height ) {
			gl.viewport( x, y , width, height )

			// reinitialize screen space shim matrix
			createScreenSpaceShimMatrix( width, height, screenSpaceShimMatrix )

			gl.uniformMatrix3fv( shaderProgram.uScreenSpaceShimMatrix, false, screenSpaceShimMatrix )
		}

		/*
		 * Returns an object describing the current configuration of the rendering backend.
		 */
		var getConfiguration = function() {
			return {
				type   : 'webgl',
				width  : gl.canvas.width,
				height : gl.canvas.height
			}
		}

		var isPowerOfTwo = function( number ) {
			var magnitude = ( Math.log( number ) / Math.log( 2 ) )

			return magnitude === parseInt( magnitude, 10 )
		}

		/*
		 * Returns instance of texture class
		 *
		 * The public interface of the texture class consists of the two attributes width and height.
		 *
		 * @param image
		 */
		var createWebGlTexture = function( image ) {
			var isPowerOfTwoTexture = isPowerOfTwo( image.width ) && isPowerOfTwo( image.height )

			var texture = gl.createTexture()

			gl.bindTexture( gl.TEXTURE_2D, texture )
			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image )
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR )

			if( isPowerOfTwoTexture ) {
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT )
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT )
				gl.generateMipmap( gl.TEXTURE_2D )

			} else {
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE )
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE )
			}

			gl.bindTexture( gl.TEXTURE_2D, null )

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
				privateGlTextureResource : texture
			}
		}

		return createWebGlContext
	}
)
