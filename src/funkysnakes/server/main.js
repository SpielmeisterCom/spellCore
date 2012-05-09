define(
	'funkysnakes/server/main',
	[
		"funkysnakes/server/components",
		"funkysnakes/server/entities",
		"funkysnakes/server/zones/game",
		"funkysnakes/server/util/createMainLoop",
		"funkysnakes/shared/util/networkProtocol",

		"spell/server/util/network/network",
		"spell/shared/util/network/Messages",
		"spell/shared/util/EventManager",
		"spell/shared/util/entities/Entities",
		"spell/shared/util/entities/EntityManager",
		"spell/shared/util/zones/ZoneManager",
		"spell/shared/util/Logger",
		"spell/shared/util/platform/PlatformKit",
		"spell/shared/util/platform/Types",

		"underscore"
	],
	function(
		components,
		entities,
		gameZone,
		createMainLoop,
		networkProtocol,

		network,
		Messages,
		EventManager,
		Entities,
		EntityManager,
		ZoneManager,
		Logger,
		PlatformKit,
		Types,

		_
	) {
		"use strict"


		return function( rootPath, unprivilegedUser, port ) {
			port = port || 8080


			console.log( process.cwd() )


			var isRoot = function() {
				return process.getuid() === 0
			}

			var executeLogged = function( message, func ) {
				process.stdout.write( ' -> ' + message + '... ' )
				func.call()
				process.stdout.write( 'done\n' )
			}


			if( port < 1024 ) {
				if( unprivilegedUser === undefined ) {
					Logger.error( 'Please supply the username of the user that the server is going to run as.' )
					process.exit()
				}

				if( !isRoot() ) {
					Logger.error( 'Binding to ports less than 1024 requires root privileges. The script must be started with root privileges.' )
					process.exit()
				}
			}


			console.log( 'The server is going to run as user "' + unprivilegedUser + '" on port ' + port + '.' )

			var flashPolicyFile, httpServer, connection

			executeLogged(
				'binding to ports',
				function() {
					flashPolicyFile = network.initializeFlashPolicyFileServer( 843 )
					httpServer      = network.initializeHttpServer( rootPath, port )
					connection      = network.initializeClientHandling( httpServer, networkProtocol )

					network.initializePathService( connection )
					network.initializeClockSyncService( connection )
				}
			)

			executeLogged(
				'dropping privileges',
				function() {
					process.setuid( unprivilegedUser )
				}
			)


			var eventManager = new EventManager()
			var entityManager = new EntityManager( entities, components )

			var globals = {}

			var zones = {
				game : gameZone
			}

			var zoneManager = new ZoneManager( eventManager, zones, globals )

			var clients = connection.clients

			globals.clients       = clients
			globals.entityManager = entityManager
			globals.eventManager  = eventManager
			globals.zoneManager   = zoneManager



			var gameZones = {}

			var findGameZoneWithOpenPlayerSlot = function( zones ) {
				return _.find(
					zones,
					function( zone ) {
						return zone.hasOpenPlayerSlot()
					}
				)
			}

			var findGameZoneWithClient = function( zones, clientId ) {
				return _.find(
					zones,
					function( zone ) {
						return zone.clients[ clientId ] !== undefined
					}
				)
			}

			var onZoneTransition = function( zone, nextZone ) {
				delete gameZones[ zone.id ]

				if( nextZone ) {
					gameZones[ nextZone.id ] = nextZone
				}
			}

			connection.listeners.push( {
				onConnect: function( client ) {
				},

				onDisconnect: function( client ) {
					Logger.info( 'client ' + client.id + ' disconnected' )
					var zone = findGameZoneWithClient( gameZones, client.id )

					if( zone ) {
						zone.removeClient( client )

					} else {
						Logger.error( 'Could not find a zone with client ' + client.id + '.' )
					}
				},

				onMessage: function( client, message ) {
					if( message.type !== Messages.JOIN_ANY_GAME ) return


					var zone = findGameZoneWithOpenPlayerSlot( gameZones )

					if( !zone ) {
						zone = zoneManager.createZone(
							'game',
							{
								onZoneTransition : onZoneTransition
							}
						)
					}

					zone.addClient( client )
					client.zone = zone
					gameZones[ zone.id ] = zone
				}
			} )

			console.log( ' -> listening for incoming connections...\n' )

			PlatformKit.callNextFrame( createMainLoop( eventManager, Types.Time.getCurrentInMs() ) )
		}
	}
)
