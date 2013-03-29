var path          = require( 'path' ),
	requirejs	= require( 'requirejs' ),
	define		= requirejs.define,
	spellCorePath	= path.resolve( process.mainModule.filename , '..' )

requirejs.config( {
	nodeRequire: require
} )

