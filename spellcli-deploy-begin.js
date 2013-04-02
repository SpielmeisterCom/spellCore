var path          = require( 'path' ),
	requirejs	= require( 'requirejs' ),
	define		= requirejs.define,
	spellCorePath	= path.resolve( process.execPath )
console.log(requirejs);

requirejs.config( {
	nodeRequire: require
} )

