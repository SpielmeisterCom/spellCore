define(
	'spell/shared/util/development/system/remove',
	[
		'spell/shared/util/createId'
	],
	function(
		createId
	) {
		'use strict'


		return function( spell, payload ) {
			spell.sceneManager.removeSystem( payload.systemId, payload.executionGroupId )
		}
	}
)
