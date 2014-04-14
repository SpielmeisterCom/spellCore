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

			var stageZeroConfig = {
				libraryUrl : "data/testProject/library"
			}

			var spell = require( 'spell/client/main', stageZeroConfig )

			var projectConfig = {
				startScene : "testProject.Scene",
				type: "project",
				config : {
					web : {
						html5: true
					}
				},
				scenes: [
					'testProject.Scene'
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
