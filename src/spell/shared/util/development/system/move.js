define(
	'spell/shared/util/development/system/move',
	[
		'spell/shared/util/createId'
	],
	function(
		createId
	) {
		'use strict'


		return function( spell, payload ) {
			spell.sceneManager.moveSystem( payload.systemId, payload.srcExecutionGroupId, payload.dstExecutionGroupId, payload.dstIndex )
		}
	}
)
