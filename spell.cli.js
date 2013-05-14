var fs        = require( 'fs' ),
	path      = require( 'path' ),
	requirejs = require( 'requirejs' ),
	define    = requirejs.define

// argv[ 1 ] is path to executed script
var basePath = path.resolve( path.dirname( process.argv[ 1 ] ) )

// probe for development environment
var isDevEnv = false,
	srcPath  = path.resolve( basePath, 'src' )

if( fs.existsSync( srcPath ) ) {
	stat = fs.lstatSync( srcPath )

	if( stat ) {
		isDevEnv = stat.isDirectory()
	}
}

// set up requirejs
var config = {
	nodeRequire : require
}

if( isDevEnv ) {
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
