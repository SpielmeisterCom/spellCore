define(
	'spell/client/main',
	[
		'funkysnakes/client/zones/base',

		'spell/client/runtimeModule',
		'spell/shared/util/createMainLoop',
		'spell/shared/util/entities/EntityManager',
		'spell/shared/util/zones/ZoneManager',
		'spell/shared/util/blueprints/BlueprintManager',
		'spell/shared/util/ConfigurationManager',
		'spell/shared/util/EventManager',
		'spell/shared/util/InputManager',
		'spell/shared/util/ResourceLoader',
		'spell/shared/util/StatisticsManager',
		'spell/shared/util/Events',
		'spell/shared/util/Logger',
		'spell/shared/util/platform/PlatformKit',

		'spell/shared/util/platform/underscore'
	],
	function(
		baseZone,

		runtimeModule,
		createMainLoop,
		EntityManager,
		ZoneManager,
		BlueprintManager,
		ConfigurationManager,
		EventManager,
		InputManager,
		ResourceLoader,
		StatisticsManager,
		Events,
		Logger,
		PlatformKit,

		_,

		// configuration parameters passed in from stage zero loader
		parameters
	) {
		'use strict'


		if( parameters.verbose ) {
			Logger.setLogLevel( Logger.LOG_LEVEL_DEBUG )
		}

		var eventManager         = new EventManager()
		var configurationManager = new ConfigurationManager( eventManager, parameters )

		var renderingContext = PlatformKit.RenderingFactory.createContext2d(
			eventManager,
			configurationManager.id,
			1024,
			768,
			configurationManager.renderingBackEnd
		)

		var soundManager         = PlatformKit.createSoundManager()
		var inputManager         = new InputManager( configurationManager )
		var resourceLoader       = new ResourceLoader( runtimeModule.name, soundManager, renderingContext, eventManager, configurationManager.resourceServer )
		var statisticsManager    = new StatisticsManager()

		statisticsManager.init()

		var globals = {
			configurationManager : configurationManager,
			eventManager         : eventManager,
			inputManager         : inputManager,
			inputEvents          : inputManager.getInputEvents(),
			renderingContext     : renderingContext,
			resourceLoader       : resourceLoader,
			resources            : resourceLoader.getResources(),
			statisticsManager    : statisticsManager,
			soundManager         : soundManager
		}


		// TODO: enter initial zone

		Logger.debug( 'client started' )

		var configurationManager = globals.configurationManager
		var eventManager         = globals.eventManager
		var statisticsManager    = globals.statisticsManager

//		PlatformKit.registerOnScreenResize( _.bind( onScreenResized, onScreenResized, eventManager ) )

		// creating entityManager
//		var componentConstructors = {
//			'markedForDestruction' : markedForDestruction,
//			'position'             : position,
//			'orientation'          : orientation,
//			'collisionCircle'      : collisionCircle,
//			'shield'               : shield,
//			'tailElement'          : tailElement,
//			'amountTailElements'   : amountTailElements
//		}

//		globals.entityManager = new EntityManager( entities, componentConstructors )


		var renderingContext       = globals.renderingContext
		var renderingContextConfig = renderingContext.getConfiguration()

		Logger.debug( 'created rendering context: type=' + renderingContextConfig.type + '; size=' + renderingContextConfig.width + 'x' + renderingContextConfig.height )


		var zones = {
			base: baseZone
		}

		var zoneManager = new ZoneManager( eventManager, zones, globals )

		var blueprintManager = new BlueprintManager()

		_.each(
			runtimeModule.componentBlueprints,
			function( componentBlueprint ) {
				blueprintManager.add( componentBlueprint )
			}
		)

		_.each(
			runtimeModule.entityBlueprints,
			function( entityBlueprint ) {
				blueprintManager.add( entityBlueprint )
			}
		)

		var entityManager = new EntityManager( blueprintManager )

		_.extend(
			globals,
			{
				configurationManager : configurationManager,
				entityManager        : entityManager,
				eventManager         : eventManager,
				zoneManager          : zoneManager
			}
		)


		var startZone = _.find(
			runtimeModule.zones,
			function( iter ) {
				return iter.name === runtimeModule.startZone
			}
		)

		zoneManager.createZone( 'base', startZone )


		var mainLoop = createMainLoop( eventManager, statisticsManager )

		PlatformKit.callNextFrame( mainLoop )
	}
)
