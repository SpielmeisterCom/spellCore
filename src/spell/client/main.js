define(
	'spell/client/main',
	[
		'spell/client/development/createDebugMessageHandler',
		'spell/client/staticInclude',
		'spell/client/setApplicationModule',
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

			setApplicationModule( spell, configurationManager, applicationModule )

			spell.logger.setSendMessageToEditor( this.sendMessageToEditor )
			spell.logger.debug( 'client started' )

			if( cacheContent ) {
				libraryManager.addToCache( cacheContent )
			}

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

			var inputManager = new InputManager( configurationManager, spell.renderingContext )
			inputManager.init()

			spell.assetManager         = assetManager
			spell.configurationManager = configurationManager
			spell.moduleLoader         = moduleLoader
			spell.entityManager        = entityManager
			spell.box2dContext         = createBox2dContext()
			spell.box2dWorlds          = {}
			spell.sceneManager         = sceneManager
			spell.sendMessageToEditor  = this.sendMessageToEditor
			spell.translate            = translatePartial
			spell.inputManager         = inputManager

			if( configurationManager.getValue( 'mode' ) !== 'development_embedded' ) {
				spell.sceneManager.startScene( spell.applicationModule.startScene, {}, !isModeDevelopment )
			}

			spell.mainLoop.run()
		}

		var init = function( loaderConfig ) {
			var spell                = {},
				logger               = new Logger(),
				eventManager         = new EventManager(),
				configurationManager = new ConfigurationManager( eventManager ),
				statisticsManager    = new StatisticsManager(),
				mainLoop             = createMainLoop( eventManager, statisticsManager )

			configurationManager.setConfig( loaderConfig )

			statisticsManager.init()

			var renderingContext = PlatformKit.RenderingFactory.createContext2d(
				eventManager,
				configurationManager.getValue( 'id' ),
				configurationManager.getValue( 'currentScreenSize' )[ 0 ],
				configurationManager.getValue( 'currentScreenSize' )[ 1 ],
				configurationManager.getValue( 'renderingBackEnd' )
			)

			PlatformKit.registerOnScreenResize(
				eventManager,
				configurationManager.getValue( 'id' ),
				configurationManager.getValue( 'screenSize' )
			)

			logger.debug( 'created rendering context (' + renderingContext.getConfiguration().type + ')' )

			var audioContext = PlatformKit.AudioFactory.createAudioContext(
				configurationManager.getValue( 'audioBackEnd' )
			)

			logger.debug( 'created audio context (' + audioContext.getConfiguration().type + ')' )

			var libraryManager = new LibraryManager(
				eventManager,
				renderingContext,
				audioContext,
				configurationManager.getValue( 'libraryUrl' )
			)


			spell.audioContext         = audioContext
			spell.applicationModule    = undefined
			spell.configurationManager = configurationManager
			spell.eventManager         = eventManager
			spell.libraryManager       = libraryManager
			spell.loaderConfig         = loaderConfig
			spell.logger               = logger
			spell.mainLoop             = mainLoop
			spell.registerTimer        = PlatformKit.registerTimer
			spell.renderingContext     = renderingContext
			spell.scenes               = {}
			spell.statisticsManager    = statisticsManager
			spell.storage              = PlatformKit.createPersistentStorage()


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
				this.debugMessageHandler( message.payload, message.type )
			}
		}

		return new main()
	}
)
