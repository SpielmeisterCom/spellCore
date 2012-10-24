define(
	'spell/shared/util/development/system/add',
	[
		'spell/shared/util/createId'
	],
	function(
		createId
	) {
		'use strict'


		return function( spell, payload ) {
			spell.sceneManager.addSystem( payload.systemId, payload.executionGroupId, payload.systemConfig )
		}
	}
)
