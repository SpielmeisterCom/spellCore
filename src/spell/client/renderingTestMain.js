define(
	"spell/client/renderingTestMain",
	[
        "spell/shared/util/ConfigurationManager",
		"spell/shared/util/EventManager",
		"spell/shared/util/ResourceLoader",
        'spell/shared/util/InputManager',
		"spell/shared/util/createLogger",
		"spell/shared/util/platform/PlatformKit",
		"spell/shared/util/Events"
	],
	function(
        ConfigurationManager,
		EventManager,
		ResourceLoader,
        InputManager,
		createLogger,
		PlatformKit,
		Events
	) {
		"use strict"


		var logger = createLogger()
		logger.setLogLevel( logger.LOG_LEVEL_DEBUG )

		var bufferWidth  = 512
		var bufferHeight = 384
		var renderingContexts = []
		var objectCount = 7

		var resources = undefined

		var eventManager         = new EventManager()
		var configurationManager = new ConfigurationManager( eventManager )
		var resourceLoader       = new ResourceLoader( eventManager, configurationManager.resourceServer )
		var inputManager         = new InputManager( eventManager, Events )

		inputManager.init()

		var resourceUris = [
			"images/4.2.04_256.png"
		]


		renderingContexts.push(
			PlatformKit.RenderingFactory.createContext2d(
				eventManager,
				bufferWidth,
				bufferHeight,
				PlatformKit.RenderingFactory.BACK_END_CANVAS
//				PlatformKit.RenderingFactory.BACK_END_WEBGL
			)
		)

		var draw = function() {
			var image = resources[ "images/4.2.04_256.png" ]

			for( var i = 0; i < renderingContexts.length; i++ ) {
				var context = renderingContexts[ i ]
				var texture = context.createTexture( image )

				context.setClearColor( [ 0.0, 0.0, 0.0 ] )

				context.save()
				{
					context.clear()

					context.scale( [ 1, 1, 0 ] )

					var x = bufferWidth / 2

					for( var j = 0; j < objectCount; j++ ) {
						context.drawTexture( texture, 0, 0, x, x )
						context.translate( [ x, x / 4, 0 ] )
						context.scale( [ 0.5, 0.5, 0 ] )
						context.rotate( 0.15 )

						var opacity = 1.0 - ( j / objectCount )
						context.setGlobalAlpha( opacity )
					}
				}
				context.restore()
			}

            PlatformKit.callNextFrame( draw )
		}

		resourceLoader.addResourceBundle( "bundle1", resourceUris )

		eventManager.subscribe(
			[ Events.RESOURCE_PROGRESS, "bundle1" ],
			function( event ) {
				logger.info( event )
			}
		)

		eventManager.subscribe(
			[ Events.RESOURCE_LOADING_COMPLETED, "bundle1" ],
			function( event ) {
				logger.info( "loading completed" )

                resources = resourceLoader.getResources()
				draw()
			}
		)

		eventManager.subscribe(
			[ Events.RESOURCE_ERROR, "bundle1" ],
			function( event ) {
				logger.info( "Error while loading '" + event + "'." )
			}
		)

		resourceLoader.start()
	}
)
