define(
	'spell/shared/util/platform/private/graphics/webgl/createWebGlContext',
	[
		'spell/shared/util/platform/private/graphics/StateStack',
		'spell/shared/util/platform/private/graphics/webgl/createContext',
		'spell/shared/util/platform/private/graphics/webgl/shaders',

		'spell/shared/util/color',
		'spell/shared/util/platform/private/nativeType/createFloatArray',

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

		vec3,
		mat3,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var gl
		var stateStack   = new StateStack( 32 )
		var currentState = stateStack.getTop()

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

		var tmpMatrix     = mat3.create(),
			textureMatrix = mat3.create()


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
				clear             : clear,
				createTexture     : createWebGlTexture,
				drawTexture       : _.bind( drawTexture, null, shaderProgram ),
				drawSubTexture    : _.bind( drawSubTexture, null, shaderProgram ),
				fillRect          : _.bind( fillRect, null, shaderProgram ),
				getConfiguration  : getConfiguration,
				resizeColorBuffer : resizeColorBuffer,
				restore           : restore,
				rotate            : rotate,
				save              : save,
				scale             : scale,
				setClearColor     : setClearColor,
				setColor          : setColor,
				setLineColor      : setLineColor,
				setGlobalAlpha    : setGlobalAlpha,
				setTransform      : setTransform,
				setViewMatrix     : setViewMatrix,
				transform         : transform,
				translate         : translate,
				viewport          : _.bind( viewport, null, shaderProgram )
			}
		}

		/*
		 * Returns a rendering context. Once a context has been created additional calls to this method return the same context instance.
		 *
		 * @param canvas - the canvas dom element
		 */
		var createWebGlContext = function( canvas ) {
			if( canvas === undefined ) throw 'Missing first argument.'

			if( gl !== undefined ) return gl


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

			// setting up vertices
			var vertices = createFloatArray( 8 )
			vertices[ 0 ] = 0.0
			vertices[ 1 ] = 0.0
			vertices[ 2 ] = 1.0
			vertices[ 3 ] = 0.0
			vertices[ 4 ] = 0.0
			vertices[ 5 ] = 1.0
			vertices[ 6 ] = 1.0
			vertices[ 7 ] = 1.0

			var vertexPositionBuffer = gl.createBuffer()
			gl.bindBuffer( gl.ARRAY_BUFFER, vertexPositionBuffer )
			gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW )

			var attributeLocation = gl.getAttribLocation( shaderProgram, 'aVertexPosition' )
			gl.vertexAttribPointer( attributeLocation, 2, gl.FLOAT, false, 0, 0 )
			gl.enableVertexAttribArray( attributeLocation )

			// setting up screen space shim matrix
			var uniformLocation = gl.getUniformLocation( shaderProgram, 'uScreenSpaceShimMatrix' )
			gl.uniformMatrix3fv( uniformLocation, false, screenSpaceShimMatrix )

			// setting up texture matrix
			resetTextureMatrix( shaderProgram, textureMatrix )

			return shaderProgram
		}


		var isTextureMatrixIdentity = false

		var resetTextureMatrix = function( shaderProgram, matrix ) {
			if( isTextureMatrixIdentity ) return

			matrix[ 0 ] = 1.0
			matrix[ 4 ] = 1.0
			matrix[ 6 ] = 0.0
			matrix[ 7 ] = 0.0

			gl.uniformMatrix3fv( gl.getUniformLocation( shaderProgram, 'uTextureMatrix' ), false, matrix )
		}

		var updateTextureMatrix = function( shaderProgram, ss, st, tt, ts, matrix ) {
			isTextureMatrixIdentity = false

			matrix[ 0 ] = ss
			matrix[ 4 ] = st
			matrix[ 6 ] = tt
			matrix[ 7 ] = ts

			gl.uniformMatrix3fv( gl.getUniformLocation( shaderProgram, 'uTextureMatrix' ), false, matrix )
		}


		/*
		 * public
		 */

		var save = function() {
			stateStack.pushState()
			currentState = stateStack.getTop()
		}

		var restore = function() {
			stateStack.popState()
			currentState = stateStack.getTop()
		}

		var setColor = function( vec ) {
			// TODO: push color value to shader program, not just state stack
			currentState.color = color.createRgba( vec )
		}

		var setLineColor = function( vec ) {
			// TODO: push color value to shader program, not just state stack
			currentState.lineColor = color.createRgba( vec )
		}

		var setGlobalAlpha = function( u ) {
			// TODO: push color value to shader program, not just state stack
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

		var drawTexture = function( shaderProgram, texture, dx, dy, dw, dh ) {
			if( texture === undefined ) throw 'Texture is undefined'


			if( !dw ) dw = 1.0
			if( !dh ) dh = 1.0

			// setting up fillRect mode
			var uniformLocation = gl.getUniformLocation( shaderProgram, 'uFillRect' )
			gl.uniform1i( uniformLocation, 0 )

			// setting up global alpha
			gl.uniform1f( gl.getUniformLocation( shaderProgram, 'uGlobalAlpha' ), currentState.opacity )

			// setting up global color
			gl.uniform4fv( gl.getUniformLocation( shaderProgram, 'uGlobalColor' ), currentState.color )

			// setting up texture
			gl.bindTexture( gl.TEXTURE_2D, texture.privateGlTextureResource )
			uniformLocation = gl.getUniformLocation( shaderProgram, 'uTexture0' )
			gl.uniform1i( uniformLocation, 0 )

			// setting up transformation
			mat3.multiply( worldToScreen, currentState.matrix, tmpMatrix )

			// rotating the image so that it is not upside down
			mat3.translate( tmpMatrix, [ dx, dy ] )
			mat3.rotate( tmpMatrix, Math.PI )
			mat3.scale( tmpMatrix, [ -dw, dh ] )
			mat3.translate( tmpMatrix, [ 0, -1 ] )

			gl.uniformMatrix3fv( gl.getUniformLocation( shaderProgram, 'uModelViewMatrix' ), false, tmpMatrix )

			// setting up the texture matrix
			resetTextureMatrix( shaderProgram, textureMatrix )

			// drawing
			gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 )
		}

		var drawSubTexture = function( shaderProgram, texture, sx, sy, sw, sh, dx, dy, dw, dh ) {
			if( texture === undefined ) throw 'Texture is undefined'


			if( !dw ) dw = 1.0
			if( !dh ) dh = 1.0

			// setting up fillRect mode
			var uniformLocation = gl.getUniformLocation( shaderProgram, 'uFillRect' )
			gl.uniform1i( uniformLocation, 0 )

			// setting up global alpha
			gl.uniform1f( gl.getUniformLocation( shaderProgram, 'uGlobalAlpha' ), currentState.opacity )

			// setting up global color
			gl.uniform4fv( gl.getUniformLocation( shaderProgram, 'uGlobalColor' ), currentState.color )

			// setting up texture
			gl.bindTexture( gl.TEXTURE_2D, texture.privateGlTextureResource )
			uniformLocation = gl.getUniformLocation( shaderProgram, 'uTexture0' )
			gl.uniform1i( uniformLocation, 0 )

			// setting up transformation
			mat3.multiply( worldToScreen, currentState.matrix, tmpMatrix )

			// rotating the image so that it is not upside down
			mat3.translate( tmpMatrix, [ dx, dy ] )
			mat3.rotate( tmpMatrix, Math.PI )
			mat3.scale( tmpMatrix, [ -dw, dh ] )
			mat3.translate( tmpMatrix, [ 0, -1 ] )

			gl.uniformMatrix3fv( gl.getUniformLocation( shaderProgram, 'uModelViewMatrix' ), false, tmpMatrix )

			// setting up the texture matrix
			var tw = texture.dimensions[ 0 ],
				th = texture.dimensions[ 1 ]

			updateTextureMatrix(
				shaderProgram,
				sw / tw,
				sh / th,
				sx / tw,
				sy / th,
				textureMatrix
			)

			// drawing
			gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 )
		}

		var fillRect = function( shaderProgram, dx, dy, dw, dh ) {
			// setting up fillRect mode
			var uniformLocation = gl.getUniformLocation( shaderProgram, 'uFillRect' )
			gl.uniform1i( uniformLocation, 1 )

			// setting up global alpha
			gl.uniform1f( gl.getUniformLocation( shaderProgram, 'uGlobalAlpha' ), currentState.opacity )

			// setting up global color
			gl.uniform4fv( gl.getUniformLocation( shaderProgram, 'uGlobalColor' ), currentState.color )

			// setting up transformation
			mat3.multiply( worldToScreen, currentState.matrix, tmpMatrix )

			// correcting position
			mat3.translate( tmpMatrix, [ dx, dy ] )
			mat3.scale( tmpMatrix, [ dw, dh ] )

			gl.uniformMatrix3fv( gl.getUniformLocation( shaderProgram, 'uModelViewMatrix' ), false, tmpMatrix )

			// drawing
			gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 )
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
			mat3.set( matrix, worldToView )
			createViewToScreenMatrix( gl.canvas.width, gl.canvas.height, viewToScreen )
			mat3.multiply( viewToScreen, worldToView, worldToScreen )
		}

		var viewport = function( shaderProgram, x, y, width, height ) {
			gl.viewport( x, y , width, height )

			// reinitialize screen space shim matrix
			createScreenSpaceShimMatrix( width, height, screenSpaceShimMatrix )

			var uniformLocation = gl.getUniformLocation( shaderProgram, 'uScreenSpaceShimMatrix' )
			gl.uniformMatrix3fv( uniformLocation, false, screenSpaceShimMatrix )
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
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE )
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE )

			if( isPowerOfTwoTexture ) {
				gl.generateMipmap( gl.TEXTURE_2D )
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
