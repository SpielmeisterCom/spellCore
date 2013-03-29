var path          = require( 'path' ),
	requirejs	= require( 'requirejs' ),
	define		= requirejs.define,
	spellCorePath	= path.resolve( process.mainModule.filename , '..' )

requirejs.config( {
	baseUrl: spellCorePath + '/src',
	nodeRequire: require
} )

requirejs(
	[
		'spell/cli/developmentTool'
	],
	function(
		developmentTool
	) {
		developmentTool( process.argv, process.cwd(), spellCorePath )
	}
)
