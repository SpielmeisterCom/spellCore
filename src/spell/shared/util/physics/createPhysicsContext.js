define(
	'spell/shared/util/physics/createPhysicsContext',
	[
		'spell/shared/util/physics/createPhysicsWorld'
	],
	function(
        createPhysicsWorld
	) {
		'use strict'




		return function() {
			return {
				createWorld : createPhysicsWorld
			}
		}
	}
)
