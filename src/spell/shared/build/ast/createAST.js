define(
	'spell/shared/build/ast/createAST',
	[
		'uglify-js'
	],
	function(
		uglify
	) {
		'use strict'


		/**
		 * Creates an abstract syntax tree in uglifyjs format.
		 */
		return function( source ) {
			return uglify.parser.parse( source )
		}
	}
)
