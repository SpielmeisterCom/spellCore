define(
	'spell/shared/util/entity/datastructures/passIdMultiMap',
	[
		'spell/shared/util/entity/datastructures/multiMap'
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
