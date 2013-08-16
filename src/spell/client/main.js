define(
	'spell/client/main',
	[
		'spell/client/development/createDebugMessageHandler',
		'spell/client/staticInclude',
		'spell/client/setApplicationModule',
		'spell/client/showSplashScreen',
		'spell/shared/util/createMainLoop',
		'spell/EntityManager',
		'spell/SceneManager',
		'spell/AssetManager',
		'spell/ConfigurationManager',
		'spell/EventManager',
		'spell/InputManager',
		'spell/LibraryManager',
		'spell/shared/util/createModuleLoader',
		'spell/StatisticsManager',
		'spell/shared/util/Logger',
		'spell/shared/util/physics/createBox2dContext',
		'spell/shared/util/platform/PlatformKit',
		'spell/shared/util/platform/initDebugEnvironment',
        'spell/shared/util/translate',

		'spell/functions'
	],
	function(
		createDebugMessageHandler,
		staticInclude,
		setApplicationModule,
		showSplashScreen,
		createMainLoop,
		EntityManager,
		SceneManager,
		AssetManager,
		ConfigurationManager,
		EventManager,
		InputManager,
		LibraryManager,
		createModuleLoader,
		StatisticsManager,
		Logger,
		createBox2dContext,
		PlatformKit,
		initDebugEnvironment,
        translate,

		_,

		// configuration parameters passed in from stage zero loader
		stageZeroConfig
	) {
		'use strict'


		var start = function( applicationModule, cacheContent ) {
			var spell                = this.spell,
				configurationManager = spell.configurationManager,
				libraryManager       = spell.libraryManager

			setApplicationModule(
                spell,
                configurationManager,
                applicationModule,
                applicationModule.config,
                spell.loaderConfig
            )

			spell.logger.setSendMessageToEditor( this.sendMessageToEditor )

			if( cacheContent ) {
				libraryManager.addToCache( cacheContent )
			}

			// creating rendering context
			var renderingContext = PlatformKit.RenderingFactory.createContext2d(
				spell.eventManager,
				configurationManager.getValue( 'id' ),
				configurationManager.getValue( 'currentScreenSize' )[ 0 ],
				configurationManager.getValue( 'currentScreenSize' )[ 1 ],
				configurationManager.getValue( 'renderingBackEnd' )
			)

			PlatformKit.registerOnScreenResize(
				spell.eventManager,
				configurationManager.getValue( 'id' ),
				configurationManager.getValue( 'screenSize' )
			)

			spell.logger.debug( 'created rendering context (' + renderingContext.getConfiguration().type + ')' )


			// creating audio context
			var audioContext = PlatformKit.AudioFactory.createAudioContext(
				configurationManager.getValue( 'audioBackEnd' )
			)

			spell.logger.debug( 'created audio context (' + audioContext.getConfiguration().type + ')' )


			spell.libraryManager.init( audioContext, renderingContext )


			var assetManager = new AssetManager( libraryManager )

			var isModeDevelopment = configurationManager.getValue( 'mode' ) !== 'deployed'

			var moduleLoader = createModuleLoader( libraryManager, isModeDevelopment, configurationManager.getValue( 'libraryUrl' ) )

			var entityManager = new EntityManager( spell, configurationManager, assetManager, spell.eventManager, libraryManager, moduleLoader )

			entityManager.init()

			var sceneManager = new SceneManager(
				spell,
				entityManager,
				spell.statisticsManager,
				libraryManager,
				spell.mainLoop,
				this.sendMessageToEditor,
				isModeDevelopment
			)

			var translatePartial = _.bind(
				translate,
				null,
				libraryManager,
				configurationManager.getValue( 'currentLanguage' )
			)

			var inputManager = new InputManager( configurationManager, renderingContext )
			inputManager.init()

			spell.audioContext         = audioContext
			spell.assetManager         = assetManager
			spell.configurationManager = configurationManager
			spell.moduleLoader         = moduleLoader
			spell.entityManager        = entityManager
			spell.box2dContext         = createBox2dContext()
			spell.box2dWorlds          = {}
			spell.renderingContext     = renderingContext
			spell.sceneManager         = sceneManager
			spell.sendMessageToEditor  = this.sendMessageToEditor
			spell.translate            = translatePartial
			spell.inputManager         = inputManager

			spell.logger.debug( 'client started' )

			var run = function() {
				spell.sceneManager.startScene( spell.applicationModule.startScene, {}, !isModeDevelopment )
				spell.mainLoop.run()
			}

			if( applicationModule.environment &&
				applicationModule.environment.forceSplashScreen ) {

				showSplashScreen( spell, run )

			} else {
				run()
			}
		}

		var init = function( loaderConfig ) {
			var spell                = {},
				logger               = new Logger(),
				eventManager         = new EventManager(),
				configurationManager = new ConfigurationManager( eventManager ),
				statisticsManager    = new StatisticsManager(),
				mainLoop             = createMainLoop( eventManager, statisticsManager ),
				isModeDeployed       = loaderConfig.mode === 'deployed'

			configurationManager.setConfig( loaderConfig )

			statisticsManager.init()

			spell.applicationModule    = undefined
			spell.configurationManager = configurationManager
			spell.eventManager         = eventManager
			spell.libraryManager       = new LibraryManager( eventManager, configurationManager.getValue( 'libraryUrl' ), isModeDeployed )
			spell.loaderConfig         = loaderConfig
			spell.logger               = logger
			spell.mainLoop             = mainLoop
			spell.registerTimer        = PlatformKit.registerTimer
			spell.scenes               = {}
			spell.statisticsManager    = statisticsManager
			spell.storage              = PlatformKit.createPersistentStorage()

			this.spell = spell

			if( !isModeDeployed ) {
				logger.setLogLevel( logger.LOG_LEVEL_DEBUG )
				initDebugEnvironment( logger )

				this.debugMessageHandler = createDebugMessageHandler(
					spell,
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
				this.debugMessageHandler( message.payload, message.type )
			}
		}

		return new main()
	}
)
