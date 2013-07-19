var DEBUG    = typeof( RELEASE ) === 'undefined',
	isDevEnv = DEBUG

var fs        = require( 'fs' ),
	path      = require( 'path' ),
	requirejs = require( 'requirejs' ),
	define    = requirejs.define

// argv[ 1 ] is path to executed script
var scriptPath = path.resolve( path.dirname( process.argv[ 1 ] ) ),
	basePath   = DEBUG ? path.resolve( scriptPath, '..', '..', '..' ) : scriptPath

// set up requirejs
var config = {
	nodeRequire : require
}

if( DEBUG ) {
	var srcPath = path.resolve( basePath, 'src' )

	config.baseUrl = srcPath
}

requirejs.config( config )

requirejs(
	[
		'spell/cli/developmentTool'
	],
	function(
		developmentTool
	) {
		developmentTool( process.argv, process.cwd(), basePath, isDevEnv )
	}
)
