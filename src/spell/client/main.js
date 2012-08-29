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
			var spell = this.spell

			spell.entityManager = new EntityManager( spell.templateManager )

			spell.logger.debug( 'loading resources completed' )

			PlatformKit.registerOnScreenResize(
				spell.configurationManager.id,
				_.bind( onScreenResize, null, spell.eventManager )
			)

			var renderingContextConfig = spell.renderingContext.getConfiguration()
			spell.logger.debug( 'created rendering context (' + renderingContextConfig.type + ')' )


			var sceneConfig = _.find(
				spell.runtimeModule.scenes,
				function( iter ) {
					return iter.name === spell.runtimeModule.startScene
				}
			)

			if( !sceneConfig ) throw 'Error: Could not find start scene \'' + spell.runtimeModule.startScene + '\'.'

			var anonymizeModuleIdentifiers = !spell.configurationManager.debug
			spell.sceneManager.startScene( sceneConfig, anonymizeModuleIdentifiers )

			spell.mainLoop.run()
		}

		var start = function( runtimeModule, cachedContent ) {
			var spell = this.spell
			spell.runtimeModule = runtimeModule

			if( !runtimeModule ) {
				throw 'Error: No runtime module defined. Please provide a runtime module.'
			}

			spell.logger.debug( 'client started' )

			var resourceLoader = new ResourceLoader(
				spell,
				spell.soundManager,
				spell.renderingContext,
				spell.eventManager,
				spell.configurationManager.resourceServer
			)

			if( cachedContent ) resourceLoader.setCache( cachedContent )

			_.extend(
				spell,
				{
					resourceLoader : resourceLoader,
					resources      : resourceLoader.getResources()
				}
			)

			loadResources(
				spell,
				_.bind( postLoadedResources, this )
			)
		}

		var init = function( config ) {
			var spell              = {},
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
				soundManager         = PlatformKit.createSoundManager(),
				inputManager         = new InputManager( configurationManager ),
				statisticsManager    = new StatisticsManager(),
				templateManager      = new TemplateManager(),
				mainLoop             = createMainLoop( eventManager, statisticsManager),
				sceneManager         = new SceneManager( spell, templateManager, mainLoop )

			statisticsManager.init()

			_.extend(
				spell,
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

			this.spell = spell


			if( config.debug ) {
				logger.setLogLevel( logger.LOG_LEVEL_DEBUG )
				initDebugEnvironment( logger )

				this.debugMessageHandler = createDebugMessageHandler(
					this.spell,
					_.bind( this.start, this )
				)
			}
		}


		var main = function() {
			this.spell               = undefined
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
				this.spell.logger.setSendMessageToEditor( fn )
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
