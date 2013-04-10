var path          = require( 'path' ),
	requirejs	  = require( 'requirejs' ),
	define		  = requirejs.define,
	spellCorePath = path.resolve( path.dirname( process.execPath ) )

requirejs.config( {
	nodeRequire: require
} )

