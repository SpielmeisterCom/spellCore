define(
	'spell/server/main',
	[
		'spell/server/build/createServer',
		'spell/server/util/createMainLoop',
		'spell/server/util/connect/extDirect',
		'spell/shared/util/template/TemplateManager',
		'spell/shared/util/networkProtocol',
		'spell/shared/util/network/Messages',
		'spell/shared/util/EventManager',
		'spell/EntityManager',
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

		var createHttpServer = function( spellCorePath, projectsPath, port ) {
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
						createBuildServer( spellCorePath, projectsPath )
					)
				)
				.listen( port )
		}


		/*
		 * public
		 */

		return function( spellCorePath, projectsPath, port ) {
			port = port || 8080
			var httpServer      = createHttpServer( spellCorePath, projectsPath, port )
		}
	}
)
