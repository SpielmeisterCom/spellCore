define(
	'spell/shared/build/cleanDirectory',
	[
		'mkdirp',
		'rimraf'
	],
	function(
		mkdirp,
		rmdir
	) {
		'use strict'


		return function( path ) {
			rmdir.sync( path )
			mkdirp.sync( path )
		}
	}
)
