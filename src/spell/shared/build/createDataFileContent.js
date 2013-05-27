define(
	'spell/shared/build/createDataFileContent',
	[
		'underscore.string'
	],
	function(
		_s
	) {
		'use strict'


		var dataFileTemplate = [
			'%1$s;',
			'spell.addToCache(%2$s);',
			'spell.setApplicationModule(%3$s);'
		].join( '\n' )

		return function( scriptSource, cacheContent, projectConfig ) {
			return _s.sprintf(
				dataFileTemplate,
				scriptSource,
				JSON.stringify( cacheContent ),
				JSON.stringify( projectConfig )
			)
		}
	}
)
