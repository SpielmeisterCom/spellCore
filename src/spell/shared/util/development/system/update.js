define(
	'spell/shared/util/development/system/update',
	[
		'spell/shared/util/createId'
	],
	function(
		createId
	) {
		'use strict'


		return function( spell, payload ) {
			var definition = payload.definition

			spell.templateManager.add( definition, true )
			spell.sceneManager.restartSystem(
				createId( definition.namespace, definition.name ),
				payload.executionGroupId,
				payload.systemConfig
			)
		}
	}
)
