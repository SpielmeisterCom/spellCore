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
		'spell/shared/util/platform/initDebugEnvironment',

		// Forcing the build system to include the math modules in the platform agnostic engine package.
		// Do _not_ remove unless you know exactly what you are doing!
		'spell/math/mat2',
		'spell/math/mat3',
		'spell/math/mat4',
		'spell/math/quat4',
		'spell/math/util',
		'spell/math/vec2',
		'spell/math/vec3',
		'spell/math/vec4',

		'spell/functions'
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
		initDebugEnvironment,

		mat2,
		mat3,
		mat4,
		quat4,
		util,
		vec2,
		vec3,
		vec4,

		_,

		// configuration parameters passed in from stage zero loader
		parameters
	) {
		'use strict'


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

		var logger = new Logger(),
			globals = {
			logger : logger
		}

		var eventManager         = new EventManager(),
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
			resourceLoader       = new ResourceLoader( globals, runtimeModule.name, soundManager, renderingContext, eventManager, configurationManager.resourceServer ),
			statisticsManager    = new StatisticsManager(),
			templateManager      = new TemplateManager(),
			mainLoop             = createMainLoop( eventManager, statisticsManager ),
			sceneManager         = new SceneManager( globals, mainLoop )

		statisticsManager.init()


		/*
		 * public
		 */

		var start = function() {
			if( parameters.debug ) {
				logger.setLogLevel( logger.LOG_LEVEL_DEBUG )
				initDebugEnvironment( logger )
			}

			logger.debug( 'client started' )


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
			logger.debug( 'created rendering context: type=' + renderingContextConfig.type + '; size=' + renderingContextConfig.width + 'x' + renderingContextConfig.height )



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
			setSendMessageToEditor : function( fn ) {
				logger.setSendMessageToEditor( fn )
			},

			/*
			 * This method is used to send debug messages to the engine instance.
			 *
			 * @param message
			 */
			sendDebugMessage : createDebugMessageHandler( globals )
		}
	}
)
