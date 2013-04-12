define(
	'spell/config/entity/recursiveFind',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var find = function( entityConfigs, iterator ) {
			var numEntityConfigs = entityConfigs.length,
				result

			for( var i = 0; i < numEntityConfigs; i++ ) {
				var entityConfig = entityConfigs[ i ]

				result = iterator( entityConfig )

				if( result ) {
					return result
				}

				var children = entityConfig.children

				if( children &&
					children.length > 0 ) {

					return find( children, iterator )
				}
			}
		}

		return function( arg0, iterator ) {
			var entityConfigs = _.isArray( arg0 ) ? arg0 : [ arg0 ]

			return find( entityConfigs, iterator )
		}
	}
)
