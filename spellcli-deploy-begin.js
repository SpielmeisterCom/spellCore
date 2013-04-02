var path          = require( 'path' ),
	requirejs	= require( 'requirejs' ),
	define		= requirejs.define,
	spellCorePath	= path.resolve( process.execPath )

requirejs.config( {
	nodeRequire: require
} )

