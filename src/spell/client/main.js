define(
	'spell/client/main',
	[
		'spell/client/createSpell',
		'spell/client/development/createDebugMessageHandler',
		'spell/client/isDebug',
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
		'spell/PluginManager',
		'spell/StatisticsManager',
		'spell/Console',
        'spell/shared/util/physics/createPhysicsContext',
		'spell/shared/util/platform/PlatformKit',
		'spell/shared/util/platform/initDebugEnvironment',
        'spell/shared/util/translate',

		'spell/functions'
	],
	function(
		createSpell,
		createDebugMessageHandler,
		isDebug,
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
		PluginManager,
		StatisticsManager,
		Console,
        createPhysicsContext,
		PlatformKit,
		initDebugEnvironment,
        translate,

		_,

		// configuration parameters passed in from stage zero loader
		stageZeroConfig
	) {
		'use strict'


		var preStart = function( applicationModule, cacheContent ) {
			PlatformKit.init( this.spell, _.bind( start, this, applicationModule, cacheContent ) )
		}

		var start = function( applicationModule, cacheContent ) {
			var spell                = this.spell,
				eventManager         = spell.eventManager,
				configurationManager = spell.configurationManager,
				libraryManager       = spell.libraryManager

			setApplicationModule(
                spell,
                configurationManager,
				PlatformKit.platformDetails.getTarget(),
                applicationModule,
                spell.loaderConfig
            )

			spell.console.setSendMessageToEditor( this.sendMessageToEditor )

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

			spell.console.debug( 'created rendering context (' + renderingContext.getConfiguration().type + ')' )


			// creating audio context
			var audioContext = PlatformKit.AudioFactory.createAudioContext(
				configurationManager.getValue( 'audioBackEnd' )
			)

			spell.console.debug( 'created audio context (' + audioContext.getConfiguration().type + ')' )


			libraryManager.init( audioContext, renderingContext )


			var assetManager = new AssetManager( libraryManager )

			var isModeDevelopment = configurationManager.getValue( 'mode' ) !== 'deployed'

			var moduleLoader = createModuleLoader( libraryManager, isModeDevelopment, configurationManager.getValue( 'libraryUrl' ) )

			var entityManager = new EntityManager( spell, configurationManager, assetManager, spell.eventManager, libraryManager, moduleLoader )

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
            spell.physicsContext       = createPhysicsContext()
            spell.physicsWorlds        = {}
			spell.renderingContext     = renderingContext
			spell.sceneManager         = sceneManager
			spell.sendMessageToEditor  = this.sendMessageToEditor
			spell.translate            = translatePartial
			spell.inputManager         = inputManager
			spell.environment          = PlatformKit.createEnvironment( configurationManager, eventManager )
			spell.env                  = spell.environment
			spell.libraryManager       = libraryManager

			spell.console.debug( 'client started' )

			var run = function() {
				spell.sceneManager.startScene( spell.applicationModule.startScene, undefined, !isModeDevelopment )
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
			var spell                = createSpell(),
				console              = new Console(),
				eventManager         = new EventManager(),
				configurationManager = new ConfigurationManager( eventManager ),
				statisticsManager    = new StatisticsManager(),
				mainLoop             = createMainLoop( eventManager, statisticsManager, isDebug ),
				isModeDeployed       = loaderConfig.mode === 'deployed'

			statisticsManager.init()

			spell.applicationModule    = undefined
			spell.configurationManager = configurationManager
			spell.eventManager         = eventManager
			spell.loaderConfig         = loaderConfig
			spell.console              = console
			spell.mainLoop             = mainLoop
			spell.registerTimer        = PlatformKit.registerTimer
			spell.scenes               = {}
			spell.statisticsManager    = statisticsManager
			spell.storage              = PlatformKit.createPersistentStorage()
			spell.pluginManager        = new PluginManager()
            spell.libraryManager       = new LibraryManager( eventManager, configurationManager.getValue( 'libraryUrl' ), isModeDeployed )

			this.spell = spell

			if( !isModeDeployed ) {
				console.setLogLevel( console.LOG_LEVEL_DEBUG )
				initDebugEnvironment( console )

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
			start : preStart,

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
