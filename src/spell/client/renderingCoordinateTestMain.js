define(
	'spell/client/renderingCoordinateTestMain',
	[
		'spell/shared/util/ConfigurationManager',
		'spell/shared/util/EventManager',
		'spell/shared/util/ResourceLoader',
		'spell/shared/util/Events',
		'spell/shared/util/Logger',
		'spell/shared/util/platform/PlatformKit',

		'spell/math/mat4'
	],
	function(
		ConfigurationManager,
		EventManager,
		ResourceLoader,
		Events,
		Logger,
		PlatformKit,

		mat4
	) {
		'use strict'


		var logger = new Logger()
		logger.setLogLevel( logger.LOG_LEVEL_DEBUG )


		var bufferWidth          = 320
		var bufferHeight         = 240

		var soundManager         = {}
		var eventManager         = new EventManager()
		var configurationManager = new ConfigurationManager( eventManager )
		var resourceLoader       = new ResourceLoader( soundManager, eventManager, configurationManager.resourceServer )

		var resourceUris = [
			'images/4.2.04_256.png'
		]

		var texture = undefined

		var context = PlatformKit.RenderingFactory.createContext2d(
			eventManager,
			bufferWidth,
			bufferHeight,
//			PlatformKit.RenderingFactory.BACK_END_CANVAS,
			PlatformKit.RenderingFactory.BACK_END_WEBGL,
			'display0'
		)

		var drawTestPattern1 = function( x, y, width, height ) {
			var halfWidth = width / 2,
				halfHeight = height / 2

			context.save()
			{
				context.setFillStyleColor( [ 1.0, 0.0, 0.2 ] )
				context.fillRect( x, y + halfHeight, halfWidth, halfHeight )

				context.setFillStyleColor( [ 0.8, 0.0, 0.8 ] )
				context.fillRect( x + halfWidth, y, halfWidth, halfHeight )

				context.setFillStyleColor( [ 0.5, 0.72, 0.61 ] )
				context.fillRect( x + halfWidth * 1.5, y, halfWidth / 2, halfHeight / 2 )

//				context.setFillStyleColor( [ 0.0, 0.0, 0.82 ] )
//				context.fillRect( x, y, width, height )
			}
			context.restore()
		}

		var drawTestPattern2 = function( x, y, width, height ) {
//			context.drawTexture( texture, x, y, width, height )
			context.drawSubTexture( texture, 64, 64, 128, 128, x, y, width, height )
		}

		var createMatrix = function() {
			var matrix = mat4.create()
			mat4.identity( matrix )

			return matrix
		}


		/*
		 * Setting up the transformation related components
		 */

		// matrices
		var worldToView = createMatrix()

		// view coordinates to normalized device coordinates
		var aspectRatio  = bufferWidth / bufferHeight,
			cameraWidth  = 3,
			cameraHeight = cameraWidth / aspectRatio

		mat4.ortho(
			-cameraWidth / 2,
			cameraWidth / 2,
			-cameraHeight / 2,
			cameraHeight / 2,
			0,
			1000,
			worldToView
		)

		mat4.translate( worldToView, [ 0, 0, 0 ] ) // camera is located at (0/0/0); WATCH OUT: apply inverse translation


		var drawScreenCoordinates = function() {
			context.setClearColor( [ 0.0, 0.0, 0.0 ] )
			context.clear()

			drawTestPattern1( 0, 0, bufferWidth, bufferHeight )
//			drawTestPattern2( 0, 0, bufferWidth, bufferHeight )
		}

		var drawViewCoordinates = function() {
			context.setClearColor( [ 0.0, 0.0, 0.0 ] )
			context.clear()

			context.setViewMatrix( worldToView )

			drawTestPattern1( 0, 0, 1, 1 )
//			drawTestPattern2( 0, 0, 1, 1 )
		}

		var drawWorldCoordinates = function() {
			context.setClearColor( [ 0.0, 0.0, 0.0 ] )
			context.clear()

			context.setViewMatrix( worldToView )

			// object to world space transformation go here - object is located at (-1|-1) in world space
			context.translate( [ -1.0, -1.0, 0 ] )

			drawTestPattern1( 0, 0, 1, 1 )
//			drawTestPattern2( 0, 0, 1, 1 )
		}

		var drawModelCoordinates = function() {
			context.setClearColor( [ 0.0, 0.0, 0.0 ] )
			context.clear()

			context.setViewMatrix( worldToView )

			// object to world space transformation go here - object is located at (-1|-1) in world space
			context.translate( [ -1.0, -1.0, 0 ] )

			// "appearance" transformations go here - pattern is rotated in object space
			context.rotate( Math.PI / 30 )

//			drawTestPattern1( 0, 0, 1, 1 )
			drawTestPattern2( 0, 0, 1, 1 )
		}


		var runTest = function() {
			/*
			 * The expected result in all test cases is that the color buffer is covered completely with the test pattern.
			 *
			 * http://www.songho.ca/opengl/gl_transform.html
			 */

//			drawScreenCoordinates()

//			drawViewCoordinates()

//			drawWorldCoordinates()

			drawModelCoordinates()
		}

		eventManager.subscribe(
			[ Events.RESOURCE_LOADING_COMPLETED, 'bundle1' ],
			function( event ) {
				logger.info( 'loading completed' )

				texture = context.createTexture( resourceLoader.getResources()[ resourceUris[ 0 ] ] )

				logger.info( 'running test' )
				runTest()
			}
		)

		resourceLoader.addResourceBundle( "bundle1", resourceUris )
		resourceLoader.start()
	}
)
