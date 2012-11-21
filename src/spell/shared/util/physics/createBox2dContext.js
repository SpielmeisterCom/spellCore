define(
	'spell/shared/util/physics/createBox2dContext',
	[
		'spell/shared/util/physics/createBox2dWorld'
	],
	function(
		createBox2dWorld
	) {
		'use strict'


		return function() {
			return {
				createWorld : createBox2dWorld
			}
		}
	}
)
