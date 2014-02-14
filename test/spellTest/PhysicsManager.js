define(
	'spellTest/PhysicsManager',
	[
		'chai',
		'spell/PhysicsManager'
	],
	function(
		chai,
		PhysicsManager
		) {
		'use strict'

		return function( describe, it ) {
			var expect = chai.expect

			var physicsManager = new PhysicsManager()

			describe( 'spell/PhysicsManager', function( ) {
				it( 'should correctly create a world', function( done ) {

					physicsManager.createWorld(
						[0, 10],
						0.1,
						8,
						8
					)
				})
			})

		}
	})
