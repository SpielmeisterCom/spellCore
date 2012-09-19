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
			init : function( spell, EntityManager, sceneConfig ) {
				EntityManager.createEntities( sceneConfig.entities )
			}
		}
	}
)
