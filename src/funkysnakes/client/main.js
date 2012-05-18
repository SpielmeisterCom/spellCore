define(
	'funkysnakes/client/main',
	[
		'funkysnakes/client/entities',
		'funkysnakes/client/zones/game',
		'funkysnakes/client/zones/init',
		'funkysnakes/shared/config/constants',
		'funkysnakes/shared/util/createMainLoop',
		'funkysnakes/shared/components/position',
		'funkysnakes/shared/components/orientation',
		'funkysnakes/shared/components/collisionCircle',
		'funkysnakes/shared/components/shield',
		'funkysnakes/shared/components/tailElement',
		'funkysnakes/shared/components/amountTailElements',
		'funkysnakes/shared/util/networkProtocol',

		'spell/client/components/network/markedForDestruction',
		'spell/shared/util/entities/Entities',
		'spell/shared/util/entities/EntityManager',
		'spell/client/util/network/network',
		'spell/client/util/network/createServerConnection',
		'spell/shared/util/zones/ZoneManager',
		'spell/shared/util/platform/PlatformKit',
		'spell/shared/util/Events',
		'spell/shared/util/Logger',
		'spell/shared/util/math',
		"spell/shared/util/platform/Types",
		'spell/client/main',

		'spell/shared/util/platform/underscore'
	],
	function(
		entities,
		game,
		init,
		constants,
		createMainLoop,
		position,
		orientation,
		collisionCircle,
		shield,
		tailElement,
		amountTailElements,
		networkProtocol,

		markedForDestruction,
		Entities,
		EntityManager,
		network,
		createServerConnection,
		ZoneManager,
		PlatformKit,
		Events,
		Logger,
		math,
		Types,
		spellMain,

		_
	) {
		'use strict'


		Logger.setLogLevel( Logger.LOG_LEVEL_DEBUG )

		// compute new color buffer dimensions when screen is resized
		var onScreenResized = function( eventManager, width, height ) {
			// clamping screen dimensions into allowed range
			width  = math.clamp( width, constants.minWidth, constants.maxWidth )
			height = math.clamp( height, constants.minHeight, constants.maxHeight )

			var aspectRatio = width / height

			// correcting aspect ratio
			if( aspectRatio <= ( 4 / 3 ) ) {
				height = Math.floor( width * 3 / 4 )

			} else {
				width = Math.floor( height * 4 / 3 )
			}

			eventManager.publish( Events.SCREEN_RESIZED, [ width, height ] )
		}

		var main = function( globals ) {
			Logger.debug( 'client started' )

			var configurationManager = globals.configurationManager
			var resourceLoader       = globals.resourceLoader
			var eventManager         = globals.eventManager
			var statisticsManager    = globals.statisticsManager

			PlatformKit.registerOnScreenResize( _.bind( onScreenResized, onScreenResized, eventManager ) )

			// creating entityManager
			var componentConstructors = {
				'markedForDestruction' : markedForDestruction,
				'position'             : position,
				'orientation'          : orientation,
				'collisionCircle'      : collisionCircle,
				'shield'               : shield,
				'tailElement'          : tailElement,
				'amountTailElements'   : amountTailElements
			}

			globals.entityManager = new EntityManager( entities, componentConstructors )


			var renderingContext       = globals.renderingContext
			var renderingContextConfig = renderingContext.getConfiguration()

			Logger.debug( 'created rendering context: type=' + renderingContextConfig.type + '; size=' + renderingContextConfig.width + 'x' + renderingContextConfig.height )


			var zones = {
				game  : game,
				init  : init
			}

			var zoneManager = new ZoneManager( eventManager, zones, globals )

			_.extend(
				globals,
				{
					configurationManager : configurationManager,
					eventManager         : eventManager,
					textures             : {},
					zoneManager          : zoneManager
				}
			)

			zoneManager.createZone( 'init' )

			var mainLoop = createMainLoop( eventManager, statisticsManager )

			PlatformKit.callNextFrame( mainLoop )
		}

		spellMain( 'funkysnakes', main )
	}
)
