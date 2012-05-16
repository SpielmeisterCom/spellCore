#!/usr/bin/env node

/**
 * needjs optimizer
 */

var createSpellPath = function( toolPath ) {
	var parts = toolPath.split( '/' )
	return parts.slice( 0, parts.length - 2 ).join( '/' )
}

var spellPath = createSpellPath( process.mainModule.filename )

requirejs = require( 'requirejs' )

requirejs.config( {
	baseUrl: spellPath + '/src',
	nodeRequire: require
} )

requirejs(
	[
		'spell/cli/needjsOptimizer'
	],
	function(
		needjsOptimizer
	) {
		needjsOptimizer( process.argv, process.cwd(), spellPath )
	}
)
