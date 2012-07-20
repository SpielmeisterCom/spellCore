define(
	'spell/shared/build/minifySource',
	[
		'uglify-js'
	],
	function(
		uglify
	) {
		'use strict'


		var uglifyParser    = uglify.parser,
			uglifyProcessor = uglify.uglify

		return function( source ) {
			return uglifyProcessor.gen_code(
				uglifyProcessor.ast_squeeze(
					uglifyProcessor.ast_mangle(
						uglifyParser.parse( source )
					)
				)
			)
		}
	}
)
