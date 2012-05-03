define(
	"funkysnakes/server/zones/game",
	[
		"funkysnakes/server/systems/endGame",
		"funkysnakes/shared/systems/moveTailElements",
		'funkysnakes/server/util/createPlayer',
		"funkysnakes/server/systems/processActorStateUpdate",
		"funkysnakes/server/systems/updatePlayers",
		"funkysnakes/shared/config/constants",
		"funkysnakes/shared/config/players",
		"funkysnakes/shared/systems/applyInputActions",
		"funkysnakes/shared/systems/checkPowerupCollision",
		"funkysnakes/shared/systems/checkTailCollision",
		"funkysnakes/shared/systems/checkBorderCollision",
		"funkysnakes/shared/systems/integratePosition",
		"funkysnakes/shared/systems/removePowerupBonus",
		"funkysnakes/shared/systems/spawnPowerup",
		"funkysnakes/shared/systems/updateSpaceshipOrientation",
		"funkysnakes/shared/systems/useItems",
		"funkysnakes/shared/systems/updateShields",
		"funkysnakes/shared/systems/destroyShips",

		"spell/server/systems/network/sendEntityUpdate",
		"spell/shared/util/network/Messages",
		"spell/shared/util/entities/Entities",
		"spell/shared/util/entities/datastructures/entityMap",
		"spell/shared/util/entities/datastructures/multiMap",
		"spell/server/util/network/nextNetworkId",
		"spell/shared/util/zones/ZoneEntityManager",
		"spell/shared/util/Events",
		"spell/shared/util/Logger",

		"underscore"
	],
	function(
		endGame,
		moveTailElements,
		createPlayer,
		processActorStateUpdate,
		updatePlayers,
		constants,
		players,
		applyInputActions,
		checkPowerupCollision,
		checkTailCollision,
		checkBorderCollision,
		integratePosition,
		removePowerupBonus,
		spawnPowerup,
		updateSpaceshipOrientation,
		useItems,
		updateShields,
		destroyShips,

		sendEntityUpdate,
		Messages,
		Entities,
		entityMap,
		multiMap,
		nextNetworkId,
		ZoneEntityManager,
		Events,
		Logger,

		_
	) {
		"use strict"


		function preparation(
			timeInMs,
			deltaTimeInS,
			globals
		) {
			var clients       = this.clients
			var entities      = this.entities
			var entityManager = this.entityManager
			var queryIds      = this.queryIds

			updatePlayers(
				entities.executeQuery( queryIds[ "updatePlayers" ][ 0 ] ).elements,
				entities.executeQuery( queryIds[ "updatePlayers" ][ 1 ] ).entityMap,
				clients,
				entityManager
			)
			processActorStateUpdate(
				clients,
				entities.executeQuery( queryIds[ "processActorStateUpdate" ][ 0 ] ).elements
			)
		}

		function gameLogic(
			timeInMs,
			deltaTimeInS,
			globals
		) {
			var entities      = this.entities
			var entityManager = this.entityManager
			var queryIds      = this.queryIds

			spawnPowerup(
				entityManager
			)
			applyInputActions(
				entities.executeQuery( queryIds[ "applyInputActions" ][ 0 ] ).elements
			)
			updateSpaceshipOrientation(
				deltaTimeInS,
				entities.executeQuery( queryIds[ "updateSpaceshipOrientation" ][ 0 ] ).elements
			)
			useItems(
				entities.executeQuery( queryIds[ "useItems" ][ 0 ] ).elements,
				entities.executeQuery( queryIds[ "useItems" ][ 1 ] ).multiMap,
				entityManager
			)
			updateShields(
				deltaTimeInS,
				entities.executeQuery( queryIds[ "headsWithShield" ][ 0 ] ).elements,
				entityManager
			)
			removePowerupBonus(
				deltaTimeInS,
				entities.executeQuery( queryIds[ "removePowerupBonus" ][ 0 ] ).elements
			)
			integratePosition(
				deltaTimeInS,
				entities.executeQuery( queryIds[ "integratePosition" ][ 0 ] ).elements
			)
			checkPowerupCollision(
				entities.executeQuery( queryIds[ "checkPowerupCollision" ][ 0 ] ).elements,
				entities.executeQuery( queryIds[ "checkPowerupCollision" ][ 1 ] ).elements,
				entities.executeQuery( queryIds[ "checkPowerupCollision" ][ 2 ] ).elements,
				entities.executeQuery( queryIds[ "checkPowerupCollision" ][ 3 ] ).elements,
				entityManager
			)
			moveTailElements(
				deltaTimeInS,
				entities.executeQuery( queryIds[ "moveTailElements" ][ 0 ] ).elements,
				entities.executeQuery( queryIds[ "moveTailElements" ][ 1 ] ).multiMap
			)
			checkTailCollision(
				entities.executeQuery( queryIds[ "checkTailCollision" ][ 0 ] ).elements,
				entities.executeQuery( queryIds[ "checkTailCollision" ][ 1 ] ).elements,
				entities.executeQuery( queryIds[ "checkTailCollision" ][ 2 ] ).multiMap,
				entityManager
			)
			checkBorderCollision(
				timeInMs,
				entities.executeQuery( queryIds[ "checkBorderCollision" ][ 0 ] ).elements,
				entityManager
			)
			// HACK: Every ship that does not have an "active" component is destroyed every tick. This is of course redundant.
			destroyShips(
				entities.executeQuery( queryIds[ "destroyShips" ][ 0 ] ).elements,
				entities.executeQuery( queryIds[ "destroyShips" ][ 1 ] ).multiMap,
				entityManager
			)
		}

		function networkUpdate(
			timeInMs,
			deltaTimeInS,
			globals
		) {
			var clients         = this.clients
			var entities        = this.entities
			var networkListener = this.networkListener
			var queryIds        = this.queryIds

			sendEntityUpdate(
				timeInMs,
				entities.executeQuery( queryIds[ "sendEntityUpdate" ][ 0 ] ).elements,
				entities.executeQuery( queryIds[ "sendEntityUpdate" ][ 1 ] ).elements,
				networkListener,
				clients
			)
		}

		function cleanup(
			timeInMs,
			deltaTimeInS,
			globals
		) {
			var thisZone    = this
			var clients     = this.clients
			var entities    = this.entities
			var queryIds    = this.queryIds
			var zoneManager = globals.zoneManager

			endGame(
				entities.executeQuery( queryIds[ "endGame" ][ 0 ] ).elements,
				entities.executeQuery( queryIds[ "updatePlayers" ][ 0 ] ).elements,
				zoneManager,
				thisZone,
				clients
			)
		}


		return {
			onCreate: function( globals, args ) {
				this.networkListener = {
					createdEntities  : [],
					destroyedEntities: [],

					onCreateEntity: function( entityType, args, entity ) {
						if ( entity.synchronizationMaster !== undefined ) {
							this.createdEntities.push( { type: entityType, args: args } )
						}
					},
					onDestroyEntity: function( entity ) {
						if ( entity.synchronizationMaster !== undefined ) {
							this.destroyedEntities.push( entity.synchronizationMaster.id )
						}
					}
				}

				this.onZoneTransition = args.onZoneTransition

				this.clients       = ( args === undefined ? {} : ( args.clients === undefined ? {} : args.clients ) )
				this.entities      = new Entities()
				this.entityManager = new ZoneEntityManager( globals.entityManager, this.entities, [ this.networkListener ] )


				var thisZone      = this
				var clients       = this.clients
				var entities      = this.entities
				var entityManager = this.entityManager
				var eventManager  = globals.eventManager


				// create player entities according to client to player id relation from a previous game zone
				_.each(
					args.clientToPlayerId,
					function( playerId, clientId ) {
						createPlayer(
							entityManager,
							clientId,
							playerId,
							players[ playerId ]
						)
					}
				)


				var clientIdMap = entityMap( function( entity ) {
					return entity.head.clientId
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
					updatePlayers: [
						entities.prepareQuery( [ "player" ]              ),
						entities.prepareQuery( [ "head"   ], clientIdMap )
					],
					processActorStateUpdate: [
						entities.prepareQuery( [ "actor" ] )
					],
					applyInputActions: [
						entities.prepareQuery( [ "head", "actor", "active" ] )
					],
					updateSpaceshipOrientation: [
						entities.prepareQuery( [ "head", "active" ] )
					],
					integratePosition: [
						entities.prepareQuery( [ "head", "active" ] )
					],
					moveTailElements: [
						entities.prepareQuery( [ "head", "active" ]                 ),
						entities.prepareQuery( [ "tailElement"    ], bodyIdMultiMap )
					],
					useItems: [
						entities.prepareQuery( [ "head", "actor", "active" ]        ),
						entities.prepareQuery( [ "tailElement"    ], bodyIdMultiMap )
					],
					headsWithShield: [
						entities.prepareQuery( [ "head", "shield" ] )
					],
					checkTailCollision: [
						entities.prepareQuery( [ "head", "active" ]                 ),
						entities.prepareQuery( [ "tailElement"    ]                 ),
						entities.prepareQuery( [ "tailElement"    ], bodyIdMultiMap )
					],
					destroyShips: [
						entities.prepareQuery( [ "head" ] ),
						entities.prepareQuery( [ "tailElement" ], bodyIdMultiMap )
					],
					checkPowerupCollision: [
						entities.prepareQuery( [ "head", "active"  ] ),
						entities.prepareQuery( [ "powerup"         ] ),
						entities.prepareQuery( [ "score"           ] ),
						entities.prepareQuery( [ "player"          ] )
					],
					checkBorderCollision: [
						entities.prepareQuery( [ "head", "active" ] )
					],
					endGame: [
						entities.prepareQuery( [ "head", "active" ] )
					],
					sendEntityUpdate: [
						entities.prepareQuery( [ "player", "actor" ] ),
						entities.prepareQuery( [ "synchronizationMaster" ] )
					],
					removePowerupBonus: [
						entities.prepareQuery( [ "head", "active" ] )
					]
				}

				this.logicUpdate = {}
				this.logicUpdate[ "preparation" ] = function( timeInMs, deltaTimeInMs ) {
					preparation.apply( thisZone, [
						timeInMs,
						deltaTimeInMs,
						globals
					] )
				}
				this.logicUpdate[ "gameLogic" ] = function( timeInMs, deltaTimeInMs ) {
					gameLogic.apply( thisZone, [
						timeInMs,
						deltaTimeInMs,
						globals
					] )
				}
				this.logicUpdate[ "networkUpdate" ] = function( timeInMs, deltaTimeInMs ) {
					networkUpdate.apply( thisZone, [
						timeInMs,
						deltaTimeInMs,
						globals
					] )
				}
				this.logicUpdate[ "cleanup" ] = function( timeInMs, deltaTimeInMs ) {
					cleanup.apply( thisZone, [
						timeInMs,
						deltaTimeInMs,
						globals
					] )
				}

				this.hasOpenPlayerSlot = function() {
					return ( _.size( this.clients ) < constants.maxNumberPlayers )
				}

				this.addClient = function( client ) {
					this.clients[ client.id ] = client
				}

				this.removeClient = function( client ) {
					delete this.clients[ client.id ]
				}

				eventManager.subscribe( [ Events.LOGIC_UPDATE, 25 ], this.logicUpdate[ "preparation"   ] )
				eventManager.subscribe( [ Events.LOGIC_UPDATE, 25 ], this.logicUpdate[ "gameLogic"     ] )
				eventManager.subscribe( [ Events.LOGIC_UPDATE, 50 ], this.logicUpdate[ "networkUpdate" ] )
				eventManager.subscribe( [ Events.LOGIC_UPDATE, 25 ], this.logicUpdate[ "cleanup"       ] )
			},

			onDestroy: function( globals, clientToPlayerId ) {
				var eventManager = globals.eventManager,
					zoneManager  = globals.zoneManager,
					clients      = this.clients

				eventManager.unsubscribe( [ Events.LOGIC_UPDATE, 25 ], this.logicUpdate[ "preparation"   ] )
				eventManager.unsubscribe( [ Events.LOGIC_UPDATE, 25 ], this.logicUpdate[ "gameLogic"     ] )
				eventManager.unsubscribe( [ Events.LOGIC_UPDATE, 50 ], this.logicUpdate[ "networkUpdate" ] )
				eventManager.unsubscribe( [ Events.LOGIC_UPDATE, 25 ], this.logicUpdate[ "cleanup"       ] )


				if( _.size( clientToPlayerId ) === 0 ) {
					Logger.info( 'terminating game zone ' + this.id )

					this.onZoneTransition( this )

				} else {
					var nextZone = zoneManager.createZone(
						'game',
						{
							clients          : clients,
							clientToPlayerId : clientToPlayerId,
							onZoneTransition : this.onZoneTransition
						}
					)

					this.onZoneTransition( this, nextZone )

					_.each(
						clients,
						function( client ) {
							client.zone = nextZone
							client.send( Messages.ZONE_CHANGE, 'game' )
						}
					)

					var connectedClients = _.reduce( clients, function( memo, client ) { memo.push( client.id ); return memo }, [] )
					Logger.info( 'transitioning to new game zone ' + nextZone.id + '\n -> connected clients: ' + connectedClients.join( ', ' ) )
				}
			}
		}
	}
)
