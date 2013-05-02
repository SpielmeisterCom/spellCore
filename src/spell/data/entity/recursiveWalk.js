define(
	'spell/data/entity/recursiveWalk',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var walk = function( entityConfigs, iterator ) {
			var numEntityConfigs = entityConfigs.length

			for( var i = 0; i < numEntityConfigs; i++ ) {
				var entityConfig = entityConfigs[ i ]

				iterator( entityConfig )

				var entityConfigChildren = entityConfig.children

				if( !!entityConfigChildren && entityConfigChildren.length > 0 ) {
					walk( entityConfigChildren, iterator )
				}
			}
		}

		return function( arg0, iterator ) {
			var entityConfigs = _.isArray( arg0 ) ? arg0 : [ arg0 ]

			walk( entityConfigs, iterator )
		}
	}
)
