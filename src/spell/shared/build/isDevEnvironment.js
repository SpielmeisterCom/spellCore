define(
	'spell/shared/build/isDevEnvironment',
	[
		'spell/shared/build/isDirectory',

		'path'
	],
	function(
		isDirectory,

		path
	) {
		return function( spellCorePath ) {
			return isDirectory( path.join( spellCorePath, 'build' ) )
		}
	}
)
