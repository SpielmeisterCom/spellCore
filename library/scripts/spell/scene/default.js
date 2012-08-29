define(
	'spell/scene/default',
	[
		'spell/shared/util/Events',

		'spell/functions'
	],
	function(
		Events,

		_
	) {
		'use strict'


		return {
			cleanup : {},
			init : function( spell, sceneEntityManager, sceneConfig ) {
				sceneEntityManager.createEntities( sceneConfig.entities )
			}
		}
	}
)
