define(
	"funkysnakes/client/zones/game",
	[
		"funkysnakes/client/util/createClouds",
		"funkysnakes/client/systems/animateClouds",
		"funkysnakes/client/systems/applyPowerupEffects",
		"funkysnakes/client/systems/fade",
		"funkysnakes/client/systems/interpolateNetworkData",
		"funkysnakes/client/systems/Renderer",
		"funkysnakes/client/systems/debugRenderer",
		"funkysnakes/client/systems/renderPerformanceGraph",
		"funkysnakes/client/systems/sendActorStateUpdate",
		"funkysnakes/client/systems/updateHoverAnimations",
		"funkysnakes/client/systems/updateRenderData",
		"funkysnakes/client/systems/updateScoreDisplays",
		"funkysnakes/shared/config/constants",
		"funkysnakes/shared/config/players",
		"funkysnakes/shared/systems/integrateOrientation",
		"funkysnakes/shared/systems/moveTailElements",

        "spell/client/systems/uiSystem",
        "spell/client/systems/sound/processSound",
		"spell/client/systems/input/processLocalKeyInput",
		"spell/client/systems/network/destroyEntities",
		"spell/client/systems/network/processEntityUpdates",
        "spell/client/util/ui/createUiManager",
		"spell/shared/util/entities/Entities",
		"spell/shared/util/entities/datastructures/entityMap",
		"spell/shared/util/entities/datastructures/passIdMultiMap",
		"spell/shared/util/entities/datastructures/multiMap",
		"spell/shared/util/entities/datastructures/singleton",
		"spell/shared/util/entities/datastructures/sortedArray",
		"spell/shared/util/zones/ZoneEntityManager",
		"spell/shared/util/Events",
		"spell/shared/util/platform/PlatformKit",
		"spell/shared/util/platform/Types"
	],
	function(
		createClouds,
		animateClouds,
		applyPowerupEffects,
		fade,
		interpolateNetworkData,
		Renderer,
        debugRenderer,
		renderPerformanceGraph,
		sendActorStateUpdate,
		updateHoverAnimations,
		updateRenderData,
		updateScoreDisplays,
		constants,
		players,
		integrateOrientation,
		moveTailElements,

        uiSystem,
		processSound,
		processLocalKeyInput,
		destroyEntities,
		processEntityUpdates,
        createUiManager,
		Entities,
		entityMap,
		passIdMultiMap,
		multiMap,
		singleton,
		sortedArray,
		ZoneEntityManager,
		Events,
		PlatformKit,
		Types
	) {
		"use strict"


		function addPlatformLogo( entityManager, platform ) {
			var textureId

			if( platform === 'html5' ) {
				textureId = 'html5_logo_64x64.png'

			} else if( platform === 'flash' ) {
				textureId = 'flash_logo_64x64.png'
			}

			if( !textureId ) return

			entityManager.createEntity(
				"widget",
				[ {
					position  : [ 5, 694, 0 ],
					textureId : textureId
				} ]
			)
		}


		var timeStampInMs = 0,
			newTimeStampInMs = 0,
			timeSpentInMs = 0

		function updateZone(
			timeInMs,
			dtInS,
			globals
		) {
			var entities      = this.entities
			var entityManager = this.entityManager
			var queryIds      = this.queryIds

			var connection  = globals.connection
			var inputEvents = globals.inputEvents
		}

		function renderZone(
			timeInMs,
			deltaTimeInMs,
			globals
		) {
			var entities      = this.entities
			var entityManager = this.entityManager
			var queryIds      = this.queryIds

			var connection        = globals.connection
			var inputEvents       = globals.inputEvents
			var statisticsManager = globals.statisticsManager
			var sounds            = globals.sounds

			statisticsManager.startTick()

			processLocalKeyInput(
				timeInMs,
				inputEvents,
				entities.executeQuery( queryIds[ "processLocalKeyInput" ][ 0 ] ).elements,
				entities.executeQuery( queryIds[ "processLocalKeyInput" ][ 1 ] ).elements
			)
            this.uiSystem.process(
                inputEvents,
                entities.executeQuery( queryIds[ "uiEntities" ][ 0 ] ).elements
            )
			sendActorStateUpdate(
				connection,
				entities.executeQuery( queryIds[ "playerEntities" ][ 0 ] ).singleton
			)
			processEntityUpdates(
				entities.executeQuery( queryIds[ "processEntityUpdates" ][ 0 ] ).entityMap,
				entityManager,
				connection.messages
			)
			interpolateNetworkData(
				timeInMs,
				entities.executeQuery( queryIds[ "interpolateNetworkData" ][ 0 ] ).elements,
				entityManager
			)
			moveTailElements(
				deltaTimeInMs / 1000,
				entities.executeQuery( queryIds[ "moveTailElements" ][ 0 ] ).elements,
				entities.executeQuery( queryIds[ "moveTailElements" ][ 1 ] ).multiMap
			)
			updateScoreDisplays(
				entities.executeQuery( queryIds[ "updateScoreDisplays" ][ 0 ] ).elements,
				entities.executeQuery( queryIds[ "updateScoreDisplays" ][ 1 ] ).elements
			)
			destroyEntities(
				timeInMs,
				constants.interpolationDelay,
				entities.executeQuery( queryIds[ "destroyEntities" ][ 0 ] ).elements,
				entities.executeQuery( queryIds[ "destroyEntities" ][ 1 ] ).elements,
				entityManager
			)
			integrateOrientation(
				deltaTimeInMs / 1000,
				entities.executeQuery( queryIds[ "integrateOrientation" ][ 0 ] ).elements
			)
			animateClouds(
				timeInMs,
				deltaTimeInMs,
				entities.executeQuery( queryIds[ "clouds" ][ 0 ] ).elements
			)
			updateRenderData(
				entities.executeQuery( queryIds[ "updateRenderData" ][ 0 ] ).elements
			)
			applyPowerupEffects(
				entities.executeQuery( queryIds[ "applyPowerupEffects" ][ 0 ] ).elements
			)
			fade(
				timeInMs,
				deltaTimeInMs,
				entityManager,
				entities.executeQuery( queryIds[ "fade" ][ 0 ] ).elements
			)
			processSound(
				sounds,
				entities.executeQuery( queryIds[ "soundEmitters" ][ 0 ] ).elements
			)


            inputEvents.length = 0

			var timeA = Types.Time.getCurrentInMs()

			this.renderer.process(
				timeInMs,
				deltaTimeInMs,
				entities.executeQuery( queryIds[ "render" ][ 0 ] ).multiMap,
				entities.executeQuery( queryIds[ "shieldRenderer" ][ 0 ] ).elements,
                entities.executeQuery( queryIds[ "textEntities" ][ 0 ] ).elements
			)

			statisticsManager.updateSeries( 'timeSpentRendering', Types.Time.getCurrentInMs() - timeA )

//			debugRenderer(
//				timeInMs,
//				deltaTimeInMs,
//				renderingContext,
//				entities.executeQuery( queryIds[ "updateRenderData" ][ 0 ] ).elements
//			)


			newTimeStampInMs = timeInMs
			timeSpentInMs = newTimeStampInMs - timeStampInMs
			timeStampInMs = newTimeStampInMs

			statisticsManager.updateSeries( 'fps', 1000 / timeSpentInMs )
			statisticsManager.updateSeries( 'totalTimeSpent', timeSpentInMs )


//			renderPerformanceGraph(
//				timeInMs,
//				deltaTimeInMs,
//				statisticsManager.getValues(),
//				renderingContext
//			)
		}

		return {
			onCreate: function( globals ) {
				this.update = updateZone
				this.render = renderZone

				this.entities      = new Entities()
				this.entityManager = new ZoneEntityManager( globals.entityManager, this.entities )

				var thisZone      = this
				var entities      = this.entities
				var entityManager = this.entityManager
				var eventManager  = globals.eventManager
				var inputManager  = globals.inputManager
                var soundManager  = globals.soundManager

				this.renderer = new Renderer( eventManager, globals.textures, globals.renderingContext )

				// WORKAROUND: manually triggering SCREEN_RESIZED event to force the renderer to reinitialize the canvas
				eventManager.publish(
					Events.SCREEN_RESIZED,
					[ globals.configurationManager.screenSize.width, globals.configurationManager.screenSize.height ]
				)

				inputManager.init()


				entityManager.createEntity(
					"player",
					[
						"player",
						players[ 0 ].leftKey,
						players[ 0 ].rightKey,
						players[ 0 ].useKey
					]
				)

				entityManager.createEntity(
					"background",
					[ {
						textureId : "environment/ground.jpg"
					} ]
				)


				// add clouds
				createClouds(
					entityManager,
					35,
					[ 16, -14, 0 ],
					"cloud_dark",
					1
				)

				createClouds(
					entityManager,
					25,
					[ 24, -18, 0 ],
					"cloud_light",
					2
				)


				addPlatformLogo( entityManager, globals.configurationManager.platform )


				entityManager.createEntity(
					"widgetThatFades",
					[ {
						position  : [ 256, 256, 0 ],
						textureId : 'help_controls.png',
						fade : {
							beginAfter : 2500,
							duration   : 500,
							start      : 1.0,
							end        : 0.0
						}
					} ]
				)

				entityManager.createEntity( "arena" )


				var synchronizationIdMap = entityMap( function( entity ) {
					return entity.synchronizationSlave.id
				} )

				var bodyIdMultiMap = multiMap( function( entity ) {
					if ( entity.hasOwnProperty( "tailElement" ) ) {
						return entity.tailElement.bodyId
					}
					else {
						return undefined
					}
				} )

				this.queryIds = {
					processLocalKeyInput: [
						entities.prepareQuery( [ "inputDefinition" ] ),
						entities.prepareQuery( [ "actor" ] )
					],
					playerEntities: [
						entities.prepareQuery( [ "player", "actor" ], singleton )
					],
					processEntityUpdates: [
						entities.prepareQuery( [ "synchronizationSlave" ], synchronizationIdMap )
					],
					interpolateNetworkData: [
						entities.prepareQuery( [ "networkInterpolation" ] )
					],
					updateScoreDisplays: [
						entities.prepareQuery( [ "head" ] ),
						entities.prepareQuery( [ "scoreDisplay" ] )
					],
					destroyEntities: [
						entities.prepareQuery( [ "directUpdate"        , "markedForDestruction" ] ),
						entities.prepareQuery( [ "networkInterpolation", "markedForDestruction" ] )
					],
					integrateOrientation: [
						entities.prepareQuery( [ "angularFrequency", "orientation" ] )
					],
					moveTailElements: [
						entities.prepareQuery( [ "head", "active" ]                 ),
						entities.prepareQuery( [ "tailElement"    ], bodyIdMultiMap )
					],
					updateRenderData: [
						entities.prepareQuery( [ "position", "renderData" ] )
					],
					clouds: [
						entities.prepareQuery( [ "cloud" ] )
					],
					fade: [
						entities.prepareQuery( [ "fade" ] )
					],
					render: [
						entities.prepareQuery( [ "position", "appearance", "renderData" ], passIdMultiMap )
					],
					shieldRenderer: [
						entities.prepareQuery( [ "shield" ] )
					],
//					debugRenderer: [
//						entities.prepareQuery( [ "head", "active" ] )
//					],
					applyPowerupEffects: [
						entities.prepareQuery( [ "appearance", "powerupEffects" ] )
					],
					soundEmitters: [
						entities.prepareQuery( [ "soundEmitter" ] )
					],
                    uiEntities: [
                        entities.prepareQuery( [ "position", "boundingBox", "clickable" ] )
                    ],
                    textEntities: [
                        entities.prepareQuery( [ "text" ] )
                    ]
				}

                var setAction = function( entity, key, value ) {
                    var action = entity.actor.actions[ key ]
                    action.executing = value
                    action.needSync  = true
                }

                var player = entities.executeQuery( this.queryIds[ "playerEntities" ][ 0 ] ).singleton

                var touchControls = {
                    name: 'Controls',
                    type: 'container',
                    yPosition: 685,
                    items: [
                        {
                            type: 'button',
                            textureId: "arrow_left.png",
                            pressedTextureId: "arrow_left_pressed.png",
                            onPress: function() {
                                setAction(
                                    player,
                                    "left",
                                    true
                                )
                            },
                            onAbort: function() {
                                setAction(
                                    player,
                                    "left",
                                    false
                                )
                            },
                            onClick: function() {
                                setAction(
                                    player,
                                    "left",
                                    false
                                )
                            },
                            xPosition: 138,
                            height: 64,
                            width: 64,
                            boundingBox: {
                                x: 0,
                                y: 200,
                                width: 340,
                                height: constants.ySize
                            }
                        },
                        {
                            type: 'button',
                            textureId: "space.png",
							pressedTextureId: "space_pressed.png",
                            onPress: function() {
                                setAction(
                                    player,
                                    "useItem",
                                    true
                                )
                            },
                            onAbort: function() {
                                setAction(
                                    player,
                                    "useItem",
                                    false
                                )
                            },
                            onClick: function() {
                                setAction(
                                    player,
                                    "useItem",
                                    false
                                )
                            },
                            xPosition: 384,
                            height: 64,
                            width: 256,
                            boundingBox: {
                                x: 342,
                                y: 200,
                                width: 340,
                                height: constants.ySize
                            }
                        },
                        {
                            type: 'button',
                            textureId: "arrow_right.png",
                            pressedTextureId: "arrow_right_pressed.png",
                            onPress: function() {
                                setAction(
                                    player,
                                    "right",
                                    true
                                )
                            },
                            onAbort: function() {
                                setAction(
                                    player,
                                    "right",
                                    false
                                )
                            },
                            onClick: function() {
                                setAction(
                                    player,
                                    "right",
                                    false
                                )
                            },
                            xPosition: 822,
                            height: 64,
                            width: 64,
                            boundingBox: {
                                x: 684,
                                y: 200,
                                width: 340,
                                height: constants.ySize
                            }
                        }
                    ]
                }


                var uiJson = {
                    type: 'container',
                    xPosition: 0,
                    yPosition: 0,
                    width : constants.xSize,
                    height: constants.ySize,
                    items: [
                        {
                            type: 'label',
                            string: "This is a SpellJS Cross Platform Multiplayer Demonstration",
                            xPosition: 250
                        },
                        {
                            type: 'container',
                            yPosition: 5,
                            items: [
                                {
                                    type: 'button',
                                    textureId: "speaker.png",
                                    offTextureId: "speaker_mute.png",
                                    on:  !soundManager.isMuted(),
                                    enableToggle: true,
                                    onClick: function() {
                                        this.toggle()
                                        soundManager.setMuted( !this.getOnValue() )
                                    },
                                    xPosition: constants.xSize - 69 ,
                                    height: 64,
                                    width: 64
                                }
                            ]
                        }
                    ]
                }

                var uiManager = createUiManager( entityManager, constants )

                this.uiSystem = new uiSystem( uiManager )

                if( PlatformKit.features.touch ) {
                    uiJson.items.push( touchControls )
                }

                uiManager.parseConfig( uiJson )

				this.renderUpdate = function( timeInMs, deltaTimeInMs ) {
					thisZone.render( timeInMs, deltaTimeInMs, globals )
				}

				this.logicUpdate = function( timeInMs, deltaTimeInS ) {
					thisZone.update( timeInMs, deltaTimeInS, globals )
				}

				eventManager.subscribe( Events.RENDER_UPDATE, this.renderUpdate )
				eventManager.subscribe( [ Events.LOGIC_UPDATE, "20" ], this.logicUpdate )
			},

			onDestroy: function( globals ) {
				var eventManager = globals.eventManager
				var inputManager = globals.inputManager

				inputManager.cleanUp()

				eventManager.unsubscribe( Events.RENDER_UPDATE, this.renderUpdate )
				eventManager.unsubscribe( [ Events.LOGIC_UPDATE, "20" ], this.logicUpdate )
			}
		}
	}
)
