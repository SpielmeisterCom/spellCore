define(
	'spell/client/main',
	[
		'spell/client/runtimeModule',
		'spell/client/util/createAssets',
		'spell/shared/util/createMainLoop',
		'spell/shared/util/entity/EntityManager',
		'spell/shared/util/scene/SceneManager',
		'spell/shared/util/template/TemplateManager',
		'spell/shared/util/ConfigurationManager',
		'spell/shared/util/EventManager',
		'spell/shared/util/InputManager',
		'spell/shared/util/ResourceLoader',
		'spell/shared/util/StatisticsManager',
		'spell/shared/util/Events',
		'spell/shared/util/Logger',
		'spell/shared/util/createDebugMessageHandler',
		'spell/shared/util/platform/PlatformKit',

		'spell/shared/util/platform/underscore',

		'glmatrix/glmatrix'
	],
	function(
		runtimeModule,
		createAssets,
		createMainLoop,
		EntityManager,
		SceneManager,
		TemplateManager,
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

		// NOTE: forcing the build system to include glmatrix into the platform agnostic part of the engine
		glmatrix,

		// configuration parameters passed in from stage zero loader
		parameters
	) {
		'use strict'


		var debugCallback

		var loadTemplates = function( templateManager, runtimeModule ) {
			_.each(
				runtimeModule.componentTemplates,
				function( componentTemplate ) {
					templateManager.add( componentTemplate )
				}
			)

			_.each(
				runtimeModule.entityTemplates,
				function( entityTemplate ) {
					templateManager.add( entityTemplate )
				}
			)

			_.each(
				runtimeModule.systemTemplates,
				function( systemTemplate ) {
					templateManager.add( systemTemplate )
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
			templateManager      = new TemplateManager(),
			mainLoop             = createMainLoop( eventManager, statisticsManager ),
			sceneManager         = new SceneManager( globals, mainLoop )

		statisticsManager.init()


		/*
		 * public
		 */

		var start = function() {
			if( parameters.verbose ) {
				Logger.setLogLevel( Logger.LOG_LEVEL_DEBUG )
			}

			Logger.debug( 'client started' )


			loadTemplates( templateManager, runtimeModule )

			_.extend(
				globals,
				{
					assets               : createAssets( runtimeModule.assets ),
					configurationManager : configurationManager,
					templateManager      : templateManager,
					eventManager         : eventManager,
					entityManager        : new EntityManager( templateManager ),
					inputManager         : inputManager,
					inputEvents          : inputManager.getInputEvents(),
					renderingContext     : renderingContext,
					resourceLoader       : resourceLoader,
					resources            : resourceLoader.getResources(),
					statisticsManager    : statisticsManager,
					soundManager         : soundManager,
					sceneManager         : sceneManager,
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

			sceneManager.startScene( sceneConfig )

			mainLoop.run()
		}

		return {
			start : start,

			/*
			 * This callback is called when the engine instance sends message to the editing environment.
			 *
			 * @param fn
			 */
			setDebugCallback : function( fn ) {
				debugCallback = fn
			},

			/*
			 * This method is used to send debug messages to the engine instance.
			 *
			 * @param message
			 */
			sendDebugMessage : createDebugMessageHandler( inputManager )
		}
	}
)
