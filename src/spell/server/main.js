define(
	'spell/server/main',
	[
		'spell/server/build/createServer',
		'spell/server/util/createMainLoop',
		'spell/server/util/connect/extDirect',
		'spell/server/util/network/network',
		'spell/shared/util/template/TemplateManager',
		'spell/shared/util/networkProtocol',
		'spell/shared/util/network/Messages',
		'spell/shared/util/EventManager',
		'spell/shared/util/entity/EntityManager',
		'spell/shared/util/scene/SceneManager',
		'spell/shared/util/Logger',
		'spell/shared/util/platform/PlatformKit',
		'spell/shared/util/platform/Types',

		'connect',
		'connect-cors',
		'fs',

		'spell/functions'
	],
	function(
		createBuildServer,
		createMainLoop,
		extDirect,
		network,
		TemplateManager,
		networkProtocol,
		Messages,
		EventManager,
		EntityManager,
		SceneManager,
		Logger,
		PlatformKit,
		Types,

		connect,
		cors,
		fs,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var logger = new Logger()

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


		/*
		 * public
		 */

		return function( spellPath, projectsPath, unprivilegedUserId, port ) {
			port = port || 8080


			if( port < 1024 ) {
				if( unprivilegedUserId === undefined ) {
					logger.error( 'Please supply the username of the user that the server is going to run as.' )
					process.exit()
				}

				if( !isRoot() ) {
					logger.error( 'Binding to ports less than 1024 requires root privileges. The script must be started with root privileges.' )
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
			var entityManager = new EntityManager( new TemplateManager() )

			var globals = {},
				mainLoop = undefined

			var sceneManager = new SceneManager( globals, mainLoop )

			var clients = connection.clients

			globals.clients       = clients
			globals.entityManager = entityManager
			globals.eventManager  = eventManager
			globals.sceneManager  = sceneManager



			var gameScenes = {}

			var findGameSceneWithOpenPlayerSlot = function( scenes ) {
				return _.find(
					scenes,
					function( scene ) {
						return scene.hasOpenPlayerSlot()
					}
				)
			}

			var findGameSceneWithClient = function( scenes, clientId ) {
				return _.find(
					scenes,
					function( scene ) {
						return scene.clients[ clientId ] !== undefined
					}
				)
			}

			var onSceneTransition = function( scene, nextScene ) {
				delete gameScenes[ scene.id ]

				if( nextScene ) {
					gameScenes[ nextScene.id ] = nextScene
				}
			}

			connection.listeners.push( {
				onConnect: function( client ) {
				},

				onDisconnect: function( client ) {
					logger.info( 'client ' + client.id + ' disconnected' )
					var scene = findGameSceneWithClient( gameScenes, client.id )

					if( scene ) {
						scene.removeClient( client )

					} else {
						logger.error( 'Could not find a scene with client ' + client.id + '.' )
					}
				},

				onMessage: function( client, message ) {
					if( message.type !== Messages.JOIN_ANY_GAME ) return


					var scene = findGameSceneWithOpenPlayerSlot( gameScenes )

					if( !scene ) {
						scene = SceneManager.createScene(
							'game',
							{
								onSceneTransition : onSceneTransition
							}
						)
					}

					scene.addClient( client )
					client.scene = scene
					gameScenes[ scene.id ] = scene
				}
			} )

			console.log( ' -> listening for incoming connections...\n' )

			PlatformKit.callNextFrame( createMainLoop( eventManager, Types.Time.getCurrentInMs() ) )
		}
	}
)
