define(
	'spell/client/main',
	[
		'spell/client/loading/loadResources',
		'spell/client/staticInclude',
		'spell/shared/util/createMainLoop',
		'spell/EntityManager',
		'spell/shared/util/scene/SceneManager',
		'spell/shared/util/template/TemplateManager',
		'spell/shared/util/ConfigurationManager',
		'spell/shared/util/EventManager',
		'spell/shared/util/InputManager',
		'spell/client/loading/ResourceLoader',
		'spell/shared/util/StatisticsManager',
		'spell/shared/util/Logger',
		'spell/shared/util/createDebugMessageHandler',
		'spell/shared/util/platform/PlatformKit',
		'spell/shared/util/platform/initDebugEnvironment',

		'spell/functions'
	],
	function(
		loadResources,
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
			var spell = this.spell

			spell.EntityManager = new EntityManager( spell.eventManager, spell.templateManager )
			spell.sceneManager  = new SceneManager( spell, spell.EntityManager, spell.templateManager, spell.mainLoop )

			spell.logger.debug( 'loading resources completed' )

			PlatformKit.registerOnScreenResize( spell.eventManager, spell.configurationManager.id, spell.configurationManager.screenSize )

			var renderingContextConfig = spell.renderingContext.getConfiguration()
			spell.logger.debug( 'created rendering context (' + renderingContextConfig.type + ')' )


			var sceneConfig = spell.scenes[ spell.runtimeModule.startScene ]

			if( !sceneConfig ) throw 'Error: Could not find start scene \'' + spell.runtimeModule.startScene + '\'.'

			var anonymizeModuleIds = spell.configurationManager.mode === 'deployed'
			spell.sceneManager.startScene( sceneConfig, anonymizeModuleIds )

			spell.mainLoop.run()
		}

		var start = function( runtimeModule, cacheContent ) {
			var spell = this.spell
			spell.runtimeModule = runtimeModule

			if( !runtimeModule ) {
				throw 'Error: No runtime module defined. Please provide a runtime module.'
			}

			spell.logger.setSendMessageToEditor( this.sendMessageToEditor )
			spell.logger.debug( 'client started' )

			var configurationManager = new ConfigurationManager( spell.eventManager, spell.loaderConfig, runtimeModule.config )

			var renderingContext = PlatformKit.RenderingFactory.createContext2d(
				spell.eventManager,
				configurationManager.id,
				1,
				1,
				configurationManager.renderingBackEnd
			)

			var inputManager = new InputManager( configurationManager )

			var resourceLoader = new ResourceLoader( spell, spell.eventManager, renderingContext, configurationManager.resourceServer )

			if( cacheContent ) resourceLoader.setCache( cacheContent )

			_.extend(
				spell,
				{
					configurationManager : configurationManager,
					inputEvents          : inputManager.getInputEvents(),
					inputManager         : inputManager,
					renderingContext     : renderingContext,
					resourceLoader       : resourceLoader,
					resources            : resourceLoader.getCache()
				}
			)

			loadResources(
				spell,
				this.sendMessageToEditor,
				_.bind( postLoadedResources, this )
			)
		}

		var init = function( loaderConfig ) {
			var spell             = {},
				assets            = {},
				scenes            = {},
				logger            = new Logger(),
				eventManager      = new EventManager(),
				soundManager      = PlatformKit.createSoundManager(),
				statisticsManager = new StatisticsManager(),
				templateManager   = new TemplateManager( assets ),
				mainLoop          = createMainLoop( eventManager, statisticsManager )

			statisticsManager.init()

			_.extend(
				spell,
				{
					assets               : assets,
					eventManager         : eventManager,
					loaderConfig         : loaderConfig,
					logger               : logger,
					mainLoop             : mainLoop,
					runtimeModule        : undefined,
					soundManager         : soundManager,
					scenes               : scenes,
					statisticsManager    : statisticsManager,
					templateManager      : templateManager
				}
			)

			this.spell = spell


			if( loaderConfig.mode !== 'deployed' ) {
				logger.setLogLevel( logger.LOG_LEVEL_DEBUG )
				initDebugEnvironment( logger )

				this.debugMessageHandler = createDebugMessageHandler(
					this.spell,
					_.bind( this.start, this )
				)
			}
		}


		var main = function() {
			this.spell
			this.debugMessageHandler
			this.sendMessageToEditor

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
				this.sendMessageToEditor = fn
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
