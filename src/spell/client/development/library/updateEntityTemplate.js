define(
	'spell/client/development/library/updateEntityTemplate',
	function() {
		'use strict'


		return function( spell, payload ) {
			spell.entityManager.updateEntityTemplate( payload.definition )
		}
	}
)
