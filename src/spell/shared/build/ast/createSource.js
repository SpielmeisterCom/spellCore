define(
	'spell/shared/build/ast/createSource',
	[
		'uglify-js'
	],
	function(
		uglify
	) {
		'use strict'


		/**
		 * Takes an abstract syntax tree in uglifyjs format and returns source code
		 */
		return function( ast, indented ) {
			return uglify.uglify.gen_code(
				ast,
				{
					beautify: indented
				}
			)
		}
	}
)
