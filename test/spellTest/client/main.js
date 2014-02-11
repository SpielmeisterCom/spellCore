define(
	'spellTest/client/main',
	[
		'chai'
	],
	function(
		chai
		)
	{
		'use strict'

		return function( describe, it, before, after, beforeEach, afterEach ) {
			var expect = chai.expect

			var stageZeroConfig = {}

			var spell = require( 'spell/client/main', stageZeroConfig )

			var projectConfig = {
				startScene : "test",
				config : {
					web : {
						html5: true
					}
				},
				scenes: [
					'test'
				]
			}

			describe( 'spell/client/main', function( ) {

				it( 'should start the engine', function( done ) {
					spell.start( projectConfig, {} )
					done()
				})
			})

		}
	})
