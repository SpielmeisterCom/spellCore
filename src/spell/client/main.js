define(
	'spell/client/main',
	[
		'spell/client/development/createDebugMessageHandler',
		'spell/client/staticInclude',
		'spell/shared/util/createMainLoop',
		'spell/EntityManager',
		'spell/SceneManager',
		'spell/shared/util/template/TemplateManager',
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
		createMainLoop,
		EntityManager,
		SceneManager,
		TemplateManager,
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

			var audioContext = PlatformKit.AudioFactory.createAudioContext(
				configurationManager.getValue( 'audioBackEnd' )
			)

			spell.logger.debug( 'created audio context (' + audioContext.getConfiguration().type + ')' )

			var storage = PlatformKit.createPersistentStorage()

			var libraryManager = new LibraryManager(
				spell.eventManager,
				renderingContext,
				audioContext,
				configurationManager.getValue( 'resourceServer' ),
				configurationManager.getValue( 'baseUrlPrefix' )
			)

			if( cacheContent ) libraryManager.addToCache( cacheContent )

			var assetManager = new AssetManager( libraryManager )

			var isModeDevelopment = configurationManager.getValue( 'mode' ) !== 'deployed'

			var moduleLoader = createModuleLoader( libraryManager, isModeDevelopment )

			var templateManager = new TemplateManager( assetManager, moduleLoader )

			var entityManager = new EntityManager( spell, configurationManager, spell.eventManager, templateManager )

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

			_.extend(
				spell,
				{
					assetManager         : assetManager,
					configurationManager : configurationManager,
					renderingContext     : renderingContext,
					audioContext         : audioContext,
					libraryManager       : libraryManager,
					moduleLoader         : moduleLoader,
					templateManager      : templateManager,
					entityManager        : entityManager,
					box2dContext         : createBox2dContext(),
					box2dWorlds          : {},
					sceneManager         : sceneManager,
					sendMessageToEditor  : this.sendMessageToEditor,
					storage              : storage,
                    translate            : translatePartial
				}
			)

			// the inputManager must be registered after the renderingContext has been assigned to the spell Object
			var inputManager = new InputManager( configurationManager, renderingContext )
			inputManager.init()
			spell.inputManager = inputManager

			spell.sceneManager.startScene( spell.runtimeModule.startScene, {}, !isModeDevelopment )
			spell.mainLoop.run()
		}

		var init = function( loaderConfig ) {
			var spell             = {},
				scenes            = {},
				logger            = new Logger(),
				eventManager      = new EventManager(),
				statisticsManager = new StatisticsManager(),
				mainLoop          = createMainLoop( eventManager, statisticsManager )

			statisticsManager.init()

			_.extend(
				spell,
				{
					eventManager      : eventManager,
					loaderConfig      : loaderConfig,
					logger            : logger,
					mainLoop          : mainLoop,
					runtimeModule     : undefined,
					scenes            : scenes,
					statisticsManager : statisticsManager
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
				this.debugMessageHandler( message.payload, message.type )
			}
		}

		return new main()
	}
)
