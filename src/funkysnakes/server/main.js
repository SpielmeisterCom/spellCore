define(
	'spell/server/main',
	[
		'spell/server/build/createServer',
		'spell/server/util/createMainLoop',
		'spell/server/util/connect/extDirect',
		'spell/server/util/network/network',
		'spell/shared/util/blueprints/BlueprintManager',
		'spell/shared/util/networkProtocol',
		'spell/shared/util/network/Messages',
		'spell/shared/util/EventManager',
		'spell/shared/util/entities/EntityManager',
		'spell/shared/util/zones/ZoneManager',
		'spell/shared/util/Logger',
		'spell/shared/util/platform/PlatformKit',
		'spell/shared/util/platform/Types',

		'connect',
		'connect-cors',
		'path',

		'spell/shared/util/platform/underscore'
	],
	function(
		createBuildServer,
		createMainLoop,
		extDirect,
		network,
		BlueprintManager,
		networkProtocol,
		Messages,
		EventManager,
		EntityManager,
		ZoneManager,
		Logger,
		PlatformKit,
		Types,

		connect,
		cors,
		fs,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var isRoot = function() {
			return process.getuid() === 0
		}

		var executeLogged = function( message, func ) {
			process.stdout.write( ' -> ' + message + '... ' )
			func.call()
			process.stdout.write( 'done\n' )
		}

		var isValidProjectPath = function( projectsPath, projectPathToCheck ) {
			return fs.existsSync( projectsPath + projectPathToCheck )
		}

		var rewriteUrlToRealProjectPath = function( projectsPath ) {
			return function ( req, res, next ) {
				var match = req.url.match( /(\/[^\/.]*)(.*)/ )

				if( !match ) next()

				var potentialProjectPath = match[ 1 ],
					rest = match[ 2 ]

				if( isValidProjectPath( projectsPath, potentialProjectPath ) ) {
					var rewrittenUrl = potentialProjectPath + '/public' + rest
					req.url = rewrittenUrl
				}

				next()
			}
		}

		var createHttpServer = function( spellPath, projectsPath, port ) {
			return connect()
				.use( connect.favicon() )
				.use( connect.logger( 'dev' ) )
				.use(
					cors( {
						origins: [ 'http://localhost:3000', 'http://localhost:8080' ]
					} )
				)
				.use(
					extDirect(
						'http://localhost:8080/router/',
						'SpellBuild',
						createBuildServer( spellPath, projectsPath )
					)
				)
				.use( rewriteUrlToRealProjectPath( projectsPath ) )
				.use( connect.static( projectsPath ) )
				.listen( port )
		}


		/**
		 * public
		 */

		return function( spellPath, projectsPath, unprivilegedUserId, port ) {
			port = port || 8080


			if( port < 1024 ) {
				if( unprivilegedUserId === undefined ) {
					Logger.error( 'Please supply the username of the user that the server is going to run as.' )
					process.exit()
				}

				if( !isRoot() ) {
					Logger.error( 'Binding to ports less than 1024 requires root privileges. The script must be started with root privileges.' )
					process.exit()
				}
			}


			console.log( 'The server is going to run as user \'' + unprivilegedUserId + '\' on port ' + port + ' with path \'' + projectsPath + '\' as root.' )

			var flashPolicyFile, httpServer, connection

			executeLogged(
				'binding to ports',
				function() {
					flashPolicyFile = network.initializeFlashPolicyFileServer( 843 )
					httpServer      = createHttpServer( spellPath, projectsPath, port )
					connection      = network.initializeClientHandling( httpServer, networkProtocol )

					network.initializePathService( connection )
					network.initializeClockSyncService( connection )
				}
			)

			executeLogged(
				'dropping privileges',
				function() {
					process.setuid( unprivilegedUserId )
				}
			)


			var eventManager = new EventManager()
			var entityManager = new EntityManager( new BlueprintManager() )

			var globals = {},
				mainLoop = undefined

			var zoneManager = new ZoneManager( globals, mainLoop )

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
