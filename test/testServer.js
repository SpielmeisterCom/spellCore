define(
	'test/testServer',
	[
		'pathUtil',
		'connect',
		'http',
		'commander',
		'fs',
		'path'
	],
	function(
		pathUtil,
		connect,
		http,
		commander,
		fs,
		path
	) {
		'use strict'


	    var printErrors = function( errors ) {
		    var tmp = []
		    tmp = tmp.concat( errors )

		    console.error( tmp.join( '\n' ) )
	    }

		return function( argv, cwd, spellPath ) {
			var startServerCommand = function( command ) {
				var errors          = [],
					port            = command.port || 3000,
					nodeModulesPath = path.resolve( spellPath, 'node_modules' )

			    var app = connect()
					.use( connect.favicon() )
				    .use( connect.logger( 'dev' ) )


				    .use( connect.static( path.join( spellPath, 'test' ) ) )
					.use( connect.static( path.join( spellPath, 'src' ) ) )

					// Because the modules ace, requirejs and underscore are located outside of the regular webserver root they have to be added manually.
				    .use( connect.static( path.resolve( nodeModulesPath, 'requirejs' ) ) )
					.use( connect.static( path.resolve( nodeModulesPath, 'underscore' ) ) )
				    .use( connect.static( path.resolve( nodeModulesPath, 'mocha' ) ) )
				    .use( connect.static( path.resolve( nodeModulesPath, 'chai' ) ) )

				    http.Server( app ).listen( port )

				    console.log( 'Server started on port ' + port )
		    }

		    commander
			    .command( 'start-server' )
			    .option( '-p, --port [port number]', 'the port the server runs on' )
			    .description( 'start the testserver server' )
			    .action( startServerCommand )

		    commander.parse( argv )
	    }
    }
)

