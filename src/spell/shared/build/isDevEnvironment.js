define(
	'spell/shared/build/isDevEnvironment',
	[
		'spell/shared/build/isFile',

		'path'
	],
	function(
		isFile,

		path
	) {
		return function( spellCorePath ) {
			var developmentEngineIncludeFilePath = path.join( spellCorePath, 'build', 'spell.dev.js' )

			return isFile( developmentEngineIncludeFilePath )
		}
	}
)
