define(
	'funkysnakes/client/zones/init',
	[
		'funkysnakes/shared/util/networkProtocol',
		"funkysnakes/client/systems/updateRenderData",
		'funkysnakes/client/systems/ProgressPatternUpdater',
		'funkysnakes/client/systems/Renderer',

		'spell/shared/util/entities/Entities',
		'spell/shared/util/entities/datastructures/passIdMultiMap',
		'spell/shared/util/network/Messages',
		'spell/shared/util/zones/ZoneEntityManager',
		'spell/client/util/network/createServerConnection',
		'spell/client/util/network/network',
		'spell/shared/util/Events',
		'spell/shared/util/Logger',

		'spell/functions'
	],
	function(
		networkProtocol,
		updateRenderData,
		ProgressPatternUpdater,
		Renderer,

		Entities,
		passIdMultiMap,
		Messages,
		ZoneEntityManager,
		createServerConnection,
		network,
		Events,
		Logger,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var loadingTextImage = 'calibrating_holomatrix.png'

		var initZoneResources = [
			'images/' + loadingTextImage
		]

		var gameZoneResources = [
			'images/4.2.04_256.png',
			'images/web/tile.jpg',
			'images/web/menu.png',
			'images/web/logo.png',
			'images/html5_logo_64x64.png',
			'images/flash_logo_64x64.png',
			'images/help_controls.png',
			'images/environment/cloud_dark_02.png',
			'images/environment/cloud_dark_07.png',
			'images/environment/cloud_light_05.png',
			'images/environment/cloud_light_07.png',
			'images/environment/cloud_dark_03.png',
			'images/environment/cloud_light_04.png',
			'images/environment/arena.png',
			'images/environment/cloud_dark_05.png',
			'images/environment/cloud_dark_06.png',
			'images/environment/cloud_dark_01.png',
			'images/environment/cloud_light_01.png',
			'images/environment/ground.jpg',
			'images/environment/cloud_light_06.png',
			'images/environment/cloud_light_03.png',
			'images/environment/cloud_dark_04.png',
			'images/environment/cloud_light_02.png',
			'images/items/neutral_container.png',
			'images/items/object_energy.png',
			'images/items/player4_container.png',
			'images/items/dropped_container_1.png',
			'images/items/player3_container.png',
			'images/items/player1_container.png',
			'images/items/dropped_container_0.png',
			'images/items/invincible.png',
			'images/items/player2_container.png',
			'images/shadows/object_energy.png',
			'images/shadows/invincible.png',
			'images/shadows/container.png',
			'images/shadows/vehicle.png',
			'images/tile_cloud.png',
			'images/tile_cloud2.png',
			'images/vehicles/ship_player1.png',
			'images/vehicles/ship_player1_speed.png',
			'images/vehicles/ship_player1_invincible.png',
			'images/vehicles/ship_player2.png',
			'images/vehicles/ship_player2_speed.png',
			'images/vehicles/ship_player2_invincible.png',
			'images/vehicles/ship_player3.png',
			'images/vehicles/ship_player3_speed.png',
			'images/vehicles/ship_player3_invincible.png',
			'images/vehicles/ship_player4.png',
			'images/vehicles/ship_player4_speed.png',
			'images/vehicles/ship_player4_invincible.png',
			'images/effects/shield.png',
			'images/arrow_left.png',
			'images/arrow_left_pressed.png',
			'images/arrow_right.png',
			'images/arrow_right_pressed.png',
			'images/speaker_mute.png',
			'images/speaker.png',
			'images/space.png',
			'images/space_pressed.png',
			'images/ttf/batang_0.png',
			'images/ttf/BelloPro_0.png',
			'sounds/sets/set1.json'
		]


		function updateTextures( renderingContext, resources, textures ) {
			// TODO: the resource loader should create spell texture object instances instead of raw html images

			// HACK: creating textures out of images
			_.each(
				resources,
				function( resource, resourceId ) {
					var extension =  _.last( resourceId.split( '.' ) )
					if( extension === 'png' || extension === 'jpg' ) {
						textures[ resourceId.replace(/images\//g, '') ] = renderingContext.createTexture( resource )
					}
				}
			)

			return textures
		}

		function addLoadingIcon( entityManager, position ) {
			entityManager.createEntity(
				"widget",
				[ {
					position  : position,
					textureId : loadingTextImage
				} ]
			)
		}

		function update(
			globals,
			timeInMs,
			dtInS
		) {
		}

		function render(
			globals,
			timeInMs,
			deltaTimeInMs
		) {
			var entities = this.entities,
				queryIds = this.queryIds

			this.progressPatternUpdater.process()

			updateRenderData(
				entities.executeQuery( queryIds[ "updateRenderData" ][ 0 ] ).elements
			)

			this.renderer.process(
				timeInMs,
				deltaTimeInMs,
				entities.executeQuery( queryIds[ "render" ][ 0 ] ).multiMap,
				[]
			)
		}

		return {
			onCreate: function( globals ) {
				var eventManager         = globals.eventManager,
					configurationManager = globals.configurationManager,
					statisticsManager    = globals.statisticsManager,
					resourceLoader       = globals.resourceLoader,
					zoneManager          = globals.zoneManager

				var entities  = new Entities()
				this.entities = entities

				var entityManager  = new ZoneEntityManager( globals.entityManager, this.entities )
				this.entityManager = entityManager

				this.renderer = new Renderer( eventManager, globals.textures, globals.renderingContext )

				// WORKAROUND: manually triggering SCREEN_RESIZED event to force the renderer to reinitialize the canvas
				eventManager.publish(
					Events.SCREEN_RESIZED,
					[ globals.configurationManager.screenSize.width, globals.configurationManager.screenSize.height ]
				)


				this.progressPatternUpdater = new ProgressPatternUpdater( eventManager, entityManager )


				this.queryIds = {
					render: [
						entities.prepareQuery( [ "position", "appearance", "renderData" ], passIdMultiMap )
					],
					updateRenderData: [
						entities.prepareQuery( [ "position", "renderData" ] )
					]
				}

				this.renderCallback = _.bind( render, this, globals )
				this.updateCallback = _.bind( update, this, globals )

				eventManager.subscribe( Events.RENDER_UPDATE, this.renderCallback )
				eventManager.subscribe( [ Events.LOGIC_UPDATE, '20' ], this.updateCallback )


				eventManager.subscribe(
					[ Events.MESSAGE_RECEIVED, Messages.ZONE_CHANGE ],
					function( messageType, messageData ) {
						Logger.debug( 'received zone change message' )

						// discard entity updates from the previous zone
						connection.messages[ Messages.DELTA_STATE_UPDATE ] = []

						var currentZone = zoneManager.activeZones()[ 0 ],
							newZone     = messageData

						zoneManager.destroyZone( currentZone )
						zoneManager.createZone( newZone )
					}
				)


				var connection

				eventManager.waitFor(
					Events.SERVER_CONNECTION_ESTABLISHED

				).resume( function() {
					Logger.debug( 'connection to server established' )

					eventManager.waitFor(
						[ Events.RESOURCE_LOADING_COMPLETED, 'initZoneResources' ]

					).resume( function() {
						eventManager.waitFor(
							[ Events.RESOURCE_LOADING_COMPLETED, 'gameZoneResources' ]

						).and(
							Events.CLOCK_SYNC_ESTABLISHED

						).resume( function() {
							Logger.debug( 'finished loading game zone resources' )
							Logger.debug( 'clock synchronization established' )

							updateTextures( globals.renderingContext, resourceLoader.getResources(), globals.textures )

							connection.send( Messages.JOIN_ANY_GAME )
						} )

						Logger.debug( 'finished loading init zone resources' )
						updateTextures( globals.renderingContext, resourceLoader.getResources(), globals.textures )

						// TODO: add animation
						addLoadingIcon( entityManager, [ 384, 96, 0 ] )

						// trigger loading of game zone resources
						resourceLoader.addResourceBundle( 'gameZoneResources', gameZoneResources )
						resourceLoader.start()

						// start clock synchronization
						network.initializeClockSync( eventManager, statisticsManager, connection )
					} )

					// trigger loading of init zone resources
					resourceLoader.addResourceBundle( 'initZoneResources', initZoneResources )
					resourceLoader.start()
				} )

				Logger.debug( 'connecting to game-server "' + configurationManager.gameServer.host + '"' )

				connection = createServerConnection( eventManager, statisticsManager, configurationManager.gameServer.host, networkProtocol )
				globals.connection = connection
			},

			onDestroy: function( globals ) {
				var eventManager = globals.eventManager

				eventManager.unsubscribe( Events.RENDER_UPDATE, this.renderCallback )
				eventManager.unsubscribe( [ Events.LOGIC_UPDATE, '20' ], this.updateCallback )
			}
		}
	}
)
