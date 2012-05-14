define(
	'spell/client/main',
	[
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

		'funkysnakes/client/zones/base',
		'funkysnakes/shared/util/createMainLoop',

		'underscore'
	],
	function(
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

		baseZone,
		createMainLoop,

		_,

		runtimeModule
	) {
		'use strict'


		// return spell entry point
		var eventManager         = new EventManager()
		var configurationManager = new ConfigurationManager( eventManager )

		var renderingContext = PlatformKit.RenderingFactory.createContext2d(
			eventManager,
			1024,
			768,
			configurationManager.renderingBackEnd
		)

		var soundManager         = PlatformKit.createSoundManager()
		var inputManager         = new InputManager( configurationManager )
		var resourceLoader       = new ResourceLoader( runtimeModule.name, soundManager, eventManager, configurationManager.resourceServer )
		var statisticsManager    = new StatisticsManager()

		statisticsManager.init()

		var globals = {
			configurationManager : configurationManager,
			eventManager         : eventManager,
			inputManager         : inputManager,
			inputEvents          : inputManager.getInputEvents(),
			renderingContext     : renderingContext,
			resourceLoader       : resourceLoader,
			statisticsManager    : statisticsManager,
			soundManager         : soundManager
		}


		// TODO: enter initial zone

		Logger.debug( 'client started' )

		var configurationManager = globals.configurationManager
		var resourceLoader       = globals.resourceLoader
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


		// TODO: the resource loader should create spell texture object instances instead of raw html images

		// HACK: creating textures out of images
		var resources = resourceLoader.getResources()
		var textures = {}

		_.each(
			resources,
			function( resource, resourceId ) {
				var extension =  _.last( resourceId.split( '.' ) )
				if( extension === 'png' || extension === 'jpg' ) {
					textures[ resourceId.replace(/images\//g, '') ] = renderingContext.createTexture( resource )
				}
			}
		)


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
				textures             : textures,
				sounds               : resources,
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
