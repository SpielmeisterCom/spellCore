define(
	'spell/client/main',
	[
		'spell/client/util/loadResources',
		'spell/client/util/onScreenResize',
		'spell/client/staticInclude',
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

		'spell/functions'
	],
	function(
		loadResources,
		onScreenResize,
		staticInclude,
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

		var start = function( runtimeModule, cachedContent ) {
			var globals = this.globals
			globals.runtimeModule = runtimeModule

			if( !runtimeModule ) {
				throw 'Error: No runtime module defined. Please provide a runtime module.'
			}

			globals.logger.debug( 'client started' )

			var resourceLoader = new ResourceLoader(
				globals,
				globals.soundManager,
				globals.renderingContext,
				globals.eventManager,
				globals.configurationManager.resourceServer
			)

			if( cachedContent ) resourceLoader.setCache( cachedContent )

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
			}
		}

		return new main()
	}
)
