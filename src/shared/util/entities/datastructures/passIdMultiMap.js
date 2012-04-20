define(
	'spell/shared/util/entities/datastructures/passIdMultiMap',
	[
		'spell/shared/util/entities/datastructures/multiMap'
	],
	function(
		multiMap
	) {
		'use strict'


		return multiMap(
			function( entity ) {
				return entity.renderData.pass
			}
		)
	}
)
