define(
	'spell/shared/util/entityConfig/walk',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var walkEntityConfig = function( entityConfigs, iterator ) {
			var numEntityConfigs = entityConfigs.length

			for( var i = 0; i < numEntityConfigs; i++ ) {
				var entityConfig = entityConfigs[ i ]

				iterator( entityConfig )

				var entityConfigChildren = entityConfig.children

				if( !entityConfigChildren || entityConfigChildren.length === 0 ) return

				walkEntityConfig( entityConfigChildren, iterator )
			}
		}

		return function( arg0, iterator ) {
			var entityConfigs = _.isArray( arg0 ) ? arg0 : [ arg0 ]

			return walkEntityConfig( entityConfigs, iterator )
		}
	}
)
