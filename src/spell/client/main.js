define(
	'spell/client/main',
	[
		'spell/client/util/loadResources',
		'spell/client/util/onScreenResize',
		'spell/shared/util/createMainLoop',
		'spell/shared/util/entity/EntityManager',
		'spell/shared/util/scene/SceneManager',
		'spell/shared/util/template/TemplateManager',
		'spell/shared/util/ConfigurationManager',
		'spell/shared/util/EventManager',
		'spell/shared/util/InputManager',
		'spell/shared/util/ResourceLoader',
		'spell/shared/util/StatisticsManager',
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
		loadResources,
		onScreenResize,
		createMainLoop,
		EntityManager,
		SceneManager,
		TemplateManager,
		ConfigurationManager,
		EventManager,
		InputManager,
		ResourceLoader,
		StatisticsManager,
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
		stageZeroConfig
	) {
		'use strict'


		/**
		 * This function is called as soon as all external resources are loaded. From this moment on it is safe to assume that all static content has been
		 * loaded and is ready to use.
		 */
		var postLoadedResources = function() {
			var globals = this.globals

			globals.entityManager = new EntityManager( globals.templateManager )

			globals.logger.debug( 'loading resources completed' )

			PlatformKit.registerOnScreenResize(
				globals.configurationManager.id,
				_.bind( onScreenResize, null, globals.eventManager )
			)

			var renderingContextConfig = globals.renderingContext.getConfiguration()
			globals.logger.debug( 'created rendering context (' + renderingContextConfig.type + ')' )


			var sceneConfig = _.find(
				globals.runtimeModule.scenes,
				function( iter ) {
					return iter.name === globals.runtimeModule.startScene
				}
			)

			if( !sceneConfig ) throw 'Error: Could not find start scene \'' + globals.runtimeModule.startScene + '\'.'

			globals.sceneManager.startScene( sceneConfig )

			globals.mainLoop.run()
		}

		var start = function() {
			var globals = this.globals

			if( !globals.runtimeModule ) {
				throw 'Error: No runtime module defined. Please provide a runtime module.'
			}

			globals.logger.debug( 'client started' )

			var resourceLoader = new ResourceLoader(
				globals,
				globals.runtimeModule.name,
				globals.soundManager,
				globals.renderingContext,
				globals.eventManager,
				globals.configurationManager.resourceServer
			)

			_.extend(
				globals,
				{
					resourceLoader : resourceLoader,
					resources      : resourceLoader.getResources()
				}
			)

			loadResources(
				globals,
				_.bind( postLoadedResources, this )
			)
		}

		var init = function( config ) {
			var globals              = {},
				logger               = new Logger(),
				eventManager         = new EventManager(),
				configurationManager = new ConfigurationManager( eventManager, config ),
				renderingContext     = PlatformKit.RenderingFactory.createContext2d(
					eventManager,
					configurationManager.id,
					1024,
					768,
					configurationManager.renderingBackEnd
				),
				soundManager      = PlatformKit.createSoundManager(),
				inputManager      = new InputManager( configurationManager ),
				statisticsManager = new StatisticsManager(),
				templateManager   = new TemplateManager(),
				mainLoop          = createMainLoop( eventManager, statisticsManager),
				sceneManager      = new SceneManager( globals, templateManager, mainLoop )

			statisticsManager.init()

			_.extend(
				globals,
				{
					configurationManager : configurationManager,
					eventManager         : eventManager,
					inputEvents          : inputManager.getInputEvents(),
					inputManager         : inputManager,
					logger               : logger,
					mainLoop             : mainLoop,
					renderingContext     : renderingContext,
					runtimeModule        : undefined,
					sceneManager         : sceneManager,
					soundManager         : soundManager,
					statisticsManager    : statisticsManager,
					templateManager      : templateManager,
				}
			)

			this.globals = globals


			if( config.debug ) {
				logger.setLogLevel( logger.LOG_LEVEL_DEBUG )
				initDebugEnvironment( logger )
			}

			this.debugMessageHandler = createDebugMessageHandler(
				this.globals,
				_.bind( this.start, this )
			)
		}


		var main = function() {
			this.globals             = undefined
			this.debugMessageHandler = undefined
			init.call( this, stageZeroConfig )
		}

		main.prototype = {
			start : start,

			/*
			 * This callback is called when the engine instance sends message to the editing environment.
			 *
			 * @param {Function} fn
			 */
			setSendMessageToEditor : function( fn ) {
				this.globals.logger.setSendMessageToEditor( fn )
			},

			/*
			 * This method is used to send debug messages to the engine instance.
			 *
			 * @param {Object} message
			 */
			sendDebugMessage : function( message ) {
				this.debugMessageHandler( message )
			},

			/**
			 * Sets the runtime module that the engine executes once it is started.
			 *
			 * @param {Object} module
			 */
			setRuntimeModule : function( module ) {
				this.globals.runtimeModule = module
			}
		}

		return new main()
	}
)
