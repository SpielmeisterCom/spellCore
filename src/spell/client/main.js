define(
	'spell/client/main',
	[
		'spell/client/runtimeModule',
		'spell/client/util/createAssets',
		'spell/shared/util/createMainLoop',
		'spell/shared/util/entities/EntityManager',
		'spell/shared/util/scene/SceneManager',
		'spell/shared/util/blueprints/BlueprintManager',
		'spell/shared/util/ConfigurationManager',
		'spell/shared/util/EventManager',
		'spell/shared/util/InputManager',
		'spell/shared/util/ResourceLoader',
		'spell/shared/util/StatisticsManager',
		'spell/shared/util/Events',
		'spell/shared/util/Logger',
		'spell/shared/util/createDebugMessageHandler',
		'spell/shared/util/platform/PlatformKit',

		'spell/shared/util/platform/underscore'
	],
	function(
		runtimeModule,
		createAssets,
		createMainLoop,
		EntityManager,
		SceneManager,
		BlueprintManager,
		ConfigurationManager,
		EventManager,
		InputManager,
		ResourceLoader,
		StatisticsManager,
		Events,
		Logger,
		createDebugMessageHandler,
		PlatformKit,

		_,

		// configuration parameters passed in from stage zero loader
		parameters
	) {
		'use strict'


		var debugCallback

		var loadBlueprints = function( blueprintManager, runtimeModule ) {
			_.each(
				runtimeModule.componentBlueprints,
				function( componentBlueprint ) {
					blueprintManager.add( componentBlueprint )
				}
			)

			_.each(
				runtimeModule.entityBlueprints,
				function( entityBlueprint ) {
					blueprintManager.add( entityBlueprint )
				}
			)

			_.each(
				runtimeModule.systemBlueprints,
				function( systemBlueprint ) {
					blueprintManager.add( systemBlueprint )
				}
			)
		}

		var globals              = {},
			eventManager         = new EventManager(),
			configurationManager = new ConfigurationManager( eventManager, parameters ),
			renderingContext     = PlatformKit.RenderingFactory.createContext2d(
				eventManager,
				configurationManager.id,
				1024,
				768,
				configurationManager.renderingBackEnd
			),
			soundManager         = PlatformKit.createSoundManager(),
			inputManager         = new InputManager( configurationManager ),
			resourceLoader       = new ResourceLoader( runtimeModule.name, soundManager, renderingContext, eventManager, configurationManager.resourceServer ),
			statisticsManager    = new StatisticsManager(),
			blueprintManager     = new BlueprintManager(),
			mainLoop             = createMainLoop( eventManager, statisticsManager ),
			SceneManager          = new SceneManager( globals, mainLoop )

		statisticsManager.init()


		/**
		 * public
		 */

		var start = function() {
			if( parameters.verbose ) {
				Logger.setLogLevel( Logger.LOG_LEVEL_DEBUG )
			}

			Logger.debug( 'client started' )


			loadBlueprints( blueprintManager, runtimeModule )

			_.extend(
				globals,
				{
					assets               : createAssets( runtimeModule.assets ),
					configurationManager : configurationManager,
					blueprintManager     : blueprintManager,
					eventManager         : eventManager,
					entityManager        : new EntityManager( blueprintManager ),
					inputManager         : inputManager,
					inputEvents          : inputManager.getInputEvents(),
					renderingContext     : renderingContext,
					resourceLoader       : resourceLoader,
					resources            : resourceLoader.getResources(),
					statisticsManager    : statisticsManager,
					soundManager         : soundManager,
					SceneManager          : SceneManager,
					runtimeModule        : runtimeModule
				}
			)


//			PlatformKit.registerOnScreenResize( _.bind( onScreenResized, onScreenResized, eventManager ) )

			var renderingContextConfig = renderingContext.getConfiguration()
			Logger.debug( 'created rendering context: type=' + renderingContextConfig.type + '; size=' + renderingContextConfig.width + 'x' + renderingContextConfig.height )



			var sceneConfig = _.find(
				runtimeModule.scenes,
				function( iter ) {
					return iter.name === runtimeModule.startScene
				}
			)

			if( !sceneConfig ) throw 'Error: Could not find start scene \'' + runtimeModule.startScene + '\'.'

			SceneManager.startScene( sceneConfig )

			mainLoop.run()
		}

		return {
			start : start,

			/**
			 * This callback is called when the engine instance sends message to the editing environment.
			 *
			 * @param fn
			 */
			setDebugCallback : function( fn ) {
				debugCallback = fn
			},

			/**
			 * This method is used to send debug messages to the engine instance.
			 *
			 * @param message
			 */
			sendDebugMessage : createDebugMessageHandler( inputManager )
		}
	}
)
