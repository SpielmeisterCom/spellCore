#!/usr/bin/env node

/**
 * needjs optimizer
 */

var path          = require( 'path' ),
	requirejs     = require( 'requirejs' ),
	spellCorePath = path.resolve( process.mainModule.filename , '../..' )

requirejs.config( {
	baseUrl: spellCorePath + '/src',
	nodeRequire: require
} )

requirejs(
	[
		'spell/cli/needjsOptimizer'
	],
	function(
		needjsOptimizer
	) {
		needjsOptimizer( process.argv, process.cwd(), spellCorePath )
	}
)
