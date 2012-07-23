define(
	'spell/shared/build/ast/minifyAST',
	[
		'uglify-js'
	],
	function(
		uglify
	) {
		'use strict'


		/**
		 * Takes an abstract syntax tree in uglifyjs format and returns it in mangled, squeezed form.
		 */
		return function( ast ) {
			return uglify.uglify.ast_squeeze(
				uglify.uglify.ast_mangle( ast )
			)
		}
	}
)
